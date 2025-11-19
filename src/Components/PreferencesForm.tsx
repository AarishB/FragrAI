import React from "react";
import type { FormState, Note, Season } from "../lib/types";
import { Pill } from "./Pill";

interface PreferencesFormProps {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  loading: boolean;
  canSubmit: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const allNotes: Note[] = [
  "citrus",
  "woody",
  "sweet",
  "spicy",
  "aquatic",
  "floral",
  "amber",
  "leather",
  "fruity",
];

export const PreferencesForm: React.FC<PreferencesFormProps> = ({
  form,
  setForm,
  loading,
  canSubmit,
  onSubmit,
}) => {
  const toggleNote = (n: Note) => {
    setForm((f) => ({
      ...f,
      notes: f.notes.includes(n)
        ? f.notes.filter((x) => x !== n)
        : [...f.notes, n],
    }));
  };

  return (
    <section className="flex-1 space-y-7">
      {/* Hero text */}
      <div className="space-y-3">
        <p className="text-[11px] tracking-[0.32em] uppercase text-[#b5a896]">
          curated by data
        </p>
        <h1
          className="text-3xl md:text-4xl font-semibold leading-tight text-[#f5f0e9]"
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          Your next signature scent,
          <span className="block text-[#c19a6b]">picked before you spray.</span>
        </h1>
        <p className="text-[13px] md:text-sm text-[#c3b7a4] max-w-md leading-relaxed">
          Set the season, strength, budget, and notes you reach for. FragrAI
          suggests three bottles worth sampling—without committing to a full
          flacon.
        </p>
      </div>

      {/* Form card */}
      <form
        onSubmit={onSubmit}
        className="space-y-6 rounded-2xl border border-[#3a2d22] bg-gradient-to-br from-[#15100d] via-[#17110e] to-[#231510] p-5 shadow-[0_22px_50px_rgba(0,0,0,0.7)] md:p-6"
      >
        {/* Season */}
        <div className="space-y-3">
          <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b5a896]">
            Season
          </label>
          <div className="flex flex-wrap gap-2">
            {(["any", "summer", "spring", "fall", "winter"] as Season[]).map(
              (s) => (
                <Pill
                  key={s}
                  active={form.season === s}
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      season: s,
                    }))
                  }
                >
                  {s === "any" ? "Any season" : s}
                </Pill>
              )
            )}
          </div>
        </div>

        {/* Intensity */}
        <div className="space-y-3">
          <label
            htmlFor="intensity"
            className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b5a896]"
          >
            Intensity
          </label>
          <div className="flex items-center gap-4">
            <input
              id="intensity"
              type="range"
              min={1}
              max={10}
              value={form.intensity}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  intensity: Number(e.target.value),
                }))
              }
              className="w-full accent-[#c19a6b]"
              style={{
                background: `linear-gradient(to right, #c19a6b 0%, #c19a6b ${
                  ((form.intensity - 1) / 9) * 100
                }%, #2b2219 ${((form.intensity - 1) / 9) * 100}%, #2b2219 100%)`,
                height: "4px",
                borderRadius: "9999px",
              }}
            />
            <div className="flex h-10 w-12 items-center justify-center rounded-md bg-[#1e1711] border border-[#3a2d22]">
              <span className="text-sm font-semibold text-[#f5f0e9]">
                {form.intensity}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-[#8f8270] leading-relaxed">
            1 = close to skin · 10 = room-filling trail. We use this to bias the
            picks.
          </p>
        </div>

        {/* Budget */}
        <div className="space-y-3">
          <label
            htmlFor="budget"
            className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b5a896]"
          >
            Budget (USD)
          </label>
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8f8270] text-sm">
                $
              </span>
              <input
                id="budget"
                type="number"
                min={20}
                step={5}
                value={form.budget}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    budget: Number(e.target.value),
                  }))
                }
                className="w-32 rounded-md border border-[#3a2d22] bg-[#18110d] pl-7 pr-3 py-2 text-sm font-medium text-[#f5f0e9] outline-none focus:border-[#c19a6b] focus:ring-1 focus:ring-[#c19a6b]/70 transition-all"
              />
            </div>
            <span className="text-[11px] text-[#8f8270] leading-relaxed">
              Rough full-bottle price you&apos;re comfortable with.
            </span>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-3">
          <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b5a896]">
            Notes you gravitate toward
          </label>
          <div className="flex flex-wrap gap-2">
            {allNotes.map((n) => (
              <Pill
                key={n}
                active={form.notes.includes(n)}
                onClick={() => toggleNote(n)}
              >
                {n}
              </Pill>
            ))}
          </div>
          <div className="text-[11px] text-[#8f8270] leading-relaxed">
            Selected:{" "}
            {form.notes.length ? (
              <span className="font-semibold text-[#e2d6c4]">
                {form.notes.join(", ")}
              </span>
            ) : (
              <span className="text-[#6f6253]">none yet</span>
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!canSubmit}
          className={`group mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold tracking-wide transition-all duration-200 ${
            canSubmit
              ? "bg-[#4a1515] text-[#f5f0e9] border border-[#c19a6b]/80 hover:bg-[#6b1f1f] hover:border-[#d8b373]"
              : "cursor-not-allowed bg-[#18110d] text-[#7f7262] border border-[#2a2118]"
          }`}
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#f5f0e9]/30 border-t-transparent" />
              Thinking…
            </>
          ) : (
            "Get 3 picks"
          )}
        </button>
      </form>
    </section>
  );
};