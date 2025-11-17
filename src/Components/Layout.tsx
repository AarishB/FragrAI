import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Top nav */}
      <header className="sticky top-0 z-50 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-400 to-sky-400 shadow-lg shadow-emerald-500/20" />
            <div className="text-lg font-bold tracking-tight">FragrAI</div>
          </div>

          <span className="hidden text-xs text-slate-500 md:inline">
            Senior Research · ML fragrance recommender
          </span>
        </nav>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-xs text-slate-600">
          <span>© {new Date().getFullYear()} FragrAI</span>
          <span>Built for Senior Research</span>
        </div>
      </footer>
    </div>
  );
};