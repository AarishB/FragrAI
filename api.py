"""
FragrAI FastAPI Backend
Run: uvicorn api:app --host 0.0.0.0 --port 8000 --reload
"""

import os
import ast
import re
import joblib
import numpy as np
import pandas as pd
import scipy.sparse as sp
from pathlib import Path
from collections import Counter
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import OneHotEncoder
from typing import Optional
import json
import threading

load_dotenv()

# ── Data / model paths (all relative to this file's directory) ────────────────
BASE_DIR          = Path(__file__).parent
DF_CACHE_PATH     = str(BASE_DIR / "fragrai_df_cache.pkl")
TFIDF_CACHE_PATH  = str(BASE_DIR / "fragrai_tfidf.joblib")
MATRIX_CACHE_PATH = str(BASE_DIR / "fragrai_X_tfidf.npz")

# ── Replicate the preprocessing helpers from the notebook ────────────────────

scent_descriptors = {
    'woody','fresh','floral','spicy','citrus','sweet','warm','cool',
    'aromatic','oriental','aquatic','marine','green','fruity','powdery',
    'amber','musky','earthy','smoky','leathery','vanilla','creamy',
    'balsamic','resinous','herbal','minty','animalic','aldehydic',
    'gourmand','ozonic','metallic','soapy','clean','dirty','sharp',
    'soft','rich','light','heavy','bright','dark','mysterious',
    'seductive','elegant','bold','subtle','intense','delicate',
    'silky','velvety','smooth','rough','dry','wet','airy','dense',
    'chypre','fougere','tobacco','incense','oud','leather','musk',
    'patchouli','vetiver','sandalwood','cedar','bergamot','lavender',
    'rose','jasmine','iris','neroli','tonka','cocoa',
}

REVIEW_STOPWORDS = {
    'the','a','an','and','or','but','in','on','at','to','for','of','with',
    'by','from','is','it','its','as','was','are','this','that','have','has',
    'been','not','no','very','so','my','me','you','he','she','we','they',
    'what','which','who','how','when','where','also','just','one','can',
    'will','would','could','should','get','got','nice','good','great','best',
    'really','more','some','than','then','them','their','there','were','had',
    'does','did','into','out','about','all','well','even','still','used',
    'make','made','other','your','much','many','only','way','come','know',
    'over','back','after','first','never','spray','lasts','wearing','wore',
    'bought','tried','love','hate','think','find','found','like',
}

_WOMEN_PATTERN = re.compile(r'\b(women|woman|female|lady|femme)\b')
_MEN_PATTERN   = re.compile(r'\b(men|man|male|homme)\b')


def parse_reviews(r):
    try:
        parsed = ast.literal_eval(r)
        return parsed if isinstance(parsed, list) else []
    except Exception:
        return []


def extract_weighted_keywords(description):
    if pd.isna(description):
        return []
    words = description.lower().split()
    weighted = []
    for word in words:
        weighted.append(word)
        if word in scent_descriptors:
            weighted.extend([word, word])
    return weighted


def extract_review_keywords(reviews_list):
    if not reviews_list:
        return []
    all_text = ' '.join(reviews_list).lower()
    keywords = set()
    for word in all_text.split():
        clean = word.strip('.,!?;:\'"()-')
        if clean in scent_descriptors:
            keywords.add(clean)
    return list(keywords)


def extract_rich_review_keywords(reviews_list, max_words=40):
    if not reviews_list:
        return []
    all_text = ' '.join(reviews_list).lower()
    words = re.findall(r'[a-z]{4,}', all_text)
    seen, keywords = set(), []
    for word in words:
        if word not in REVIEW_STOPWORDS and word not in seen:
            seen.add(word)
            keywords.append(word)
            if len(keywords) >= max_words:
                break
    return keywords


def extract_gender(title):
    if pd.isna(title):
        return 'unisex'
    title_lower = str(title).lower()
    has_women = bool(_WOMEN_PATTERN.search(title_lower))
    has_men   = bool(_MEN_PATTERN.search(title_lower))
    if has_women and has_men:
        return 'unisex'
    elif has_women:
        return 'feminine'
    elif has_men:
        return 'masculine'
    return 'unisex'


def extract_notes_for_keywords(df, keywords, top_n=25):
    pattern = '|'.join(re.escape(kw.lower()) for kw in keywords)
    mask = df['description_lower'].str.contains(pattern, na=False)
    all_notes = []
    for notes_list in df.loc[mask, 'notes']:
        if isinstance(notes_list, list):
            all_notes.extend([n.lower().strip() for n in notes_list if n])
    return [note for note, _ in Counter(all_notes).most_common(top_n)]


def build_dynamic_note_profile(seed_notes, keywords, df, top_n=25):
    final_notes = [n.lower().strip() for n in seed_notes]
    dynamic_notes = extract_notes_for_keywords(df, keywords, top_n=top_n * 2)
    for note in dynamic_notes:
        if note not in final_notes:
            final_notes.append(note)
    return final_notes[:top_n]


# ── Load / build all model artifacts at startup ───────────────────────────────

print("Loading FragrAI model...")

df = pd.read_pickle(DF_CACHE_PATH)
df['gender'] = df['title'].apply(extract_gender)
print(f"  Dataset: {len(df):,} fragrances")

df['note_string'] = df['combined_notes_plus'].apply(lambda lst: ' '.join(lst))
tfidf   = joblib.load(TFIDF_CACHE_PATH)
X_tfidf = sp.load_npz(MATRIX_CACHE_PATH)
print(f"  TF-IDF: {X_tfidf.shape[1]} features")

season_encoder  = OneHotEncoder(sparse_output=False)
season_vectors  = season_encoder.fit_transform(df[['season']])
X_season_sparse = sp.csr_matrix(season_vectors)

note_weight, season_weight = 0.85, 0.15
X_combined = sp.hstack(
    [X_tfidf * note_weight, X_season_sparse * season_weight], format='csr'
)

_term_freqs      = np.asarray(X_tfidf.sum(axis=0)).ravel()
_sorted_indices  = _term_freqs.argsort()[::-1]
scent_vocabulary = [tfidf.get_feature_names_out()[i] for i in _sorted_indices]

print("  Note profiles building...")
PERSONALITY_NOTES = {
    'Bold & Adventurous':   build_dynamic_note_profile(['oud','leather','tobacco','pepper'],   ['bold','intense','strong','powerful','woody','spicy'], df),
    'Calm & Thoughtful':    build_dynamic_note_profile(['lavender','tea','musk','sandalwood'], ['calm','soft','gentle','subtle','peaceful','clean'],   df),
    'Energetic & Social':   build_dynamic_note_profile(['citrus','bergamot','grapefruit','mint'],['fresh','energetic','vibrant','bright','citrus'],    df),
    'Creative & Open-minded': build_dynamic_note_profile(['jasmine','incense','patchouli','fig'],['unique','artistic','creative','exotic','oriental'], df),
}

print("  Ready.\n")

# ── Budget filtering ──────────────────────────────────────────────────────────

# Brands that almost always cost $200+
_ULTRA_LUXURY = {
    'creed', 'xerjoff', 'roja', 'roja parfums', 'clive christian',
    'amouage', 'bond no. 9', 'fueguia 1833',
}
# Brands typically $100-$200
_LUXURY = {
    'tom ford', 'maison margiela', 'byredo', 'le labo', 'diptyque',
    'maison francis kurkdjian', 'initio', 'parfums de marly', 'nishane',
    'serge lutens', 'frederic malle', 'memo paris', 'penhaligon',
    'acqua di parma', 'jo malone', 'orto parisi', 'histoires de parfums',
}
# Brands typically $80-$150
_DESIGNER = {
    'chanel', 'dior', 'yves saint laurent', 'hermès', 'hermes', 'prada',
    'gucci', 'versace', 'armani', 'burberry', 'dolce', 'gabbana', 'givenchy',
    'bvlgari', 'valentino', 'bottega veneta', 'lancome', 'cartier',
    'marc jacobs', 'balenciaga', 'loewe',
}

def _filter_by_budget(df_in: pd.DataFrame, budget_str: str) -> pd.DataFrame:
    bl = budget_str.lower()
    if bl in ('$200+', 'no limit', ''):
        return df_in
    designers = df_in['designer'].str.lower().fillna('')
    if bl == 'under $50':
        exclude = _ULTRA_LUXURY | _LUXURY | _DESIGNER
    elif bl == '$50-$100':
        exclude = _ULTRA_LUXURY | _LUXURY
    else:  # $100-$200
        exclude = _ULTRA_LUXURY
    mask = designers.apply(lambda d: not any(brand in d for brand in exclude))
    filtered = df_in[mask]
    return filtered if len(filtered) >= 50 else df_in  # fallback if too few results

# ── Import the recommendation engine ─────────────────────────────────────────
from fragrai_llm import get_llm_enhanced_recommendations, enrich_recommendation_with_gpt

# ── Enrichment cache (persisted to disk) ─────────────────────────────────────
ENRICH_CACHE_PATH = BASE_DIR / "enrichment_cache.json"
_enrich_lock = threading.Lock()

def _load_enrich_cache() -> dict:
    if ENRICH_CACHE_PATH.exists():
        try:
            return json.loads(ENRICH_CACHE_PATH.read_text(encoding="utf-8"))
        except Exception:
            return {}
    return {}

def _save_enrich_cache(cache: dict):
    ENRICH_CACHE_PATH.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")

enrich_cache = _load_enrich_cache()
print(f"  Enrichment cache: {len(enrich_cache)} fragrances pre-enriched")


def get_enriched(row, api_key: str) -> dict:
    """Return cached enrichment or call GPT and cache the result."""
    key = f"{row.get('title', '')}|{row.get('designer', '')}"
    with _enrich_lock:
        if key in enrich_cache:
            return enrich_cache[key]
    enriched = enrich_recommendation_with_gpt(row, api_key)
    with _enrich_lock:
        enrich_cache[key] = enriched
        _save_enrich_cache(enrich_cache)
    return enriched

# ── FastAPI app ───────────────────────────────────────────────────────────────

app = FastAPI(title="FragrAI API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten to your friend's URL in production
    allow_methods=["*"],
    allow_headers=["*"],
)


class RecommendRequest(BaseModel):
    gender: str          # "Male" | "Female" | "Non-binary" | "Prefer not to say"
    age_range: str       # "15-24" | "25-34" | "35-44" | "45-54" | "55+"
    season: str          # "Spring" | "Summer" | "Fall" | "Winter" | "Any"
    use_case: str        # "Work/Office" | "Dates/Romantic" | "Casual everyday" | "Special events" | "Athletic/Active"
    budget: str          # "Under $50" | "$50-$100" | "$100-$200" | "$200+" | "No limit"
    description: str     # free-text description
    enrich: Optional[bool] = True   # set False to skip GPT enrichment (faster)


@app.get("/health")
def health():
    return {"status": "ok", "fragrances_loaded": len(df), "enrichment_cached": len(enrich_cache)}


@app.post("/recommend")
def recommend(req: RecommendRequest):
    user_answers = {
        "gender":      req.gender,
        "age_range":   req.age_range,
        "season":      req.season,
        "use_case":    req.use_case,
        "budget":      req.budget,
        "description": req.description,
    }

    df_filtered = _filter_by_budget(df, req.budget)

    try:
        results, extraction_info = get_llm_enhanced_recommendations(
            user_answers=user_answers,
            df=df_filtered,
            tfidf=tfidf,
            X_tfidf=X_tfidf,
            scent_vocabulary=scent_vocabulary,
            top_n=3,
            use_llm=True,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation error: {e}")

    api_key = os.getenv("OPENAI_API_KEY")
    recommendations = []

    for _, row in results.iterrows():
        notes = row.get("notes", [])
        rec = {
            "name":       str(row.get("title", "Unknown")),
            "designer":   str(row.get("designer", "Unknown")),
            "match_score": str(row.get("match_score", "N/A")),
            "notes":      notes[:8] if isinstance(notes, list) else [],
            "description": str(row.get("description", "")) if pd.notna(row.get("description")) else "",
            "longevity":  "Moderate (4-6 hours)",
            "price":      "Price varies by retailer",
            "analysis":   "",
            "dupes":      [],
        }

        if req.enrich and api_key:
            try:
                enriched = get_enriched(row, api_key)
                rec["longevity"] = enriched.get("longevity", rec["longevity"])
                rec["price"]     = enriched.get("price_usd", rec["price"])
                rec["analysis"]  = enriched.get("notes_analysis", "")
                rec["dupes"]     = enriched.get("dupes", [])
            except Exception:
                pass  # fall back to defaults silently

        recommendations.append(rec)

    return {
        "recommendations": recommendations,
        "profile": {
            "top_notes":      extraction_info.get("top_3_notes", []),
            "intensity":      extraction_info.get("intensity", "moderate"),
            "personality":    extraction_info.get("personality_type", "balanced"),
            "reasoning":      extraction_info.get("reasoning", ""),
        }
    }


# ── Feedback ──────────────────────────────────────────────────────────────────

FEEDBACK_PATH = BASE_DIR / "feedback_log.json"
_feedback_lock = threading.Lock()


class FeedbackRequest(BaseModel):
    fragrance_name: str
    designer: str
    liked: bool          # True = thumbs up, False = thumbs down
    user_description: str = ""


@app.post("/feedback")
def feedback(req: FeedbackRequest):
    entry = {
        "fragrance_name":   req.fragrance_name,
        "designer":         req.designer,
        "liked":            req.liked,
        "user_description": req.user_description,
    }
    with _feedback_lock:
        log = []
        if FEEDBACK_PATH.exists():
            try:
                log = json.loads(FEEDBACK_PATH.read_text(encoding="utf-8"))
            except Exception:
                log = []
        log.append(entry)
        FEEDBACK_PATH.write_text(json.dumps(log, ensure_ascii=False, indent=2), encoding="utf-8")
    return {"status": "ok", "total_feedback": len(log)}
