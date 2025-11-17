// src/lib/api.ts
import type { FormState, Rec } from "./types";
import { mockPredict } from "./mockPredict";

export async function getRecommendations(form: FormState): Promise<Rec[]> {
  // For now, just call the mock "ML" function.
  // Later we'll swap this to a real Flask API call.
  return mockPredict(form);
}