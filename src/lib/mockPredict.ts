import type { FormState, Rec } from "./types";

// Helper: build a Google Shopping search URL from brand + fragrance name
function buildShoppingUrl(brand: string, name: string): string {
  const query = encodeURIComponent(`${brand} ${name}`);
  // clean shopping search URL, no giant copied params
  return `https://www.google.com/search?tbm=shop&udm=28&q=${query}`;
}

export async function mockPredict(form: FormState): Promise<Rec[]> {
  await new Promise((r) => setTimeout(r, 400));

  const base: Rec[] = [
    {
      id: "1",
      name: "Born in Roma Intense",
      brand: "Valentino",
      match: 0.86,
      season: "fall",
      notes: ["amber", "sweet", "woody"],
      url: buildShoppingUrl("Valentino", "Born in Roma Intense"),
    },
    {
      id: "2",
      name: "Acqua di Giò Parfum",
      brand: "Armani",
      match: 0.82,
      season: "summer",
      notes: ["aquatic", "citrus", "woody"],
      url: buildShoppingUrl("Armani", "Acqua di Giò Parfum"),
    },
    {
      id: "3",
      name: "Khamrah",
      brand: "Lattafa",
      match: 0.8,
      season: "winter",
      notes: ["sweet", "spicy", "amber"],
      url: buildShoppingUrl("Lattafa", "Khamrah"),
    },
    {
      id: "4",
      name: "Green Stravaganza",
      brand: "Valentino",
      match: 0.78,
      season: "spring",
      notes: ["citrus", "woody", "fruity"],
      url: buildShoppingUrl("Valentino", "Green Stravaganza"),
    },
  ];

  const seasonBoost = (r: Rec) =>
    form.season === "any" || r.season === form.season ? 0.1 : 0;

  const intensityBoost =
    Math.abs(form.intensity - 7) <= 2 ? 0.08 : Math.max(0, 0.04);

  const notesBoost = (r: Rec) =>
    r.notes.filter((n) => form.notes.includes(n)).length * 0.04;

  return base
    .map((r) => ({
      ...r,
      match: Math.min(
        0.99,
        r.match + seasonBoost(r) + intensityBoost + notesBoost(r)
      ),
    }))
    .sort((a, b) => b.match - a.match)
    .slice(0, 3);
}