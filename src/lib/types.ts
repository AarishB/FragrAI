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

export interface FormState {
  season: Season;
  intensity: number; // 1–10
  budget: number;    // USD
  notes: Note[];
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