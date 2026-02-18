import React from "react";

interface LoggedOutPageProps {
  onGoSignUp: () => void;
  onGoLogin: () => void;
  onGuest: () => void;
}

export const LoggedOutPage: React.FC<LoggedOutPageProps> = ({ onGoSignUp, onGoLogin, onGuest }) => {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md space-y-8 text-center">

        {/* Header */}
        <div className="space-y-3">
          <p className="text-[11px] tracking-[0.32em] uppercase text-[#b5a896]">
            You've been logged out
          </p>
          <h1
            className="text-3xl font-semibold text-[#f5f0e9]"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            Come back anytime.
          </h1>
          <p className="text-[13px] text-[#c3b7a4] leading-relaxed">
            Log back in to access your collection, or continue as a guest.
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={onGoLogin}
            className="w-full rounded-md border border-[#c19a6b]/80 bg-[#4a1515] px-5 py-3 text-sm font-semibold uppercase tracking-wide text-[#f5f0e9] transition-all duration-200 hover:bg-[#6b1f1f] hover:border-[#d8b373]"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            Log In
          </button>

          <button
            onClick={onGoSignUp}
            className="w-full rounded-md border border-[#3a2d22] bg-[#18110d] px-5 py-3 text-sm font-semibold uppercase tracking-wide text-[#b5a896] transition-all duration-200 hover:border-[#c19a6b]/60 hover:text-[#e2d6c4]"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            Create an Account
          </button>

          <button
            onClick={onGuest}
            className="w-full py-2 text-[12px] text-[#6f6253] hover:text-[#b5a896] transition-colors duration-200"
          >
            Continue as guest
          </button>
        </div>

      </div>
    </div>
  );
};
