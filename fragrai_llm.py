
import os
import re
import json
import textwrap
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Optional, Tuple

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    print("⚠️  OpenAI not available, will use fallback mode")


# === KNOWN FRAGRANCES → their core notes ===
KNOWN_FRAGRANCES = {
    'stronger with you':     ['tonka', 'vanilla', 'cardamom', 'amber', 'musk', 'sweet', 'warm', 'caramel'],
    'stronger with you intensely': ['tonka', 'vanilla', 'caramel', 'amber', 'musk', 'sweet', 'warm', 'gourmand'],
    'bleu de chanel':        ['citrus', 'cedar', 'sandalwood', 'grapefruit', 'fresh', 'woody', 'amber'],
    'sauvage':               ['bergamot', 'pepper', 'cedar', 'fresh', 'lavender', 'woody', 'amber'],
    'la nuit de lhomme':     ['cedar', 'cardamom', 'lavender', 'warm', 'spicy', 'sweet', 'coumarin'],
    'dior homme intense':    ['iris', 'lavender', 'amber', 'vanilla', 'cedar', 'woody'],
    'aventus':               ['bergamot', 'pineapple', 'musk', 'birch', 'fresh', 'fruity', 'woody', 'smoky'],
    'oud wood':              ['oud', 'sandalwood', 'amber', 'tonka', 'woody', 'warm', 'rosewood'],
    'lost cherry':           ['cherry', 'rose', 'jasmine', 'warm', 'sweet', 'fruity', 'almond'],
    'black orchid':          ['patchouli', 'vanilla', 'amber', 'dark', 'rich', 'sweet', 'incense'],
    'good girl':             ['jasmine', 'tuberose', 'cocoa', 'tonka', 'vanilla', 'sweet', 'floral'],
    'acqua di gio':          ['marine', 'bergamot', 'jasmine', 'cedar', 'aquatic', 'fresh'],
    'baccarat rouge 540':    ['jasmine', 'saffron', 'cedar', 'sweet', 'amber', 'woody', 'ambergris'],
    'tobacco vanille':       ['tobacco', 'vanilla', 'tonka', 'cocoa', 'spicy', 'sweet', 'warm'],
    '1 million':             ['orange', 'rose', 'patchouli', 'amber', 'leather', 'sweet', 'spicy'],
    'the one':               ['tobacco', 'vanilla', 'amber', 'ginger', 'warm', 'sweet', 'oriental'],
    'invictus':              ['grapefruit', 'marine', 'fresh', 'aquatic', 'musk', 'guaiac wood'],
    'angel':                 ['patchouli', 'vanilla', 'caramel', 'sweet', 'gourmand', 'honey'],
    'armani code':           ['bergamot', 'lemon', 'tonka', 'vanilla', 'warm', 'woody', 'guaiac wood'],
    'ysl libre':             ['lavender', 'vanilla', 'floral', 'warm', 'sweet', 'orange blossom'],
    'portrait of a lady':    ['rose', 'patchouli', 'frankincense', 'amber', 'floral', 'rich'],
    'narciso rodriguez':     ['musk', 'cedar', 'iris', 'soft', 'powdery', 'clean'],
    'black xs':              ['amber', 'caramel', 'patchouli', 'sweet', 'dark'],
    'spicebomb':             ['pepper', 'tobacco', 'leather', 'spicy', 'warm', 'vetiver'],
    'fahrenheit':            ['violet', 'leather', 'cedar', 'vetiver', 'warm', 'woody'],
    'cool water':            ['marine', 'mint', 'lavender', 'fresh', 'aquatic', 'musk'],
    'polo black':            ['mango', 'amber', 'sweet', 'woody', 'warm'],
    'versace eros':          ['mint', 'vanilla', 'apple', 'amber', 'fresh', 'sweet', 'woody'],
    'dior sauvage':          ['bergamot', 'pepper', 'cedar', 'fresh', 'lavender', 'woody', 'amber'],
    'ysl y':                 ['apple', 'bergamot', 'sage', 'cedar', 'fresh', 'woody'],
    'paco rabanne phantom':  ['lavender', 'vanilla', 'musk', 'sweet', 'soft', 'warm'],
}

# === PHYSICAL TRAIT & PERSONALITY → notes mapping ===
TRAIT_NOTE_MAPPINGS = {
    # Skin tone (warm-undertoned skin projects warm/oriental notes better)
    'indian':        ['amber', 'vanilla', 'warm', 'oriental', 'spicy', 'tonka'],
    'south asian':   ['amber', 'vanilla', 'warm', 'oriental', 'spicy', 'tonka'],
    'brown':         ['amber', 'vanilla', 'warm', 'oriental', 'tonka'],
    'dark':          ['oud', 'amber', 'vanilla', 'oriental', 'warm', 'intense'],
    'olive':         ['amber', 'vanilla', 'spicy', 'oriental', 'warm'],
    'tan':           ['amber', 'vanilla', 'warm', 'cedar', 'spicy'],
    'fair':          ['citrus', 'marine', 'lavender', 'light', 'fresh'],
    'light skin':    ['citrus', 'marine', 'lavender', 'light', 'fresh'],
    'pale':          ['citrus', 'marine', 'lavender', 'light', 'fresh'],
    # Personality
    'extrovert':     ['fresh', 'bold', 'citrus', 'bright', 'intense'],
    'introvert':     ['soft', 'subtle', 'musk', 'clean', 'delicate'],
    'shy':           ['soft', 'delicate', 'light', 'clean', 'subtle'],
    'confident':     ['bold', 'intense', 'leather', 'oud', 'strong'],
    'outgoing':      ['fresh', 'citrus', 'bold', 'bright'],
    'reserved':      ['soft', 'musk', 'subtle', 'clean'],
    # Scent preferences from context
    'stand out':     ['intense', 'bold', 'amber', 'oud', 'leather'],
    'not too much':  ['musk', 'soft', 'subtle', 'light', 'fresh'],
    'compliment':    ['sweet', 'vanilla', 'tonka', 'amber', 'musk'],
    'versatile':     ['fresh', 'bergamot', 'amber', 'cedar', 'musk'],
    'casual':        ['fresh', 'citrus', 'cedar', 'clean', 'musk'],
    'romantic':      ['vanilla', 'musk', 'amber', 'rose', 'tonka'],
    'date':          ['vanilla', 'musk', 'amber', 'rose', 'tonka', 'seductive'],
    'office':        ['lavender', 'cedar', 'bergamot', 'clean', 'subtle'],
    'gym':           ['mint', 'citrus', 'fresh', 'marine', 'clean'],
    # Strength
    'skin scent':    ['musk', 'clean', 'soft', 'light'],
    'moderate':      ['musk', 'amber', 'cedar', 'soft'],
    'strong':        ['oud', 'amber', 'leather', 'intense', 'bold'],
    'subtle':        ['musk', 'clean', 'soft', 'light', 'delicate'],
}

# Scent terms for vocabulary filtering
SCENT_TERMS = {
    'woody', 'fresh', 'floral', 'spicy', 'citrus', 'sweet', 'warm', 'cool',
    'aromatic', 'oriental', 'aquatic', 'marine', 'green', 'fruity', 'powdery',
    'amber', 'musky', 'earthy', 'smoky', 'leathery', 'vanilla', 'creamy',
    'gourmand', 'ozonic', 'clean', 'rich', 'light', 'heavy', 'bright', 'dark',
    'seductive', 'bold', 'subtle', 'intense', 'soft', 'dry', 'airy', 'chypre',
    'tobacco', 'incense', 'oud', 'leather', 'musk', 'patchouli', 'vetiver',
    'sandalwood', 'cedar', 'bergamot', 'lavender', 'rose', 'jasmine', 'iris',
    'neroli', 'tonka', 'cocoa', 'caramel', 'pepper', 'ginger', 'lemon',
    'orange', 'grapefruit', 'lime', 'mint', 'basil', 'cardamom', 'cinnamon',
    'nutmeg', 'clove', 'frankincense', 'myrrh', 'benzoin', 'moss', 'oakmoss',
    'ambergris', 'fig', 'peach', 'apple', 'cherry', 'raspberry', 'plum',
    'resinous', 'balsamic', 'herbal', 'minty', 'aldehydic',
}

# === BRAND TIER BOOST ===
# Tier 1: Major luxury / widely-recognised designer houses (+12% similarity boost)
TIER_1_BRANDS = {
    'dior', 'chanel', 'yves saint laurent', 'tom ford', 'giorgio armani',
    'versace', 'paco rabanne', 'viktor', 'creed', 'maison francis kurkdjian',
    'thierry mugler', 'mugler', 'jean paul gaultier', 'givenchy', 'guerlain',
    'hermes', 'cartier', 'bvlgari', 'bulgari', 'montblanc', 'hugo boss',
    'dolce', 'calvin klein', 'gucci', 'prada', 'burberry', 'valentino',
    'narciso rodriguez', 'frederic malle', 'le labo', 'byredo', 'diptyque',
    'jo malone', 'acqua di parma', 'amouage', 'xerjoff', 'initio',
    'parfums de marly', 'roja', 'serge lutens', 'kilian', 'carolina herrera',
    'lacoste', 'ralph lauren', 'davidoff', 'issey miyake', 'azzaro',
    'rochas', 'loewe', 'lancome', 'ysl', 'armani', 'givenchy',
}

# Tier 2: Popular accessible brands (+5% similarity boost)
TIER_2_BRANDS = {
    'tommy hilfiger', 'kenneth cole', 'michael kors', 'marc jacobs', 'coach',
    'donna karan', 'dkny', 'perry ellis', 'nautica', 'ed hardy', 'diesel',
    'guess', 'cerruti', 'dunhill', 'escada', 'nina ricci', 'cacharel',
    'elizabeth arden', 'revlon', 'adidas', 'antonio banderas',
}

TIER_1_BOOST = 0.12   # additive boost on 0-1 similarity scale
TIER_2_BOOST = 0.05


def apply_brand_tier_boost(df_working: pd.DataFrame, sims: np.ndarray) -> np.ndarray:
    """
    Boost similarity scores for well-known designer brands so they surface
    above the long tail of obscure/niche labels when scent profiles are comparable.
    """
    boosted = sims.copy()
    designers = df_working['designer'].fillna('').str.lower()

    t1_pattern = '|'.join(re.escape(b) for b in TIER_1_BRANDS)
    t2_pattern = '|'.join(re.escape(b) for b in TIER_2_BRANDS)

    tier1_mask = designers.str.contains(t1_pattern, na=False).values
    tier2_mask = designers.str.contains(t2_pattern, na=False).values & ~tier1_mask

    boosted[tier1_mask] = np.minimum(1.0, boosted[tier1_mask] + TIER_1_BOOST)
    boosted[tier2_mask] = np.minimum(1.0, boosted[tier2_mask] + TIER_2_BOOST)

    print(f"   Brand boost: {tier1_mask.sum():,} Tier-1 designers | "
          f"{tier2_mask.sum():,} Tier-2 brands lifted")
    return boosted


# === EMBEDDING CACHE ===
EMBEDDING_CACHE_PATH = "fragrance_embeddings.npz"


# ─────────────────────────────────────────────────────────────────────────────
# SEMANTIC EMBEDDING FUNCTIONS
# ─────────────────────────────────────────────────────────────────────────────

def build_fragrance_text(row) -> str:
    """Build a rich text representation for a fragrance to embed."""
    parts = []
    title = row.get('title', '')
    if pd.notna(title) and title:
        parts.append(str(title))
    notes = row.get('notes', [])
    if isinstance(notes, list) and notes:
        parts.append("Notes: " + ", ".join(str(n) for n in notes[:15]))
    desc = row.get('description', '')
    if pd.notna(desc) and desc:
        parts.append(str(desc)[:300])
    return " | ".join(parts)


def compute_and_cache_embeddings(
    df: pd.DataFrame,
    api_key: str,
    batch_size: int = 500,
    cache_path: str = EMBEDDING_CACHE_PATH,
    dimensions: int = 512
) -> np.ndarray:
    """
    One-time: compute OpenAI text-embedding-3-small embeddings for all fragrances.
    Saves to disk. Cost: ~$0.15 for 84K fragrances.
    """
    if not OPENAI_AVAILABLE:
        raise RuntimeError("openai package not installed — run: pip install openai")

    client = OpenAI(api_key=api_key)
    texts = df.apply(build_fragrance_text, axis=1).tolist()
    texts = [t if t.strip() else "unknown fragrance" for t in texts]
    all_embeddings = []

    n_batches = (len(texts) + batch_size - 1) // batch_size
    print(f"Computing embeddings for {len(texts):,} fragrances...")
    print(f"   Model: text-embedding-3-small | dim={dimensions} | {n_batches} batches")

    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=batch,
            dimensions=dimensions
        )
        all_embeddings.extend(e.embedding for e in response.data)

        batch_num = i // batch_size + 1
        if batch_num % 20 == 0 or batch_num == n_batches:
            print(f"   {i + len(batch):,}/{len(texts):,} done ({batch_num}/{n_batches} batches)")

    emb_array = np.array(all_embeddings, dtype=np.float32)
    idx_array = np.array(df.index.values, dtype=np.int64)

    np.savez_compressed(cache_path, embeddings=emb_array, indices=idx_array)
    mb = emb_array.nbytes / 1024 ** 2
    print(f"✅ Embeddings cached → {cache_path}  ({emb_array.shape}, {mb:.1f} MB)")
    return emb_array


def load_cached_embeddings(
    cache_path: str = EMBEDDING_CACHE_PATH
) -> Tuple[Optional[np.ndarray], Optional[np.ndarray]]:
    """Load cached embeddings. Returns (embeddings, df_indices) or (None, None)."""
    p = Path(cache_path)
    if not p.exists():
        return None, None
    data = np.load(cache_path)
    return data['embeddings'], data['indices']


def embed_user_query(text: str, api_key: str, dimensions: int = 512) -> np.ndarray:
    """Embed a single user query string using OpenAI."""
    client = OpenAI(api_key=api_key)
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=[text],
        dimensions=dimensions
    )
    return np.array(response.data[0].embedding, dtype=np.float32)


def apply_mmr(
    similarities: np.ndarray,
    embeddings: np.ndarray,
    top_k: int = 3,
    candidate_k: int = 25,
    lambda_param: float = 0.7
) -> np.ndarray:
    """
    Maximal Marginal Relevance — pick top_k diverse recommendations.

    lambda_param: 0=max diversity, 1=max relevance. 0.7 balances both.
    Returns integer positions (into the similarity/embeddings arrays).
    """
    n = len(similarities)
    candidate_k = min(candidate_k, n)

    # Top candidates by raw similarity
    top_positions = similarities.argsort()[-candidate_k:][::-1]

    selected: List[int] = []
    remaining = list(top_positions)

    while len(selected) < top_k and remaining:
        if not selected:
            best = remaining[0]
        else:
            best_score = -np.inf
            best = remaining[0]
            sel_embs = embeddings[selected]  # (len_selected, dim)
            for pos in remaining:
                relevance = float(similarities[pos])
                emb = embeddings[pos].reshape(1, -1)
                redundancy = float(cosine_similarity(emb, sel_embs).max())
                score = lambda_param * relevance - (1 - lambda_param) * redundancy
                if score > best_score:
                    best_score = score
                    best = pos
        selected.append(best)
        remaining.remove(best)

    return np.array(selected, dtype=int)


# ─────────────────────────────────────────────────────────────────────────────
# LLM NOTE EXTRACTION
# ─────────────────────────────────────────────────────────────────────────────

def extract_notes_with_llm(user_answers: Dict, scent_vocabulary: List[str]) -> Dict:

    desc = user_answers.get('description', '')

    # Detect referenced known fragrances
    known_ref_notes = []
    for frag_name, frag_notes in KNOWN_FRAGRANCES.items():
        if frag_name in desc.lower():
            known_ref_notes.extend(frag_notes)
    known_ref_str = (
        f"\nREFERENCED FRAGRANCE NOTES: {', '.join(set(known_ref_notes))}"
        if known_ref_notes else ""
    )

    prompt = f"""You are a world-class perfumer and fragrance AI. Extract the ideal fragrance notes for this user AND generate a rich semantic query description.

USER PROFILE:
- Gender: {user_answers.get('gender', 'Not specified')}
- Age Range: {user_answers.get('age_range', 'Not specified')}
- Season: {user_answers.get('season', 'Any')}
- Use Case: {user_answers.get('use_case', 'Not specified')}
- Budget: {user_answers.get('budget', 'Not specified')}

USER DESCRIPTION (analyze every detail):
"{desc}"
{known_ref_str}

EXTRACTION RULES — apply ALL relevant ones:

1. REFERENCED FRAGRANCES: If user mentions a known perfume (e.g. "Stronger with You"), include its characteristic notes.

2. PHYSICAL TRAITS → NOTES:
   - Brown/olive/Indian/South Asian/warm skin: amber, vanilla, tonka, oriental, spicy
   - Fair/light/pale skin: citrus, marine, lavender, fresh, light
   - Tall/athletic build: fresh, woody, bold

3. PERSONALITY → NOTES:
   - Extrovert / outgoing / loves attention: bold, fresh, citrus, intense
   - Introvert / shy / reserved: soft, musk, subtle, clean, delicate
   - Mix: balanced — musk, amber, subtle, warm

4. SCENT PREFERENCES:
   - "stand out but not too much": amber, musk, tonka, vanilla
   - "versatile": bergamot, cedar, amber, musk, fresh
   - "get compliments on sweet": vanilla, tonka, caramel, amber, gourmand
   - "sweet": vanilla, tonka, caramel, amber, musk
   - "fresh": citrus, bergamot, marine, mint, green
   - "woody": cedar, sandalwood, vetiver, oud

5. AGE:
   - 15-24: sweet, fresh, trendy (vanilla, citrus, tonka, fruity, marine)
   - 25-34: modern, balanced (woody, fresh, bergamot, amber, cedar)
   - 35-44: sophisticated (oud, leather, iris, amber, sandalwood)
   - 45+: classic (vetiver, cedar, rose, sandalwood, patchouli)

6. USE CASE:
   - Dates/Romantic: vanilla, musk, amber, rose, tonka, seductive
   - Work/Office: lavender, tea, bergamot, cedar, clean, subtle
   - Special events: leather, tobacco, oud, incense, bold
   - Casual: citrus, woody, fresh, cedar, musk

7. BUDGET:
   - Under $50: designer notes (citrus, musk, amber, cedar)
   - $50-200: quality naturals (oud blends, iris, tonka, bergamot)
   - $200+: rare notes (real oud, ambergris, iris)

Extract 20-25 notes ONLY from this vocabulary: {', '.join(scent_vocabulary[:200])}

ALSO generate a "query_description": a 3-4 sentence description of the IDEAL perfume for this user, written as if describing a real fragrance. Include the gender, season, specific note families (top/middle/base), mood, and occasion. Make it rich, evocative, and specific — it will be used for semantic search against a fragrance database.

Return ONLY valid JSON (no markdown):
{{
  "notes": ["note1", "note2", ...],
  "query_description": "A warm, sweet oriental fragrance...",
  "reasoning": "1-2 sentence explanation of choices",
  "personality_type": "bold|calm|energetic|creative|sophisticated|balanced",
  "intensity": "light|moderate|strong",
  "top_3_notes": ["note1", "note2", "note3"]
}}"""

    if not OPENAI_AVAILABLE:
        print("⚠️  OpenAI library not installed — using enhanced fallback")
        return fallback_note_extraction(user_answers)

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or not api_key.startswith("sk-"):
        print("❌ OpenAI API key missing or invalid — using enhanced fallback")
        return fallback_note_extraction(user_answers)

    fresh_client = OpenAI(api_key=api_key)

    try:
        response = fresh_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a perfume expert. Return ONLY valid JSON, no markdown."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=700
        )

        result_text = response.choices[0].message.content.strip()
        if result_text.startswith("```"):
            result_text = result_text.split("```")[1]
            if result_text.startswith("json"):
                result_text = result_text[4:]

        result = json.loads(result_text)
        vocab_lower = {v.lower() for v in scent_vocabulary}
        valid_notes = [n.lower() for n in result.get("notes", []) if n.lower() in vocab_lower]

        if not valid_notes:
            print("⚠️  GPT returned no valid vocabulary notes — using enhanced fallback")
            return fallback_note_extraction(user_answers)

        print("   Scent profile extracted.")
        return {
            "notes": valid_notes,
            "query_description": result.get("query_description", ""),
            "reasoning": result.get("reasoning", ""),
            "personality_type": result.get("personality_type", "balanced"),
            "intensity": result.get("intensity", "moderate"),
            "top_3_notes": result.get("top_3_notes", valid_notes[:3]),
            "raw_response": result
        }

    except json.JSONDecodeError as e:
        print(f"❌ GPT response not valid JSON: {e}")
        return fallback_note_extraction(user_answers)

    except Exception as e:
        print(f"❌ LLM API call failed: {type(e).__name__}: {e}")
        return fallback_note_extraction(user_answers)


def fallback_note_extraction(user_answers: Dict) -> Dict:
    """Enhanced fallback: known fragrances + physical traits + scent terms."""

    desc_lower = user_answers.get('description', '').lower()
    age_range = user_answers.get('age_range', '')
    use_case = user_answers.get('use_case', '')

    found_notes = []

    for frag_name, frag_notes in KNOWN_FRAGRANCES.items():
        if frag_name in desc_lower:
            found_notes.extend(frag_notes)
            print(f"   📌 Detected reference: '{frag_name}' → {frag_notes[:4]}")

    for trait, notes in TRAIT_NOTE_MAPPINGS.items():
        if trait in desc_lower:
            found_notes.extend(notes)

    for term in SCENT_TERMS:
        if term in desc_lower:
            found_notes.append(term)

    age_mappings = {
        '15-24': ['citrus', 'vanilla', 'fruity', 'sweet', 'musk'],
        '25-34': ['bergamot', 'woody', 'fresh', 'cedar', 'amber'],
        '35-44': ['oud', 'leather', 'iris', 'sandalwood', 'tobacco'],
        '45-54': ['vetiver', 'cedar', 'rose', 'patchouli', 'musk'],
        '55+':   ['sandalwood', 'jasmine', 'musk', 'rose', 'amber'],
    }
    if age_range in age_mappings:
        found_notes.extend(age_mappings[age_range])

    use_case_mappings = {
        'Work/Office':      ['lavender', 'cedar', 'bergamot', 'clean', 'subtle'],
        'Dates/Romantic':   ['vanilla', 'musk', 'amber', 'tonka', 'rose'],
        'Casual everyday':  ['citrus', 'cedar', 'fresh', 'musk'],
        'Special events':   ['amber', 'leather', 'incense', 'oud', 'bold'],
        'Athletic/Active':  ['mint', 'citrus', 'marine', 'green'],
    }
    if use_case in use_case_mappings:
        found_notes.extend(use_case_mappings[use_case])

    found_notes = list(dict.fromkeys(found_notes))[:25]

    intensity = 'moderate'
    if any(w in desc_lower for w in ['strong', 'bold', 'intense', 'stand out', 'powerful']):
        intensity = 'strong'
    elif any(w in desc_lower for w in ['light', 'subtle', 'soft', 'skin scent', 'quiet']):
        intensity = 'light'

    top3 = found_notes[:3] if found_notes else ['vanilla', 'amber', 'musk']

    return {
        "notes": found_notes,
        "query_description": "",
        "reasoning": f"Enhanced keyword matching for {age_range} {use_case.lower()}",
        "personality_type": "balanced",
        "intensity": intensity,
        "top_3_notes": top3,
        "raw_response": {}
    }


# ─────────────────────────────────────────────────────────────────────────────
# INTERACTIVE INTERFACE
# ─────────────────────────────────────────────────────────────────────────────

def ask_llm_questions():
    print("\n" + "="*60)
    print("FragrAI — Fragrance Recommendations")
    print("="*60)
    print("\nPlease answer a few questions to find your ideal fragrance.\n")

    answers = {}

    print("1.  What gender describes you best?")
    print("   1. Male\n   2. Female\n   3. Non-binary\n   4. Prefer not to say")
    while True:
        ans = input("\n   Enter number (1-4): ").strip()
        if ans in ['1', '2', '3', '4']:
            answers['gender'] = ['Male', 'Female', 'Non-binary', 'Prefer not to say'][int(ans)-1]
            break
        print("   Invalid selection. Please try again.")

    print("\n2.  What is your age range?")
    print("   1. 15-24\n   2. 25-34\n   3. 35-44\n   4. 45-54\n   5. 55+")
    while True:
        ans = input("\n   Enter number (1-5): ").strip()
        if ans in ['1', '2', '3', '4', '5']:
            answers['age_range'] = ['15-24', '25-34', '35-44', '45-54', '55+'][int(ans)-1]
            break
        print("   Invalid selection. Please try again.")

    print("\n3.  What season do you prefer?")
    print("   1. Spring\n   2. Summer\n   3. Fall\n   4. Winter\n   5. Any season")
    while True:
        ans = input("\n   Enter number (1-5): ").strip()
        if ans in ['1', '2', '3', '4', '5']:
            answers['season'] = ['Spring', 'Summer', 'Fall', 'Winter', 'Any'][int(ans)-1]
            break
        print("   Invalid selection. Please try again.")

    print("\n4.  Where will you wear this most?")
    print("   1. Work/Office\n   2. Dates/Romantic\n   3. Casual everyday\n   4. Special events\n   5. Athletic/Active")
    while True:
        ans = input("\n   Enter number (1-5): ").strip()
        if ans in ['1', '2', '3', '4', '5']:
            answers['use_case'] = ['Work/Office', 'Dates/Romantic', 'Casual everyday', 'Special events', 'Athletic/Active'][int(ans)-1]
            break
        print("   Invalid selection. Please try again.")

    print("\n5.  What is your budget per bottle?")
    print("   1. Under $50\n   2. $50-$100\n   3. $100-$200\n   4. $200+\n   5. No limit")
    while True:
        ans = input("\n   Enter number (1-5): ").strip()
        if ans in ['1', '2', '3', '4', '5']:
            answers['budget'] = ['Under $50', '$50-$100', '$100-$200', '$200+', 'No limit'][int(ans)-1]
            break
        print("   Invalid selection. Please try again.")

    print("\n" + "="*60)
    print("6.  Tell us what you are looking for.")
    print("="*60)
    print("\n   Include any details — scent preferences, personality, skin tone,")
    print("   occasions, or fragrances you already enjoy.")
    print("   Example: \"I'm Indian, I love sweet scents like Stronger with You,")
    print("             versatile enough for dates and casual wear.\"")

    description = input("\n   Description: ").strip()
    while len(description) < 15:
        print("   Please provide at least a brief description (15+ characters).")
        description = input("   Description: ").strip()

    answers['description'] = description
    return answers


# ─────────────────────────────────────────────────────────────────────────────
# HYBRID RECOMMENDATIONS
# ─────────────────────────────────────────────────────────────────────────────

def get_llm_enhanced_recommendations(
    user_answers: Dict,
    df: pd.DataFrame,
    tfidf,
    X_tfidf,
    scent_vocabulary: List[str],
    top_n: int = 3,
    use_llm: bool = True
):
    print("\n" + "="*60)
    print("FragrAI")
    print("="*60)
    print(f"\nYour Profile:")
    print(f"   Gender  : {user_answers.get('gender')}")
    print(f"   Age     : {user_answers.get('age_range')}")
    print(f"   Season  : {user_answers.get('season')}")
    print(f"   Use case: {user_answers.get('use_case')}")
    print(f"   Budget  : {user_answers.get('budget')}")
    print(f"\n   \"{user_answers.get('description')}\"")

    print(f"\nAnalyzing your preferences...")

    extraction_result = (
        extract_notes_with_llm(user_answers, scent_vocabulary)
        if use_llm
        else fallback_note_extraction(user_answers)
    )
    target_notes = extraction_result['notes']

    top3 = ', '.join(extraction_result.get('top_3_notes', target_notes[:3]))
    print(f"   Key notes identified: {top3}")
    print(f"   Intensity: {extraction_result['intensity']}")

    if not target_notes:
        target_notes = ['vanilla', 'amber', 'musk', 'fresh']

    # ── TF-IDF QUERY ─────────────────────────────────────────────────────────
    key_descriptors = {
        'woody', 'fresh', 'floral', 'spicy', 'citrus', 'sweet', 'warm',
        'oud', 'leather', 'musk', 'vanilla', 'amber', 'bergamot', 'lavender',
        'tonka', 'caramel', 'sandalwood', 'cedar', 'rose', 'jasmine', 'patchouli',
        'aquatic', 'marine', 'green', 'aromatic', 'neroli', 'vetiver', 'iris',
        'pepper', 'grapefruit', 'lime', 'mint', 'cardamom', 'incense', 'tobacco',
        'fruity', 'musky', 'oriental', 'chypre', 'fougere', 'smoky', 'earthy',
    }
    weighted_target = []
    for note in target_notes:
        weighted_target.append(note)
        if note in key_descriptors:
            weighted_target.extend([note, note, note])  # 4× boost for key notes

    raw_desc = user_answers.get('description', '')
    note_query = tfidf.transform([' '.join(weighted_target)])
    desc_query = tfidf.transform([raw_desc])

    # ── GENDER FILTER ─────────────────────────────────────────────────────────
    gender = user_answers.get('gender')
    if gender in ["Male", "Female"]:
        gender_map = {'Male': 'masculine', 'Female': 'feminine'}
        mask = (df['gender'] == gender_map[gender]) | (df['gender'] == 'unisex')
        df_working = df[mask]
        print(f"\nSearching {len(df_working):,} fragrances...")
    else:
        df_working = df

    if len(df_working) == 0:
        df_working = df

    working_indices = df_working.index
    X_working = X_tfidf[working_indices]

    tfidf_sims = cosine_similarity(note_query, X_working).ravel()
    desc_sims  = cosine_similarity(desc_query,  X_working).ravel()

    # ── SEMANTIC EMBEDDING SIMILARITY ────────────────────────────────────────
    emb_array, emb_idx = load_cached_embeddings()
    use_embeddings = (emb_array is not None) and OPENAI_AVAILABLE

    if use_embeddings:
        idx_to_pos = {int(idx): pos for pos, idx in enumerate(emb_idx)}
        working_positions = [idx_to_pos.get(int(idx), -1) for idx in working_indices]
        valid_mask = np.array([p >= 0 for p in working_positions])

        if valid_mask.sum() < 10:
            use_embeddings = False
        else:
            embeddings_working = emb_array[[p for p in working_positions if p >= 0]]

            api_key = os.getenv("OPENAI_API_KEY")
            query_text = extraction_result.get('query_description') or raw_desc
            try:
                query_emb = embed_user_query(query_text, api_key)
                emb_sims = cosine_similarity(query_emb.reshape(1, -1), embeddings_working).ravel()

                full_emb_sims = np.zeros(len(working_indices), dtype=np.float32)
                full_emb_sims[valid_mask] = emb_sims
            except Exception as e:
                use_embeddings = False

    # ── BLEND SIMILARITIES ────────────────────────────────────────────────────
    if use_embeddings:
        blended_sims = 0.45 * full_emb_sims + 0.50 * tfidf_sims + 0.05 * desc_sims
    else:
        blended_sims = 0.65 * tfidf_sims + 0.35 * desc_sims

    # ── SEASON SOFT BOOST ────────────────────────────────────────────────────
    season = user_answers.get('season', 'Any')
    if season != 'Any':
        season_mask = (df_working['season'] == season.lower()).values
        blended_sims = np.where(season_mask, blended_sims * 1.10, blended_sims)

    # ── RATING SOFT BOOST ────────────────────────────────────────────────────
    df_working = df_working.copy()
    if 'rating' in df_working.columns:
        ratings = pd.to_numeric(df_working['rating'], errors='coerce').fillna(0).values
        max_r = ratings.max()
        if max_r > 0:
            blended_sims = blended_sims + (ratings / max_r) * 0.05

    # ── BRAND TIER BOOST ─────────────────────────────────────────────────────
    blended_sims = apply_brand_tier_boost(df_working, blended_sims)

    # ── MMR DIVERSITY ─────────────────────────────────────────────────────────
    if use_embeddings and len(embeddings_working) >= top_n:
        selected_positions = apply_mmr(
            similarities=blended_sims,
            embeddings=embeddings_working,
            top_k=top_n,
            candidate_k=min(30, len(blended_sims)),
            lambda_param=0.8
        )
        results = df_working.iloc[selected_positions].copy()
        results['similarity'] = blended_sims[selected_positions]
    else:
        df_working['similarity'] = blended_sims
        results = df_working.sort_values('similarity', ascending=False).head(top_n)

    results['match_score'] = (results['similarity'] * 100).round(1).astype(str) + '%'

    print(f"\nTop match score: {results.iloc[0]['similarity']:.1%}")

    return results, extraction_result


# ─────────────────────────────────────────────────────────────────────────────
# RECOMMENDATION ENRICHMENT (longevity, price, notes analysis, dupes)
# ─────────────────────────────────────────────────────────────────────────────

def _search_price_and_dupes(title: str, designer: str, api_key: str) -> dict:
    """
    Use gpt-4o-search-preview (live web search) to get the real current retail
    price and two genuine cheaper alternatives for a fragrance.
    """
    client = OpenAI(api_key=api_key)
    query = (
        f'Find the current retail price of "{title}" by {designer} perfume (100ml EDP or EDT). '
        f'Also find exactly 2 real cheaper fragrances that smell similar to it. '
        f'Return ONLY a JSON object — no markdown, no explanation — in this exact format: '
        f'{{"price_usd": "$XX-$XX for 100ml EDP", "dupes": ['
        f'{{"name": "...", "designer": "...", "price_usd": "$XX", "reason": "shares X and Y notes"}},'
        f'{{"name": "...", "designer": "...", "price_usd": "$XX", "reason": "shares X and Y notes"}}'
        f']}}'
    )
    try:
        response = client.responses.create(
            model="gpt-4o-search-preview",
            tools=[{"type": "web_search_preview"}],
            input=query
        )
        result_text = response.output_text.strip()
        # Strip markdown fences if present
        if '```' in result_text:
            result_text = re.sub(r'```(?:json)?\s*', '', result_text).strip('`').strip()
        json_match = re.search(r'\{[\s\S]*\}', result_text)
        if json_match:
            return json.loads(json_match.group())
    except Exception:
        pass
    return {}


def enrich_recommendation_with_gpt(row, api_key: str) -> dict:
    """
    Uses gpt-4o-mini for longevity + notes analysis, and gpt-4o-search-preview
    (live web search) for real current price and genuine cheaper dupes.
    """
    title      = str(row.get('title', 'Unknown'))
    designer   = str(row.get('designer', 'Unknown'))
    notes      = row.get('notes', [])
    raw_desc   = row.get('description', '')
    description = str(raw_desc) if pd.notna(raw_desc) and raw_desc else ''

    notes_str    = ', '.join(str(n) for n in notes[:12]) if isinstance(notes, list) else str(notes)
    desc_preview = description[:400] if description else 'Not available'

    result = {
        "longevity": "Moderate (4-6 hours)",
        "price_usd": "Price varies by retailer",
        "notes_analysis": f"Features {notes_str[:100]}." if notes_str else "Notes details unavailable.",
        "dupes": []
    }

    client = OpenAI(api_key=api_key)

    # ── Step 1: longevity + notes analysis via gpt-4o-mini ───────────────────
    prompt = f"""You are a world-class fragrance expert. Given the perfume details below, provide enrichment data.

PERFUME: {title}
BRAND: {designer}
NOTES: {notes_str}
DESCRIPTION: {desc_preview}

Return ONLY valid JSON (no markdown, no code fences):
{{
  "longevity": "X-Y hours on skin with sillage description (e.g. '6-8 hours, moderate-good projection')",
  "notes_analysis": "2-3 sentences explaining how the key notes interact, what mood they create, and when to wear it"
}}"""
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a fragrance expert. Return ONLY valid JSON, no markdown."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=400
        )
        result_text = response.choices[0].message.content.strip()
        if result_text.startswith("```"):
            lines = result_text.split("\n")
            result_text = "\n".join(lines[1:-1])
            if result_text.startswith("json"):
                result_text = result_text[4:]
        parsed = json.loads(result_text)
        result['longevity']      = parsed.get('longevity', result['longevity'])
        result['notes_analysis'] = parsed.get('notes_analysis', result['notes_analysis'])
    except Exception:
        pass

    # ── Step 2: real price + real dupes via web search ────────────────────────
    web_data = _search_price_and_dupes(title, designer, api_key)
    if web_data.get('price_usd'):
        result['price_usd'] = web_data['price_usd']
    if web_data.get('dupes'):
        result['dupes'] = web_data['dupes']

    return result


# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────

def run_llm_fragrai(df, tfidf, X_tfidf, scent_vocabulary, use_llm=True):
    user_answers = ask_llm_questions()
    recommendations, extraction_info = get_llm_enhanced_recommendations(
        user_answers, df, tfidf, X_tfidf, scent_vocabulary, 3, use_llm
    )

    print("\n" + "="*60)
    print("Your Recommendations")
    print("="*60)

    api_key    = os.getenv("OPENAI_API_KEY")
    W          = 60   # display width
    inner      = W - 4  # usable content width inside "│  …  │"

    def wrap_field(label: str, text: str, width: int = inner) -> None:
        """Print a labelled, word-wrapped block inside the box."""
        prefix     = f"│  {label}: "
        cont_pad   = "│  " + " " * (len(label) + 2)
        first_w    = width - len(prefix) + 4  # +4 for the leading "│  "
        cont_w     = width - len(cont_pad) + 4
        lines      = textwrap.wrap(text, width=first_w)
        if not lines:
            return
        print(prefix + lines[0])
        for ln in lines[1:]:
            for sub in textwrap.wrap(ln, width=cont_w):
                print(cont_pad + sub)

    for i, (idx, row) in enumerate(recommendations.iterrows(), 1):
        title       = str(row.get('title', 'Unknown'))
        designer    = str(row.get('designer', 'Unknown'))
        match_score = str(row.get('match_score', 'N/A'))
        notes       = row.get('notes', [])
        notes_str   = ', '.join(str(n) for n in notes[:8]) if isinstance(notes, list) else 'N/A'
        raw_desc    = row.get('description', '')
        description = str(raw_desc) if pd.notna(raw_desc) and raw_desc else ''

        # Enrich this recommendation with GPT
        enriched = {}
        if OPENAI_AVAILABLE and api_key:
            print(f"\n  Retrieving details for recommendation {i}...")
            enriched = enrich_recommendation_with_gpt(row, api_key)

        longevity      = enriched.get('longevity', 'Moderate (4-6 hours)')
        price          = enriched.get('price_usd', 'Price varies')
        notes_analysis = enriched.get('notes_analysis', '')
        dupes          = enriched.get('dupes', [])

        # Use GPT-enriched description if available, else dataset description
        display_desc = description[:300] + ('...' if len(description) > 300 else '')

        print(f"\n{'─'*W}")
        print(f"  RECOMMENDATION {i}  [{match_score} match]")
        print(f"{'─'*W}")
        print(f"│  Name     : {title}")
        print(f"│  Designer : {designer}")
        print(f"│  Longevity: {longevity}")
        print(f"│  Price    : {price}")
        print(f"│")

        if display_desc:
            wrap_field("Description", display_desc)
            print(f"│")

        print(f"│  Notes    : {notes_str}")
        if notes_analysis:
            wrap_field("Analysis", notes_analysis)

        if dupes:
            print(f"│")
            print(f"│  DUPES (cheaper alternatives):")
            for d in dupes[:2]:
                dupe_name     = d.get('name', 'Unknown')
                dupe_designer = d.get('designer', '')
                dupe_price    = d.get('price_usd', '')
                dupe_reason   = d.get('reason', d.get('similarity', ''))
                print(f"│    • {dupe_name} by {dupe_designer} — {dupe_price}")
                if dupe_reason:
                    for ln in textwrap.wrap(dupe_reason, width=inner - 6):
                        print(f"│        {ln}")

        print(f"{'─'*W}")

    print("\n" + "="*60)
    print("FragrAI")
    print("="*60)

    return recommendations, extraction_info
