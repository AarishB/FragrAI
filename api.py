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

# ── Import the recommendation engine ─────────────────────────────────────────
from fragrai_llm import get_llm_enhanced_recommendations, enrich_recommendation_with_gpt

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
    return {"status": "ok", "fragrances_loaded": len(df)}


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

    try:
        results, extraction_info = get_llm_enhanced_recommendations(
            user_answers=user_answers,
            df=df,
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
                enriched = enrich_recommendation_with_gpt(row, api_key)
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
