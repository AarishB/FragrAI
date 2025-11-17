import React from "react";

export const Pill: React.FC<{
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-all duration-200 capitalize ${
      active
        ? "bg-emerald-500 text-slate-950 border-emerald-500 shadow-lg shadow-emerald-500/30 scale-105"
        : "bg-slate-800/50 text-slate-300 border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800 hover:text-emerald-400 hover:scale-105"
    }`}
  >
    {children}
  </button>
);