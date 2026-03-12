// src/lib/api.ts
import type { FormState, Rec } from "./types";
import { mockPredict } from "./mockPredict";

const API_URL = import.meta.env.VITE_API_URL as string | undefined;

// Map React FormState → FragrAI FastAPI request body
function toApiPayload(form: FormState) {
  const genderMap: Record<string, string> = {
    male: "Male",
    female: "Female",
    unisex: "Non-binary",
  };

  const useCaseMap: Record<string, string> = {
    "Date night": "Dates/Romantic",
    "Family gathering": "Casual everyday",
    "School/Work": "Work/Office",
    "Party/Going out": "Special events",
  };

  const budgetLabel =
    form.budget <= 50  ? "Under $50"   :
    form.budget <= 100 ? "$50-$100"    :
    form.budget <= 200 ? "$100-$200"   : "$200+";

  const descParts: string[] = [];
  if (form.scentProfile) descParts.push(`I prefer ${form.scentProfile} scents.`);
  if (form.vibe)         descParts.push(`Vibe: ${form.vibe}.`);
  if (form.strength)     descParts.push(`Strength preference: ${form.strength}.`);
  if (form.notes?.length) descParts.push(`Favorite note families: ${form.notes.join(", ")}.`);
  if (form.personality)  descParts.push(`My personality: ${form.personality}.`);

  return {
    gender:      genderMap[form.gender ?? "unisex"] ?? "Non-binary",
    age_range:   "15-24",
    season:      form.season.charAt(0).toUpperCase() + form.season.slice(1),
    use_case:    useCaseMap[form.event ?? ""] ?? "Casual everyday",
    budget:      budgetLabel,
    description: descParts.join(" ") || "Looking for a great fragrance.",
    enrich:      true,
  };
}

// Map FastAPI response → Rec[]
function toRecs(data: any): Rec[] {
  return (data.recommendations ?? []).map((r: any) => ({
    id:     r.name,
    name:   r.name,
    brand:  r.designer,
    match:  parseFloat(r.match_score) / 100,
    season: "any" as const,
    notes:  r.notes ?? [],
  }));
}

export async function getRecommendations(form: FormState): Promise<Rec[]> {
  if (!API_URL) {
    return mockPredict(form);
  }

  const res = await fetch(`${API_URL}/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toApiPayload(form)),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return toRecs(await res.json());
}