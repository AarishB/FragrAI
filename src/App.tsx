import React, { useMemo, useState } from "react";
import type { FormState, Rec } from "./lib/types";
import { getRecommendations } from "./lib/api";
import { Layout } from "./Components/Layout";
import { PreferencesForm } from "./Components/PreferencesForm";
import { ResultsPanel } from "./Components/ResultsPanel";
import { FragranceCard } from "./Components/FragranceCard";

const App: React.FC = () => {
  const [form, setForm] = useState<FormState>({
    season: "any",
    intensity: 6,
    budget: 120,
    notes: [],
  });

  const [loading, setLoading] = useState(false);
  const [recs, setRecs] = useState<Rec[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => !loading && form.notes.length > 0,
    [loading, form.notes.length]
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await getRecommendations(form);
      setRecs(data);
    } catch {
      setError("Prediction failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="grid gap-10 lg:grid-cols-[1.2fr,1fr] lg:gap-12">
        {/* Left column: form */}
        <PreferencesForm
          form={form}
          setForm={setForm}
          loading={loading}
          canSubmit={canSubmit}
          onSubmit={onSubmit}
        />

        {/* Right column: results */}
        <ResultsPanel recs={recs} />
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-500/50 bg-red-500/10 px-5 py-3 text-sm text-red-300 backdrop-blur">
          ⚠️ {error}
        </div>
      )}
            {/* Temporary demo section for your own fragrances */}
      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold text-slate-100">
          Sample fragrance card
        </h2>
        <p className="text-sm text-slate-400">
          This is just a demo of how your own collection could look. Later you
          can map over an array of all your bottles.
        </p>

        <FragranceCard
          name="Acqua di Giò Parfum"
          brand="Armani"
          season="summer"
          notes={["aquatic", "citrus", "woody"]}
          price={135}
          sizeMl={75}
        />
      </section>
    </Layout>
  );
};

export default App;