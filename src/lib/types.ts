// src/lib/types.ts

export type Note =
  | "citrus"
  | "woody"
  | "sweet"
  | "spicy"
  | "aquatic"
  | "floral"
  | "amber"
  | "leather"
  | "fruity";

export type Season = "summer" | "spring" | "fall" | "winter" | "any";

export type Gender = "male" | "female" | "unisex";

export type Personality =
  | "Bold & Adventurous"
  | "Calm & Thoughtful"
  | "Energetic & Social"
  | "Creative & Open-minded";

export type ScentProfile =
  | "Warm & Rich"
  | "Fresh & Clean"
  | "Deep & Intense"
  | "Soft & Floral";

export type EventType =
  | "Date night"
  | "Family gathering"
  | "School/Work"
  | "Party/Going out";

export type Vibe = "Sweet/Comforting" | "Fresh/Clean" | "Woody/Spicy" | "Floral/Soft";

export type Strength = "Skin-scent" | "Moderate" | "Strong";

export interface FormState {
  season: Season;
  intensity: number; // 1–10
  budget: number;    // USD
  notes: Note[];
  // new fields (optional until model is integrated)
  gender?: Gender;
  personality?: Personality;
  scentProfile?: ScentProfile;
  event?: EventType;
  vibe?: Vibe;
  strength?: Strength;
  energy?: number;     // 0–100 (calm ↔ energetic)
  style?: number;      // 0–100 (classic ↔ bold)
  mood?: number;       // 0–100 (warm ↔ fresh)
  complexity?: number; // 0–100 (simple ↔ complex)
}

export interface Rec {
  id: string;
  name: string;
  brand: string;
  match: number; // 0–1 score
  season: Season;
  notes: Note[];
  url?: string;
}

export interface User {
  username: string;
  email: string;
  password: string; // stored as-is in localStorage (no real auth)
  displayName?: string;
  avatarUrl?: string;
}

export interface Session {
  username: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
}