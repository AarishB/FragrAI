import React from "react";
import type { Rec } from "../lib/types";

interface ResultsPanelProps {
  recs: Rec[] | null;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ recs }) => {
  return (
    <section className="flex-1 space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-slate-100">Top Matches</h2>
        {recs && (
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-bold text-emerald-400 border border-emerald-500/30">
            {recs.length}
          </span>
        )}
      </div>

      {/* Message when there are no recommendations yet */}
      {!recs && (
        <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/50 to-slate-900/30 p-8 text-center backdrop-blur-sm">
          <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-slate-800/50 flex items-center justify-center border border-slate-700">
            <span className="text-3xl">🎯</span>
          </div>
          <p className="text-base text-slate-400 leading-relaxed">
            Pick some preferences and click{" "}
            <span className="font-bold text-emerald-400">Get 3 picks</span> to
            see recommendations.
          </p>
        </div>
      )}

      {/* Cards when we DO have recommendations */}
      {recs && (
        <div className="grid gap-5 md:grid-cols-1">
          {recs.map((r, idx) => (
            <a
              key={r.id}
              href={r.url || "#"}
              target="_blank"
              rel="noreferrer"
              className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-900/90 p-6 shadow-2xl shadow-black/40 backdrop-blur transition-all duration-300 hover:border-emerald-500/50 hover:shadow-emerald-500/10 hover:scale-[1.01]"
            >
              {/* Rank badge */}
              <div className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/80 text-sm font-bold text-slate-500 border border-slate-700 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-all duration-300">
                #{idx + 1}
              </div>

              <div className="space-y-4 pr-16">
                {/* Brand */}
                <div className="text-xs font-bold uppercase tracking-widest text-slate-600">
                  {r.brand}
                </div>

                {/* Name */}
                <div className="text-2xl font-bold text-slate-100 leading-tight group-hover:text-emerald-400 transition-colors duration-300">
                  {r.name}
                </div>

                {/* Match and Season */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 border border-emerald-500/20">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="font-bold text-emerald-400">
                      {(r.match * 100).toFixed(0)}% match
                    </span>
                  </div>
                  <div className="rounded-full bg-slate-800/50 px-3 py-1.5 border border-slate-700">
                    <span className="capitalize text-slate-400 font-medium">
                      {r.season}
                    </span>
                  </div>
                </div>

                {/* Notes */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {r.notes.map((n) => (
                    <span
                      key={n}
                      className="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-1 text-xs font-semibold text-slate-300 capitalize"
                    >
                      {n}
                    </span>
                  ))}
                </div>
              </div>

              {/* Subtle gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-transparent transition-all duration-500 pointer-events-none rounded-2xl" />
            </a>
          ))}
        </div>
      )}
    </section>
  );
};