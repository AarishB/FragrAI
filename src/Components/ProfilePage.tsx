import React from "react";
import type { Rec } from "../lib/types";

interface ProfilePageProps {
  likedRecs: Rec[];
  onToggleLike: (rec: Rec) => void;
  onNavigateHome: () => void;
  isLoggedIn: boolean;
  onGoLogin: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  likedRecs,
  onToggleLike,
  onNavigateHome,
  isLoggedIn,
  onGoLogin,
}) => {
  return (
    <section className="space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <p className="text-[11px] tracking-[0.32em] uppercase text-[#b5a896]">
          Your saved picks
        </p>
        <h1
          className="text-3xl md:text-4xl font-semibold text-[#f5f0e9]"
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          Your collection.
        </h1>
        <p className="text-[13px] text-[#c3b7a4] max-w-md leading-relaxed">
          Fragrances you've hearted across your sessions. Click any card to shop.
        </p>
      </div>

      {/* Guest state — not logged in */}
      {!isLoggedIn && (
        <div className="rounded-2xl border border-[#3b2a1d] bg-gradient-to-br from-[#15100d] via-[#18110e] to-[#221510] px-8 py-12 shadow-[0_20px_55px_rgba(0,0,0,0.7)] max-w-lg">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#b5a896] mb-3"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            account required
          </p>
          <p className="text-sm text-[#c3b7a4] leading-relaxed mb-6">
            Log in or create an account to save fragrances to your collection.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onGoLogin}
              className="inline-flex items-center gap-2 rounded-md border border-[#c19a6b]/80 bg-[#4a1515] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#f5f0e9] transition-all duration-200 hover:bg-[#6b1f1f] hover:border-[#d8b373]"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              Log In
            </button>
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-2 rounded-md border border-[#3a2d22] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#b5a896] transition-all duration-200 hover:border-[#c19a6b]/60 hover:text-[#e2d6c4]"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              ← Back
            </button>
          </div>
        </div>
      )}

      {/* Empty state — logged in but no likes */}
      {isLoggedIn && likedRecs.length === 0 && (
        <div className="rounded-2xl border border-[#3b2a1d] bg-gradient-to-br from-[#15100d] via-[#18110e] to-[#221510] px-8 py-12 shadow-[0_20px_55px_rgba(0,0,0,0.7)] max-w-lg">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#b5a896] mb-3"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            nothing saved yet
          </p>
          <p className="text-sm text-[#c3b7a4] leading-relaxed mb-6">
            Head back and heart a few picks from your results. They'll live here
            across sessions.
          </p>
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 rounded-md border border-[#c19a6b]/60 bg-[#1d1812] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#c19a6b] transition-all duration-200 hover:bg-[#261e14] hover:border-[#c19a6b]"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            ← Back to recommendations
          </button>
        </div>
      )}

      {/* Liked list */}
      {likedRecs.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {likedRecs.map((r) => (
            <div key={r.id} className="relative">
              <a
                href={r.url || "#"}
                target="_blank"
                rel="noreferrer"
                className="group block overflow-hidden rounded-xl border border-[#3b2a1d] bg-gradient-to-br from-[#15100d] via-[#18110e] to-[#291610] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.75)] transition-all duration-300 hover:-translate-y-1 hover:border-[#c19a6b]"
              >
                {/* Unlike button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleLike(r);
                  }}
                  className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-md bg-[#1b1510] border border-[#c19a6b]/40 transition-all duration-200 hover:border-[#c19a6b]"
                  aria-label="Remove from collection"
                >
                  <span className="text-[14px] leading-none" style={{ color: "#c19a6b" }}>♥</span>
                </button>

                {/* Content */}
                <div className="space-y-3 pr-10">
                  {/* Brand */}
                  <p
                    className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#b4a692]"
                    style={{ fontFamily: "Playfair Display, serif" }}
                  >
                    {r.brand}
                  </p>

                  {/* Name */}
                  <h3
                    className="text-base font-semibold text-[#f5f0e9] leading-tight group-hover:text-[#c19a6b] transition-colors duration-300"
                    style={{ fontFamily: "Playfair Display, serif" }}
                  >
                    {r.name}
                  </h3>

                  {/* Match + Season */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#c3b7a4]">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1c1510] px-2.5 py-1 border border-[#3b2a1d]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#c19a6b]" />
                      <span className="font-semibold text-[#e2d6c4]">
                        {(r.match * 100).toFixed(0)}% match
                      </span>
                    </span>
                    <span className="rounded-full bg-[#261a14] px-2.5 py-1 border border-[#3b2a1d] capitalize">
                      {r.season}
                    </span>
                  </div>

                  {/* Notes */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {r.notes.map((n) => (
                      <span
                        key={n}
                        className="rounded-md border border-[#3b2a1d] bg-[#17120e] px-2 py-0.5 text-[10px] text-[#e2d6c4] capitalize"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Back link when collection has items */}
      {likedRecs.length > 0 && (
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-[12px] text-[#b5a896] hover:text-[#e2d6c4] transition-colors duration-200"
        >
          ← Back to recommendations
        </button>
      )}
    </section>
  );
};
