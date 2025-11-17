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
    <div className="max-w-sm rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl shadow-black/40">
      {/* Brand */}
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {brand}
      </div>

      {/* Name */}
      <h3 className="mt-1 text-xl font-bold text-slate-100">{name}</h3>

      {/* Meta row */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
        <span className="rounded-full bg-slate-800 px-3 py-1 capitalize">
          Season: {season}
        </span>
        <span className="rounded-full bg-slate-800 px-3 py-1">
          ${price} · {sizeMl} mL
        </span>
      </div>

      {/* Notes */}
      <div className="mt-4 flex flex-wrap gap-2">
        {notes.map((n) => (
          <span
            key={n}
            className="rounded-lg bg-slate-800 px-2 py-1 text-xs text-slate-200 capitalize"
          >
            {n}
          </span>
        ))}
      </div>
    </div>
  );
};