// src/lib/api.ts
import type { FormState, Rec } from "./types";
import { mockPredict } from "./mockPredict";

const API_URL = import.meta.env.VITE_API_URL as string | undefined;

export async function getRecommendations(form: FormState): Promise<Rec[]> {
  if (!API_URL) {
    // No backend configured — use mock
    return mockPredict(form);
  }

  const res = await fetch(`${API_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}