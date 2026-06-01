import React, { useState } from "react";
import type { Rec } from "../lib/types";
import { sendFeedback } from "../lib/api";

interface ResultsPanelProps {
  recs: Rec[] | null;
  likedRecs: Rec[];
  onToggleLike: (rec: Rec) => void;
  isLoggedIn: boolean;
  onReset: () => void;
  userDescription?: string;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ recs, likedRecs, onToggleLike, isLoggedIn, onReset, userDescription = "" }) => {
  const hasRecs = recs && recs.length > 0;
  const [votes, setVotes] = useState<Record<string, boolean | null>>({});

  function handleVote(rec: Rec, liked: boolean) {
    const current = votes[rec.id];
    const next = current === liked ? null : liked;
    setVotes((v) => ({ ...v, [rec.id]: next }));
    if (next !== null) sendFeedback(rec, liked, userDescription);
  }

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
          {recs!.map((r, idx) => {
            const isLiked = likedRecs.some((lr) => lr.id === r.id);
            return (
              <a
                key={r.id}
                href={r.url || "#"}
                target="_blank"
                rel="noreferrer"
                className="group relative block overflow-hidden rounded-xl border border-[#3b2a1d] bg-gradient-to-br from-[#15100d] via-[#18110e] to-[#291610] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.75)] transition-all duration-300 hover:-translate-y-1 hover:border-[#c19a6b]"
              style={{ position: "relative" }}
              >
                {/* Dupes overlay on hover */}
                {r.dupes && r.dupes.length > 0 && (
                  <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-[#0e0b08]/95 via-[#0e0b08]/80 to-transparent px-5 pb-5 pt-12">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#c19a6b] mb-2">
                      Cheaper alternatives
                    </p>
                    <div className="space-y-2">
                      {r.dupes.map((d, i) => (
                        <div key={i} className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[12px] font-semibold text-[#f5f0e9]">{d.name}</span>
                            <span className="ml-1.5 text-[11px] text-[#9a8878]">by {d.designer}</span>
                            {d.reason && (
                              <p className="text-[10px] text-[#7a6e62] leading-snug mt-0.5">{d.reason}</p>
                            )}
                          </div>
                          {d.price_usd && (
                            <span className="shrink-0 rounded-full bg-[#1e1510] border border-[#3b2a1d] px-2.5 py-0.5 text-[11px] text-[#c19a6b]">
                              {d.price_usd}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top-right controls: thumbs + heart + rank */}
                <div className="absolute right-5 top-5 flex items-center gap-2">
                  {/* Thumbs up */}
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVote(r, true); }}
                    className={`flex h-7 w-7 items-center justify-center rounded-md border transition-all duration-200 cursor-pointer ${
                      votes[r.id] === true
                        ? "bg-[#1a3320] border-[#4caf50] text-[#4caf50]"
                        : "bg-[#1b1510] border-[#3b2a1d] text-[#6f6253] hover:border-[#4caf50]/60 hover:text-[#4caf50]"
                    }`}
                    title="This was a good match"
                    aria-label="Thumbs up"
                  >
                    <span className="text-[13px] leading-none">👍</span>
                  </button>

                  {/* Thumbs down */}
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVote(r, false); }}
                    className={`flex h-7 w-7 items-center justify-center rounded-md border transition-all duration-200 cursor-pointer ${
                      votes[r.id] === false
                        ? "bg-[#331a1a] border-[#e53935] text-[#e53935]"
                        : "bg-[#1b1510] border-[#3b2a1d] text-[#6f6253] hover:border-[#e53935]/60 hover:text-[#e53935]"
                    }`}
                    title="Not quite right"
                    aria-label="Thumbs down"
                  >
                    <span className="text-[13px] leading-none">👎</span>
                  </button>

                  {/* Heart button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (isLoggedIn) onToggleLike(r);
                    }}
                    className={`flex h-7 w-7 items-center justify-center rounded-md bg-[#1b1510] border border-[#3b2a1d] transition-all duration-200 ${
                      isLoggedIn
                        ? "hover:border-[#c19a6b]/60 cursor-pointer"
                        : "cursor-not-allowed opacity-40"
                    }`}
                    title={!isLoggedIn ? "Log in to save fragrances" : isLiked ? "Remove from collection" : "Add to collection"}
                    aria-label={!isLoggedIn ? "Log in to save fragrances" : isLiked ? "Remove from collection" : "Add to collection"}
                  >
                    {isLiked ? (
                      <span className="text-[14px] leading-none" style={{ color: "#c19a6b" }}>♥</span>
                    ) : (
                      <span className="text-[14px] leading-none text-[#6f6253] group-hover:text-[#9e8a73]">♡</span>
                    )}
                  </button>

                  {/* Rank badge */}
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#1b1510] border border-[#3b2a1d] text-[11px] font-semibold text-[#e2d6c4]">
                    #{idx + 1}
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-3 pr-24">
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
            );
          })}
          <button
            type="button"
            onClick={onReset}
            className="mt-2 w-full rounded-md border border-[#3b2a1d] bg-[#15100d] py-2.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8f8270] transition-all hover:border-[#c19a6b]/50 hover:text-[#c19a6b]"
          >
            Try again
          </button>
        </div>
      )}
    </section>
  );
};
