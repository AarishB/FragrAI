import React from "react";

export const Pill: React.FC<{
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3.5 py-1.5 rounded-md border text-[11px] uppercase tracking-wide transition-all duration-200 ${
      active
        ? // ACTIVE STATE — gold accent, warm black background
          "border-[#c19a6b] bg-[#3a2a1f] text-[#f5f0e9] shadow-[0_0_12px_rgba(193,154,107,0.25)] scale-[1.02]"
        : // INACTIVE STATE — matte black, subtle label look
          "border-[#3a2d22] bg-[#17120e] text-[#b8ad99] hover:border-[#c19a6b]/70 hover:text-[#f5f0e9] hover:scale-[1.03]"
    }`}
    style={{ fontFamily: "Inter, sans-serif" }}
  >
    {children}
  </button>
);