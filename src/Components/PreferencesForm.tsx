import React, { useState } from "react";
import type {
  EventType,
  FormState,
  Gender,
  Note,
  Personality,
  ScentProfile,
  Season,
  Strength,
  Vibe,
} from "../lib/types";
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

const TOTAL_STEPS = 4;

const stepMeta = [
  { label: "You",     subtitle: "Tell us a bit about yourself." },
  { label: "Scent",   subtitle: "What draws you in?" },
  { label: "Context", subtitle: "When and where?" },
  { label: "Details", subtitle: "Fine-tune your picks." },
];

export const PreferencesForm: React.FC<PreferencesFormProps> = ({
  form,
  setForm,
  loading,
  canSubmit,
  onSubmit,
}) => {
  const [step, setStep] = useState(1);
  const [budgetStr, setBudgetStr] = useState(form.budget ? String(form.budget) : "");
  const [liveIntensity, setLiveIntensity] = useState(form.intensity);
  const [liveEnergy, setLiveEnergy] = useState(form.energy ?? 50);
  const [liveStyle, setLiveStyle] = useState(form.style ?? 50);
  const [liveMood, setLiveMood] = useState(form.mood ?? 50);
  const [liveComplexity, setLiveComplexity] = useState(form.complexity ?? 50);

  const snapIntensity = (val: number) => {
    const snapped = Math.round(val);
    setLiveIntensity(snapped);
    setForm((f) => ({ ...f, intensity: snapped }));
  };

  const toggleNote = (n: Note) => {
    setForm((f) => ({
      ...f,
      notes: f.notes.includes(n)
        ? f.notes.filter((x) => x !== n)
        : [...f.notes, n],
    }));
  };

  const sliderStyle = (pct: number) => ({
    background: `linear-gradient(to right, #c19a6b 0%, #c19a6b ${pct}%, #2b2219 ${pct}%, #2b2219 100%)`,
    height: "4px",
    borderRadius: "9999px",
  });

  const { label, subtitle } = stepMeta[step - 1];

  return (
    <section className="flex-1 space-y-7">
      {/* Hero text */}
      <div className="space-y-3">
        <p className="text-[11px] tracking-[0.32em] uppercase text-[#b5a896]">
          Curated by Data from Fragrantica
        </p>
        <h1
          className="text-3xl md:text-4xl font-semibold leading-tight text-[#f5f0e9]"
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          Your next signature scent,
          <span className="block text-[#c19a6b]">picked before you spray.</span>
        </h1>
        <p className="text-[13px] md:text-sm text-[#c3b7a4] max-w-md leading-relaxed">
          Answer a few quick questions and FragrAI suggests three bottles worth
          trying without regret.
        </p>
      </div>

      {/* Form card */}
      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-[#3a2d22] bg-gradient-to-br from-[#15100d] via-[#17110e] to-[#231510] shadow-[0_22px_50px_rgba(0,0,0,0.7)]"
      >
        {/* Step header */}
        <div className="flex items-center justify-between border-b border-[#2a1f17] px-5 py-4 md:px-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#8f8270]">
              Step {step} of {TOTAL_STEPS}
            </p>
            <p
              className="mt-0.5 text-base font-semibold text-[#f5f0e9]"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              {label}
              <span className="ml-2 text-sm font-normal text-[#9a8878]">
                — {subtitle}
              </span>
            </p>
          </div>
          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <span
                key={i}
                className={`block rounded-full transition-all duration-300 ${
                  i + 1 < step
                    ? "h-2 w-2 bg-[#c19a6b]"
                    : i + 1 === step
                    ? "h-2 w-4 bg-[#c19a6b]"
                    : "h-2 w-2 bg-[#2b2219]"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="space-y-6 p-5 md:p-6">

          {/* ── STEP 1: You ── */}
          {step === 1 && (
            <>
              {/* Gender */}
              <div className="space-y-3">
                <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b5a896]">
                  Gender
                </label>
                <div className="flex flex-wrap gap-2">
                  {(["male", "female", "unisex"] as Gender[]).map((g) => (
                    <Pill
                      key={g}
                      active={form.gender === g}
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          gender: f.gender === g ? undefined : g,
                        }))
                      }
                    >
                      {g === "male" ? "Male" : g === "female" ? "Female" : "Unisex"}
                    </Pill>
                  ))}
                </div>
              </div>

              {/* Personality */}
              <div className="space-y-3">
                <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b5a896]">
                  Personality
                </label>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      "Bold & Adventurous",
                      "Calm & Thoughtful",
                      "Energetic & Social",
                      "Creative & Open-minded",
                    ] as Personality[]
                  ).map((p) => (
                    <Pill
                      key={p}
                      active={form.personality === p}
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          personality: f.personality === p ? undefined : p,
                        }))
                      }
                    >
                      {p}
                    </Pill>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── STEP 2: Scent ── */}
          {step === 2 && (
            <>
              {/* Scent Profile */}
              <div className="space-y-3">
                <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b5a896]">
                  Scent Profile
                </label>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      "Warm & Rich",
                      "Fresh & Clean",
                      "Deep & Intense",
                      "Soft & Floral",
                    ] as ScentProfile[]
                  ).map((sp) => (
                    <Pill
                      key={sp}
                      active={form.scentProfile === sp}
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          scentProfile: f.scentProfile === sp ? undefined : sp,
                        }))
                      }
                    >
                      {sp}
                    </Pill>
                  ))}
                </div>
              </div>

              {/* Vibe */}
              <div className="space-y-3">
                <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b5a896]">
                  Vibe
                </label>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      "Sweet/Comforting",
                      "Fresh/Clean",
                      "Woody/Spicy",
                      "Floral/Soft",
                    ] as Vibe[]
                  ).map((v) => (
                    <Pill
                      key={v}
                      active={form.vibe === v}
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          vibe: f.vibe === v ? undefined : v,
                        }))
                      }
                    >
                      {v}
                    </Pill>
                  ))}
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
            </>
          )}

          {/* ── STEP 3: Context ── */}
          {step === 3 && (
            <>
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
                        onClick={() => setForm((f) => ({ ...f, season: s }))}
                      >
                        {s === "any" ? "Any season" : s}
                      </Pill>
                    )
                  )}
                </div>
              </div>

              {/* Occasion */}
              <div className="space-y-3">
                <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b5a896]">
                  Occasion
                </label>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      "Date night",
                      "Family gathering",
                      "School/Work",
                      "Party/Going out",
                    ] as EventType[]
                  ).map((ev) => (
                    <Pill
                      key={ev}
                      active={form.event === ev}
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          event: f.event === ev ? undefined : ev,
                        }))
                      }
                    >
                      {ev}
                    </Pill>
                  ))}
                </div>
              </div>

              {/* Projection */}
              <div className="space-y-3">
                <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b5a896]">
                  Projection
                </label>
                <div className="flex flex-wrap gap-2">
                  {(["Skin-scent", "Moderate", "Strong"] as Strength[]).map(
                    (s) => (
                      <Pill
                        key={s}
                        active={form.strength === s}
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            strength: f.strength === s ? undefined : s,
                          }))
                        }
                      >
                        {s}
                      </Pill>
                    )
                  )}
                </div>
                <p className="text-[11px] text-[#8f8270] leading-relaxed">
                  How far you want the scent to carry.
                </p>
              </div>
            </>
          )}

          {/* ── STEP 4: Details ── */}
          {step === 4 && (
            <>
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
                    step={0.01}
                    value={liveIntensity}
                    onChange={(e) => setLiveIntensity(Number(e.target.value))}
                    onPointerUp={(e) =>
                      snapIntensity(Number((e.target as HTMLInputElement).value))
                    }
                    onTouchEnd={(e) =>
                      snapIntensity(Number((e.target as HTMLInputElement).value))
                    }
                    onKeyUp={(e) =>
                      snapIntensity(Number((e.target as HTMLInputElement).value))
                    }
                    className="w-full accent-[#c19a6b]"
                    style={sliderStyle(((liveIntensity - 1) / 9) * 100)}
                  />
                  <div className="flex h-10 w-12 shrink-0 items-center justify-center rounded-md bg-[#1e1711] border border-[#3a2d22]">
                    <span className="text-sm font-semibold text-[#f5f0e9]">
                      {Math.round(liveIntensity)}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-[#8f8270] leading-relaxed">
                  1 = close to skin · 10 = room-filling trail.
                </p>
              </div>

              {/* Energy */}
              <div className="space-y-3">
                <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b5a896]">
                  Energy
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={liveEnergy}
                  onChange={(e) => setLiveEnergy(Number(e.target.value))}
                  onPointerUp={(e) =>
                    setForm((f) => ({
                      ...f,
                      energy: Number((e.target as HTMLInputElement).value),
                    }))
                  }
                  onTouchEnd={(e) =>
                    setForm((f) => ({
                      ...f,
                      energy: Number((e.target as HTMLInputElement).value),
                    }))
                  }
                  onKeyUp={(e) =>
                    setForm((f) => ({
                      ...f,
                      energy: Number((e.target as HTMLInputElement).value),
                    }))
                  }
                  className="w-full accent-[#c19a6b]"
                  style={sliderStyle(liveEnergy)}
                />
                <div className="flex justify-between text-[10px] text-[#8f8270]">
                  <span>Calm & Relaxed</span>
                  <span>Energetic & Vibrant</span>
                </div>
              </div>

              {/* Style */}
              <div className="space-y-3">
                <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b5a896]">
                  Style
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={liveStyle}
                  onChange={(e) => setLiveStyle(Number(e.target.value))}
                  onPointerUp={(e) =>
                    setForm((f) => ({
                      ...f,
                      style: Number((e.target as HTMLInputElement).value),
                    }))
                  }
                  onTouchEnd={(e) =>
                    setForm((f) => ({
                      ...f,
                      style: Number((e.target as HTMLInputElement).value),
                    }))
                  }
                  onKeyUp={(e) =>
                    setForm((f) => ({
                      ...f,
                      style: Number((e.target as HTMLInputElement).value),
                    }))
                  }
                  className="w-full accent-[#c19a6b]"
                  style={sliderStyle(liveStyle)}
                />
                <div className="flex justify-between text-[10px] text-[#8f8270]">
                  <span>Classic & Timeless</span>
                  <span>Bold & Unconventional</span>
                </div>
              </div>

              {/* Mood */}
              <div className="space-y-3">
                <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b5a896]">
                  Mood
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={liveMood}
                  onChange={(e) => setLiveMood(Number(e.target.value))}
                  onPointerUp={(e) =>
                    setForm((f) => ({
                      ...f,
                      mood: Number((e.target as HTMLInputElement).value),
                    }))
                  }
                  onTouchEnd={(e) =>
                    setForm((f) => ({
                      ...f,
                      mood: Number((e.target as HTMLInputElement).value),
                    }))
                  }
                  onKeyUp={(e) =>
                    setForm((f) => ({
                      ...f,
                      mood: Number((e.target as HTMLInputElement).value),
                    }))
                  }
                  className="w-full accent-[#c19a6b]"
                  style={sliderStyle(liveMood)}
                />
                <div className="flex justify-between text-[10px] text-[#8f8270]">
                  <span>Warm & Comforting</span>
                  <span>Fresh & Invigorating</span>
                </div>
              </div>

              {/* Complexity */}
              <div className="space-y-3">
                <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b5a896]">
                  Complexity
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={liveComplexity}
                  onChange={(e) => setLiveComplexity(Number(e.target.value))}
                  onPointerUp={(e) =>
                    setForm((f) => ({
                      ...f,
                      complexity: Number((e.target as HTMLInputElement).value),
                    }))
                  }
                  onTouchEnd={(e) =>
                    setForm((f) => ({
                      ...f,
                      complexity: Number((e.target as HTMLInputElement).value),
                    }))
                  }
                  onKeyUp={(e) =>
                    setForm((f) => ({
                      ...f,
                      complexity: Number((e.target as HTMLInputElement).value),
                    }))
                  }
                  className="w-full accent-[#c19a6b]"
                  style={sliderStyle(liveComplexity)}
                />
                <div className="flex justify-between text-[10px] text-[#8f8270]">
                  <span>Simple & Clean</span>
                  <span>Complex & Layered</span>
                </div>
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
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => {
                        const next = Math.max(20, form.budget - 5);
                        setForm((f) => ({ ...f, budget: next }));
                        setBudgetStr(String(next));
                      }}
                      className="flex h-[38px] w-8 items-center justify-center rounded-l-md border border-r-0 border-[#3a2d22] bg-[#1a130e] text-[#8f8270] transition-all hover:bg-[#261e14] hover:text-[#c19a6b]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-3.5 w-3.5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 10a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H4.75A.75.75 0 0 1 4 10Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8f8270] text-sm">
                        $
                      </span>
                      <input
                        id="budget"
                        type="text"
                        inputMode="numeric"
                        value={budgetStr}
                        placeholder="120"
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^0-9]/g, "");
                          setBudgetStr(raw);
                          const n = Number(raw);
                          if (raw && !isNaN(n))
                            setForm((f) => ({ ...f, budget: n }));
                        }}
                        onBlur={() => {
                          if (!budgetStr) setBudgetStr(String(form.budget));
                        }}
                        className="w-24 border-y border-[#3a2d22] bg-[#18110d] pl-7 pr-3 py-2 text-sm font-medium text-[#f5f0e9] placeholder-[#5a4e42] outline-none focus:border-[#c19a6b] focus:ring-1 focus:ring-[#c19a6b]/70 transition-all text-center"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const next = form.budget + 5;
                        setForm((f) => ({ ...f, budget: next }));
                        setBudgetStr(String(next));
                      }}
                      className="flex h-[38px] w-8 items-center justify-center rounded-r-md border border-l-0 border-[#3a2d22] bg-[#1a130e] text-[#8f8270] transition-all hover:bg-[#261e14] hover:text-[#c19a6b]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-3.5 w-3.5"
                      >
                        <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                      </svg>
                    </button>
                  </div>
                  <span className="text-[11px] text-[#8f8270] leading-relaxed">
                    Rough full-bottle price you&apos;re comfortable with. (by 5)
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Navigation footer */}
        <div className="flex items-center justify-between border-t border-[#2a1f17] px-5 py-4 md:px-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-1.5 text-sm text-[#9a8878] transition-colors hover:text-[#c19a6b]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
                  clipRule="evenodd"
                />
              </svg>
              Back
            </button>
          ) : (
            <span />
          )}

          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="flex items-center gap-1.5 rounded-md border border-[#3a2d22] bg-[#1e1510] px-4 py-2 text-sm font-semibold text-[#f5f0e9] transition-all hover:border-[#c19a6b]/60 hover:bg-[#261a10]"
            >
              Next
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!canSubmit}
              className={`inline-flex items-center gap-2 rounded-md px-5 py-2 text-sm font-semibold tracking-wide transition-all duration-200 ${
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
          )}
        </div>
      </form>
    </section>
  );
};
