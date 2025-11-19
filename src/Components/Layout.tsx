import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#0f0d0a] text-[#f5f0e9]">

      {/* Top Bar */}
      <header className="sticky top-0 z-50 border-b border-[#3a2d22] bg-[#14100c]/95 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

          {/* Logo + Name */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md 
                            bg-[#1d1812] border border-[#c19a6b]/40">
              <span
                className="text-xs tracking-[0.18em] text-[#e8e0d4]"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                FA
              </span>
            </div>

            <div className="space-y-0 leading-none">
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
          </div>

          {/* Right side text */}
          <span className="hidden text-[11px] text-[#b5a896] md:inline">
            Senior Research · Oud Wood Edition
          </span>
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
          <span>© {new Date().getFullYear()} FragrAI · Oud Wood Edition</span>
          <span>Prototype · Built for Senior Research</span>
        </div>
      </footer>
    </div>
  );
};