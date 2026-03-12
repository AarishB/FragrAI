import React from "react";
import type { Session } from "../lib/types";

type Page = "home" | "profile" | "signup" | "login" | "logged-out" | "user-profile";

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  session: Session | null;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate, session, onLogout }) => {
  return (
    <div className="min-h-screen bg-[#0f0d0a] text-[#f5f0e9]">

      {/* Top Bar */}
      <header className="sticky top-0 z-50 border-b border-[#3a2d22] bg-[#14100c]/95 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

          {/* Logo + Name — clickable, goes home */}
          <button
            onClick={() => onNavigate("home")}
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-md
                            bg-[#1d1812] border border-[#c19a6b]/40">
              <span
                className="text-xs tracking-[0.18em] text-[#e8e0d4]"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                
              </span>
            </div>

            <div className="space-y-0 leading-none text-left">
              <h1
                className="text-sm font-semibold tracking-[0.2em] uppercase text-[#f5f0e9]"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                FragrAI
              </h1>
              <p className="text-[11px] text-[#b5a896]">
                AI-Powered Fragrance Recommendation Engine
              </p>
            </div>
          </button>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Collection / Profile nav button */}
            <button
              onClick={() => onNavigate(currentPage === "profile" ? "home" : "profile")}
              className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition-all duration-200 ${
                currentPage === "profile"
                  ? "border-[#c19a6b] text-[#c19a6b] bg-[#1d1812]"
                  : "border-[#3a2d22] text-[#b5a896] hover:border-[#c19a6b]/60 hover:text-[#e2d6c4]"
              }`}
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={currentPage === "profile" ? "#c19a6b" : "none"}
                stroke="currentColor"
                strokeWidth={2}
                className="h-3.5 w-3.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
                />
              </svg>
              Collection
            </button>

            {/* Divider */}
            <div className="h-4 w-px bg-[#3a2d22]" />

            {session ? (
              /* Logged-in state */
              <>
                {/* Avatar circle — navigates to user profile */}
                <button
                  onClick={() => onNavigate("user-profile")}
                  className={`relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 transition-all duration-200 ${
                    currentPage === "user-profile"
                      ? "border-[#c19a6b]"
                      : "border-[#3a2d22] hover:border-[#c19a6b]/70"
                  }`}
                  title={`${session.displayName ?? session.username}'s profile`}
                >
                  {session.avatarUrl ? (
                    <img
                      src={session.avatarUrl}
                      alt="avatar"
                      className="h-full w-full object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <span
                      className="text-[12px] font-semibold text-[#c19a6b] bg-[#1d1812] w-full h-full flex items-center justify-center"
                      style={{ fontFamily: "Playfair Display, serif" }}
                    >
                      {(session.displayName ?? session.username).charAt(0).toUpperCase()}
                    </span>
                  )}
                </button>

                <button
                  onClick={onLogout}
                  className="rounded-md border border-[#3a2d22] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b5a896] transition-all duration-200 hover:border-[#c19a6b]/60 hover:text-[#e2d6c4]"
                  style={{ fontFamily: "Playfair Display, serif" }}
                >
                  Log Out
                </button>
              </>
            ) : (
              /* Logged-out state */
              <>
                <button
                  onClick={() => onNavigate("signup")}
                  className={`rounded-md border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition-all duration-200 ${
                    currentPage === "signup"
                      ? "border-[#c19a6b] text-[#c19a6b] bg-[#1d1812]"
                      : "border-[#3a2d22] text-[#b5a896] hover:border-[#c19a6b]/60 hover:text-[#e2d6c4]"
                  }`}
                  style={{ fontFamily: "Playfair Display, serif" }}
                >
                  Sign Up
                </button>

                <button
                  onClick={() => onNavigate("login")}
                  className={`rounded-md border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition-all duration-200 ${
                    currentPage === "login"
                      ? "border-[#c19a6b] text-[#c19a6b] bg-[#261e14]"
                      : "border-[#c19a6b]/50 bg-[#1d1812] text-[#c19a6b] hover:bg-[#261e14] hover:border-[#c19a6b]"
                  }`}
                  style={{ fontFamily: "Playfair Display, serif" }}
                >
                  Log In
                </button>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#3a2d22] bg-[#14100c]">
        <div className="mx-auto flex max-w-6xl items-center justify-between
                        px-6 py-6 text-[11px] text-[#b5a896]">
          <span>© {new Date().getFullYear()} FragrAI</span>
          <span></span>
        </div>
      </footer>
    </div>
  );
};
