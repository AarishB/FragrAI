import React, { useState } from "react";

interface LoginPageProps {
  onLogin: (email: string, password: string) => string | null;
  onGoSignUp: () => void;
  onGuest: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onGoSignUp, onGuest }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) { setError("Email is required."); return; }
    if (!password) { setError("Password is required."); return; }
    const err = onLogin(email.trim(), password);
    if (err) setError(err);
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <p className="text-[11px] tracking-[0.32em] uppercase text-[#b5a896]">
            Welcome back
          </p>
          <h1
            className="text-3xl font-semibold text-[#f5f0e9]"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            Log in to FragrAI.
          </h1>
          <p className="text-[13px] text-[#c3b7a4] leading-relaxed">
            Pick up where you left off.
          </p>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-[#3a2d22] bg-gradient-to-br from-[#15100d] via-[#17110e] to-[#231510] p-6 shadow-[0_22px_50px_rgba(0,0,0,0.7)]"
        >
          {/* Email */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b5a896]">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-md border border-[#3a2d22] bg-[#18110d] px-4 py-2.5 text-sm text-[#f5f0e9] placeholder-[#5a4e42] outline-none focus:border-[#c19a6b] focus:ring-1 focus:ring-[#c19a6b]/70 transition-all"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b5a896]">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="w-full rounded-md border border-[#3a2d22] bg-[#18110d] px-4 py-2.5 text-sm text-[#f5f0e9] placeholder-[#5a4e42] outline-none focus:border-[#c19a6b] focus:ring-1 focus:ring-[#c19a6b]/70 transition-all"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-[12px] text-red-300">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full rounded-md border border-[#c19a6b]/80 bg-[#4a1515] px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-[#f5f0e9] transition-all duration-200 hover:bg-[#6b1f1f] hover:border-[#d8b373]"
          >
            Log In
          </button>

          {/* Switch to sign up */}
          <p className="text-center text-[12px] text-[#8f8270]">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={onGoSignUp}
              className="text-[#c19a6b] hover:text-[#d8b373] transition-colors"
            >
              Sign up
            </button>
          </p>

          {/* Guest */}
          <button
            type="button"
            onClick={onGuest}
            className="w-full py-1 text-[12px] text-[#6f6253] hover:text-[#b5a896] transition-colors duration-200"
          >
            Continue as guest
          </button>
        </form>
      </div>
    </div>
  );
};
