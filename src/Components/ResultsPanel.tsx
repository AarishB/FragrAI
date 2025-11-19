import React from "react";
import type { Rec } from "../lib/types";

interface ResultsPanelProps {
  recs: Rec[] | null;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ recs }) => {
  const hasRecs = recs && recs.length > 0;

  return (
    <section className="flex-1 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h2
          className="text-2xl font-semibold text-[#f5f0e9]"
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          Top matches
        </h2>
        <p className="text-[12px] text-[#b5a896]">
          Three selections tailored to your preferences.
        </p>
      </div>

      {/* Empty state */}
      {!hasRecs && (
        <div className="rounded-2xl border border-[#3b2a1d] bg-gradient-to-br from-[#15100d] via-[#18110e] to-[#221510] px-6 py-10 shadow-[0_20px_55px_rgba(0,0,0,0.7)]">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#b5a896] mb-2"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            awaiting selection
          </p>

          <p className="text-sm text-[#c3b7a4] leading-relaxed max-w-sm">
            Choose a season, intensity, budget, and several notes. When you
            click <span className="font-semibold text-[#e2d6c4]">Get 3 picks</span>,
            your tailored matches will appear here.
          </p>
        </div>
      )}

      {/* Result list */}
      {hasRecs && (
        <div className="space-y-6">
          {recs!.map((r, idx) => (
            <a
              key={r.id}
              href={r.url || "#"}
              target="_blank"
              rel="noreferrer"
              className="group relative block overflow-hidden rounded-xl border border-[#3b2a1d] bg-gradient-to-br from-[#15100d] via-[#18110e] to-[#291610] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.75)] transition-all duration-300 hover:-translate-y-1 hover:border-[#c19a6b]"
            >
              {/* Rank badge */}
              <div className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-md bg-[#1b1510] border border-[#3b2a1d] text-[11px] font-semibold text-[#e2d6c4]">
                #{idx + 1}
              </div>

              {/* Content */}
              <div className="space-y-3 pr-12">
                {/* Brand */}
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#b4a692]"
                  style={{ fontFamily: "Playfair Display, serif" }}
                >
                  {r.brand}
                </p>

                {/* Name */}
                <h3
                  className="text-lg font-semibold text-[#f5f0e9] leading-tight group-hover:text-[#c19a6b] transition-colors duration-300"
                  style={{ fontFamily: "Playfair Display, serif" }}
                >
                  {r.name}
                </h3>

                {/* Match + Season */}
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#c3b7a4]">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#1c1510] px-3 py-1 border border-[#3b2a1d]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#c19a6b]" />
                    <span className="font-semibold text-[#e2d6c4]">
                      {(r.match * 100).toFixed(0)}% match
                    </span>
                  </span>

                  <span className="rounded-full bg-[#261a14] px-3 py-1 border border-[#3b2a1d] capitalize">
                    {r.season}
                  </span>
                </div>

                {/* Notes */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {r.notes.map((n) => (
                    <span
                      key={n}
                      className="rounded-md border border-[#3b2a1d] bg-[#17120e] px-2.5 py-1 text-[11px] text-[#e2d6c4] capitalize"
                    >
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
};