from pathlib import Path
import re
import bentoml
import torch
from transformers import AutoTokenizer, XLMRobertaForSequenceClassification

MODEL_PATH = str(
    Path(__file__).resolve().parent / "xlmr_absa_weighted"
)

aspect_dictionary = {
    "Product Quality": [
        "coffee", "matcha", "latte", "espresso", "sikwate", "barako",
        "pandesal", "pastry", "cake", "taste", "lami", "masarap", "lasa",
        "pait", "tam-is", "umay", "lamiay", "food", "drinks", "isog",
        "lasaw", "tab-ang", "luod", "puol", "init", "bugnaw",
    ],
    "Customer Service": [
        "barista", "staff", "crew", "cashier", "service", "mabait", "sungit",
        "accommodating", "suplada", "paspas", "dugay", "maayos", "attitude",
        "hinay", "buotan", "snob", "taray", "friendly",
    ],
    "Ambiance and Atmosphere": [
        "ambiance", "vibe", "aesthetic", "chill", "quiet", "noisy", "saba",
        "sabaan", "mingaw", "music", "tugtog", "muni-muni", "chika", "tropa",
        "atmosphere", "crowded", "samok", "ig-worthy", "instagrammable",
        "ngitngit", "tambay",
    ],
    "Facilities and Amenities": [
        "wifi", "internet", "connection", "socket", "outlet", "plug", "cr",
        "restroom", "comfort room", "aircon", "tables", "chairs", "space",
        "study", "tuon", "work", "laptop", "hina", "kusog", "tugnaw", "igang",
    ],
    "Price and Value": [
        "price", "value", "mahal", "barato", "sulit", "tipid", "overpriced",
        "affordable", "sayang", "budget", "expensive", "cheap", "kamahal", "pricy",
    ],
    "Store Operations and Accessibility": [
        "parking", "parkingan", "location", "accessible", "layo", "malayo",
        "duol", "hours", "open", "close", "traffic", "tago",
    ],
}

compiled_patterns = {
    aspect: re.compile(
        r"\b(?:" + "|".join(map(re.escape, kw)) + r")\b", re.IGNORECASE
    )
    for aspect, kw in aspect_dictionary.items()
}

# Lexicon calibration markers to counter Phase 5 synthetic Taglish/Bislish negative skew
POS_MARKERS = {
    "masarap", "lami", "lamiay", "sulit", "mabait", "buotan", "paspas",
    "maayos", "friendly", "accommodating", "perfect", "good", "great",
    "best", "nice", "chill", "quiet", "kusog", "barato", "affordable",
    "duol", "accessible", "clean", "spacious", "worth", "love", "solid",
    "aesthetic", "ig-worthy", "instagrammable", "cozy", "refreshing",
    "malinis", "mura", "sarap", "goods", "okay", "ok", "ganahan", "nindot",
    "humot", "swak", "bango", "relaxing", "comfy", "comfortable"
}

NEG_MARKERS = {
    "pait", "tam-is", "umay", "lasaw", "tab-ang", "luod", "puol", "sungit",
    "suplada", "dugay", "hinay", "snob", "taray", "noisy", "saba", "sabaan",
    "crowded", "samok", "ngitngit", "hina", "igang", "mahal", "overpriced",
    "sayang", "expensive", "kamahal", "pricy", "layo", "malayo", "traffic",
    "tago", "bad", "poor", "slow", "dirty", "rude", "cramped", "mainit",
    "init", "ingay", "bagal", "pangit", "bati", "mahina", "kulang"
}

NEGATION_WORDS = {
    "hindi", "dili", "di", "wala", "wa", "walay", "way", "never", "not", "no", "none"
}


@bentoml.service(resources={"cpu": "2"}, traffic={"timeout": 10})
class AbsaService:

    def __init__(self):
        print(f"Loading XLM-RoBERTa model from: {MODEL_PATH}")
        self.tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
        self.model = XLMRobertaForSequenceClassification.from_pretrained(MODEL_PATH)
        self.model.eval()
        self.id2label = {0: "POSITIVE", 1: "NEUTRAL", 2: "NEGATIVE"}

    def _calibrate_logits(self, sentence: str, logits: torch.Tensor) -> torch.Tensor:
        """
        Neutralizes the Phase 5 synthetic negative bias on Taglish/Bislish inputs
        and handles local double negatives (e.g. 'wa gi tipid', 'dili mahal').
        """
        adj_logits = logits.clone()
        words = re.findall(r"\b[\w-]+\b", sentence.lower())
        word_set = set(words)

        has_pos = bool(word_set & POS_MARKERS)
        has_neg = bool(word_set & NEG_MARKERS)
        has_negation = bool(word_set & NEGATION_WORDS)

        # Handle Bisaya/Tagalog double-negatives that mean POSITIVE (e.g., "wa gi tipid", "dili mahal", "hindi matamis")
        double_neg_pos = bool(
            re.search(
                r"\b(wa|wala|dili|di|hindi|not)\b\s+(?:gi\s+|nag\s+|masyado\s+|kaayo\s+)?\b(tipid|mahal|tam-is|matamis|saba|samok|dugay|luod|lasaw|pait|bad)\b",
                sentence.lower(),
            )
        )

        # Case 1: Clear positive words with no negative/negation words (e.g., "masarap yung matcha", "perfect for work ang place")
        # OR positive double-negative ("wa gi tipid")
        if (has_pos and not has_neg and not has_negation) or double_neg_pos:
            if adj_logits[0, 2] > adj_logits[0, 0]:
                adj_logits[0, 0], adj_logits[0, 2] = (
                    adj_logits[0, 2].clone(),
                    adj_logits[0, 0].clone(),
                )

        # Case 2: Clear negated positive (e.g., "hindi masarap", "dili lami", "walay wifi") -> Force NEGATIVE (index 2)
        elif has_pos and has_negation and not double_neg_pos:
            if adj_logits[0, 0] > adj_logits[0, 2]:
                adj_logits[0, 2], adj_logits[0, 0] = (
                    adj_logits[0, 0].clone(),
                    adj_logits[0, 2].clone(),
                )

        # Case 3: Unambiguous negative keywords without negation ("mahal kaayo", "saba ang place") -> Ensure NEGATIVE (index 2)
        elif has_neg and not has_pos and not has_negation:
            if adj_logits[0, 0] > adj_logits[0, 2]:
                adj_logits[0, 2], adj_logits[0, 0] = (
                    adj_logits[0, 0].clone(),
                    adj_logits[0, 2].clone(),
                )

        return adj_logits

    @bentoml.api
    def predict(self, text: str, target_aspect: str = "") -> list[dict]:
        # Split by clause/sentence boundaries (including 'pero' / 'but' so mixed reviews split cleanly!)
        sentences = [
            s.strip()
            for s in re.split(r"[.!?\n]+|\b(?:pero|kaso|kaya lang|but|however|although|though)\b", text, flags=re.IGNORECASE)
            if s.strip()
        ]
        if not sentences:
            sentences = [text.strip()]

        results = []

        for sentence in sentences:
            if target_aspect and target_aspect in aspect_dictionary:
                matched_aspects = [target_aspect]
            else:
                matched_aspects = [
                    aspect
                    for aspect, pat in compiled_patterns.items()
                    if pat.search(sentence)
                ]
                if not matched_aspects:
                    matched_aspects = ["Product Quality"]

            for aspect in matched_aspects:
                # FIXED ORDER: sentence first (Premise), aspect second (Hypothesis)
                enc = self.tokenizer(
                    sentence,
                    aspect,
                    truncation=True,
                    padding="max_length",
                    max_length=160,
                    return_tensors="pt",
                )

                with torch.no_grad():
                    raw_logits = self.model(**enc).logits
                    calibrated_logits = self._calibrate_logits(sentence, raw_logits)
                    probs = torch.softmax(calibrated_logits, dim=-1)[0]
                    pred_idx = int(torch.argmax(probs))
                    pred_label = self.id2label[pred_idx]
                    confidence = float(probs[pred_idx])

                results.append({
                    "sentence": sentence,
                    "aspect": aspect,
                    "target_aspect": aspect,  # Added both keys so your UI badge renders properly
                    "label": pred_label,
                    "sentiment": pred_label,
                    "score": round(confidence, 4),
                })

        return results