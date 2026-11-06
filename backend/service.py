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


@bentoml.service(resources={"cpu": "2"}, traffic={"timeout": 10})
class AbsaService:

    def __init__(self):
        print(f"Loading XLM-RoBERTa model from: {MODEL_PATH}")
        self.tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
        self.model = XLMRobertaForSequenceClassification.from_pretrained(MODEL_PATH)
        self.model.eval()
        self.id2label = {0: "POSITIVE", 1: "NEUTRAL", 2: "NEGATIVE"}

    @bentoml.api
    def predict(self, text: str, target_aspect: str = "") -> list[dict]:
        sentences = [
            s.strip()
            for s in re.split(r"[.!?\n]+", text)
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
                # Format matches Phase 3: [Review Text] (Premise) + [Target Aspect] (Hypothesis)
                enc = self.tokenizer(
                    sentence,
                    aspect,
                    truncation=True,
                    padding="max_length",
                    max_length=160,
                    return_tensors="pt",
                )

                with torch.no_grad():
                    logits = self.model(**enc).logits
                    probs = torch.softmax(logits, dim=-1)[0]
                    pred_idx = int(torch.argmax(probs))
                    pred_label = self.id2label[pred_idx]
                    confidence = float(probs[pred_idx])

                results.append({
                    "sentence": sentence,
                    "aspect": aspect,
                    "target_aspect": aspect,
                    "label": pred_label,
                    "sentiment": pred_label,
                    "score": round(confidence, 4),
                })

        return results