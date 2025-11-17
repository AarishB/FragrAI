import type { FormState, Rec } from "./types";
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
      url: "https://www.google.com/search?q=valentino&sca_esv=ac5190d3317fe602&udm=28&sxsrf=AE3TifN2Ul1uJact_CrBej0O0olWr3qRDQ%3A1762533756587&shopmd=1&ei=fCEOaeGJIvOk5NoPnvO0iQU&ved=0ahUKEwjht9vzveCQAxVzElkFHZ45LVEQ4dUDCBk&uact=5&oq=valentino&gs_lp=Ehlnd3Mtd2l6LW1vZGVsZXNzLXNob3BwaW5nIgl2YWxlbnRpbm9IGVAAWABwAHgAkAEAmAEAoAEAqgEAuAEDyAEA-AEBmAIAoAIAmAMAkgcAoAcAsgcAuAcAwgcAyAcA&sclient=gws-wiz-modeless-shopping"
    },
    {
      id: "2",
      name: "Acqua di Giò Parfum",
      brand: "Armani",
      match: 0.82,
      season: "summer",
      notes: ["aquatic", "citrus", "woody"],
      url: "https://example.com/adg",
    },
    {
      id: "3",
      name: "Khamrah",
      brand: "Lattafa",
      match: 0.8,
      season: "winter",
      notes: ["sweet", "spicy", "amber"],
      url: "https://example.com/khamrah",
    },
    {
      id: "4",
      name: "Green Stravaganza",
      brand: "Valentino",
      match: 0.78,
      season: "spring",
      notes: ["citrus", "woody", "fruity"],
      url: "https://example.com/green",
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