from pathlib import Path
import re
import sqlite3
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_FILE = PROJECT_ROOT / "data" / "DB_master_reviews_with_sentiment.csv"
DB_PATHS = [PROJECT_ROOT / "thesis.db", PROJECT_ROOT / "data" / "thesis.db"]

aspect_dictionary = {
    "Product Quality": [
        "coffee",
        "matcha",
        "latte",
        "espresso",
        "sikwate",
        "barako",
        "pandesal",
        "pastry",
        "cake",
        "taste",
        "lami",
        "masarap",
        "lasa",
        "tam-is",
        "umay",
        "lamiay",
        "food",
        "drinks",
        "lasaw",
        "tab-ang",
        "init",
        "bugnaw",
    ],
    "Customer Service": [
        "barista",
        "staff",
        "crew",
        "cashier",
        "service",
        "mabait",
        "accommodating",
        "paspas",
        "dugay",
        "maayos",
        "attitude",
        "buotan",
        "snob",
        "friendly",
    ],
    "Ambiance and Atmosphere": [
        "ambiance",
        "vibe",
        "aesthetic",
        "chill",
        "quiet",
        "noisy",
        "saba",
        "music",
        "muni-muni",
        "chika",
        "tropa",
        "atmosphere",
        "crowded",
        "ig-worthy",
        "instagrammable",
        "tambay",
    ],
    "Facilities and Amenities": [
        "wifi",
        "internet",
        "connection",
        "socket",
        "outlet",
        "plug",
        "cr",
        "restroom",
        "comfort room",
        "aircon",
        "tables",
        "chairs",
        "space",
        "study",
        "tuon",
        "work",
        "laptop",
        "kusog",
        "igang",
    ],
    "Price and Value": [
        "price",
        "value",
        "mahal",
        "barato",
        "sulit",
        "tipid",
        "overpriced",
        "affordable",
        "sayang",
        "budget",
        "expensive",
        "cheap",
        "pricy",
    ],
    "Store Operations and Accessibility": [
        "parking",
        "location",
        "accessible",
        "layo",
        "malayo",
        "duol",
        "hours",
        "open",
        "close",
        "traffic",
    ],
}

compiled_patterns = {
    aspect: re.compile(
        r"\b(?:" + "|".join(map(re.escape, kw)) + r")\b", re.IGNORECASE
    )
    for aspect, kw in aspect_dictionary.items()
}


def extract_aspects(text):
    if not isinstance(text, str) or not text.strip():
        return []
    return [
        aspect for aspect, pat in compiled_patterns.items() if pat.search(text)
    ]


def seed():
    if not DATA_FILE.exists():
        raise FileNotFoundError(f"Dataset not found at {DATA_FILE}")

    print(f"Reading dataset: {DATA_FILE}...")
    df = pd.read_csv(DATA_FILE)
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]

    null_counts = df.isnull().sum()
    if null_counts.any():
        print("Missing values per column:\n", null_counts[null_counts > 0])

    duplicates = df.duplicated(subset=["place_name", "review_text"]).sum()
    print(f"Duplicate reviews: {duplicates}")

    # Extract granular aspect mentions per review
    print("Extracting aspect mentions for BI insights...")
    text_df = df.dropna(subset=["review_text"]).copy()
    text_df["aspect"] = text_df["review_text"].apply(extract_aspects)
    aspect_mentions_df = (
        text_df[text_df["aspect"].map(len) > 0]
        .explode("aspect")[["place_name", "shop_type", "rating", "sentiment", "aspect", "review_text"]]
        .reset_index(drop=True)
    )
    print(f"Extracted {len(aspect_mentions_df):,} aspect-review pairs.")

    for db_path in DB_PATHS:
        print(f"Writing to SQLite database: {db_path}...")
        conn = sqlite3.connect(db_path)
        df.to_sql("reviews", conn, if_exists="replace", index=False)
        aspect_mentions_df.to_sql(
            "aspect_mentions", conn, if_exists="replace", index=False
        )

        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_reviews_place ON reviews(place_name)"
        )
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_reviews_sentiment ON reviews(sentiment)"
        )
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_aspect_name ON aspect_mentions(aspect)"
        )
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_aspect_sentiment ON aspect_mentions(sentiment)"
        )
        conn.close()

    print("SQLite database successfully seeded with reviews and aspect_mentions.")


if __name__ == "__main__":
    seed()
