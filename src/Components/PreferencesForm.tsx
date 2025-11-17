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
    <section className="flex-1 space-y-6">
      {/* Hero text */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3.5 py-1.5 text-[11px] uppercase tracking-[0.12em] text-emerald-300 shadow-lg shadow-emerald-500/10">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live demo • student project
        </div>

        <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl">
          Find 3 fragrances that actually match{" "}
          <span className="bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
            your vibe.
          </span>
        </h1>

        <p className="text-base text-slate-300 md:text-lg leading-relaxed">
          Tell FragrAI what season, intensity, and notes you're into. We'll
          return three picks you can sample before committing to a full bottle.
        </p>
      </div>

      {/* Form card */}
      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/60 backdrop-blur md:p-6"
      >
        {/* Season */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
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
            className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400"
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
              className="w-full accent-emerald-400"
              style={{
                background: `linear-gradient(to right, rgb(52 211 153) 0%, rgb(52 211 153) ${
                  ((form.intensity - 1) / 9) * 100
                }%, rgb(51 65 85) ${((form.intensity - 1) / 9) * 100}%, rgb(51 65 85) 100%)`
              }}
            />
            <div className="flex h-10 w-12 items-center justify-center rounded-lg bg-emerald-500/20 border border-emerald-500/30">
              <span className="text-sm font-bold text-emerald-400">
                {form.intensity}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            1 = skin-scent, 10 = projector. We'll use this to bias picks.
          </p>
        </div>

        {/* Budget */}
        <div className="space-y-3">
          <label
            htmlFor="budget"
            className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400"
          >
            Budget (USD)
          </label>
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
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
                className="w-32 rounded-lg border border-slate-700 bg-slate-800/50 pl-7 pr-3 py-2 text-sm font-medium text-slate-100 outline-none ring-emerald-400/60 focus:border-emerald-500/50 focus:ring-2 transition-all"
              />
            </div>
            <span className="text-[11px] text-slate-500 leading-relaxed">
              Approximate full-bottle price you&apos;re comfortable with.
            </span>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Pick a few notes
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
          <div className="text-[11px] text-slate-500 leading-relaxed">
            Selected:{" "}
            {form.notes.length ? (
              <span className="font-semibold text-emerald-400">
                {form.notes.join(", ")}
              </span>
            ) : (
              <span className="text-slate-600">none yet</span>
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!canSubmit}
          className={`group mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all duration-200 ${
            canSubmit
              ? "bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98]"
              : "cursor-not-allowed bg-slate-800 text-slate-600"
          }`}
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
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