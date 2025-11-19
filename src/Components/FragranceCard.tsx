import React from "react";

interface FragranceCardProps {
  name: string;
  brand: string;
  season: string;
  notes: string[];
  price: number;
  sizeMl: number;
}

export const FragranceCard: React.FC<FragranceCardProps> = ({
  name,
  brand,
  season,
  notes,
  price,
  sizeMl,
}) => {
  return (
    <article className="max-w-sm rounded-xl border border-[#3b2a1d] bg-gradient-to-br from-[#15100d] via-[#18110e] to-[#261511] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.75)] transition-all duration-200 hover:-translate-y-1 hover:border-[#c19a6b]">
      {/* Brand */}
      <p
        className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#b4a692] mb-1"
        style={{ fontFamily: "Playfair Display, serif" }}
      >
        {brand}
      </p>

      {/* Name */}
      <h3
        className="text-xl font-semibold text-[#f5f0e9] leading-snug"
        style={{ fontFamily: "Playfair Display, serif" }}
      >
        {name}
      </h3>

      {/* Meta row */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-[#c3b7a4]">
        <span className="rounded-full bg-[#1b1510] px-3 py-1 capitalize border border-[#3b2a1d]">
          Season: {season}
        </span>
        <span className="rounded-full bg-[#3a1517] px-3 py-1 border border-[#6a2527] text-[#f2e4db]">
          ${price} · {sizeMl} mL
        </span>
      </div>

      {/* Notes */}
      <div className="mt-4 flex flex-wrap gap-2">
        {notes.map((n) => (
          <span
            key={n}
            className="rounded-md border border-[#3b2a1d] bg-[#17120e] px-2.5 py-1 text-[11px] text-[#e2d6c4] capitalize"
          >
            {n}
          </span>
        ))}
      </div>
    </article>
  );
};