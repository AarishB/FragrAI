import React, { useEffect, useMemo, useState } from "react";
import type { FormState, Rec, Session, User } from "./lib/types";
import { getRecommendations } from "./lib/api";
import { Layout } from "./Components/Layout";
import { PreferencesForm } from "./Components/PreferencesForm";
import { ResultsPanel } from "./Components/ResultsPanel";
import { ProfilePage } from "./Components/ProfilePage";
import { SignUpPage } from "./Components/SignUpPage";
import { LoginPage } from "./Components/LoginPage";
import { LoggedOutPage } from "./Components/LoggedOutPage";
import { UserProfilePage } from "./Components/UserProfilePage";

type Page = "home" | "profile" | "signup" | "login" | "logged-out" | "user-profile";

const App: React.FC = () => {
  const [page, setPage] = useState<Page>("home");

  // Auth state
  const [session, setSession] = useState<Session | null>(() => {
    try {
      return JSON.parse(localStorage.getItem("fragr-session") ?? "null");
    } catch {
      return null;
    }
  });

  function handleSignUp(username: string, email: string, password: string): string | null {
    const raw = localStorage.getItem("fragr-users");
    const users: User[] = raw ? JSON.parse(raw) : [];
    if (users.some((u) => u.email === email)) {
      return "An account with that email already exists.";
    }
    const newUser: User = { username, email, password };
    const updated = [...users, newUser];
    localStorage.setItem("fragr-users", JSON.stringify(updated));
    const newSession: Session = { username, email };
    localStorage.setItem("fragr-session", JSON.stringify(newSession));
    setSession(newSession);
    setPage("home");
    return null;
  }

  function handleLogin(email: string, password: string): string | null {
    const raw = localStorage.getItem("fragr-users");
    const users: User[] = raw ? JSON.parse(raw) : [];
    const match = users.find((u) => u.email === email && u.password === password);
    if (!match) {
      return "Incorrect email or password.";
    }
    const newSession: Session = {
      username: match.username,
      email: match.email,
      displayName: match.displayName,
      avatarUrl: match.avatarUrl,
    };
    localStorage.setItem("fragr-session", JSON.stringify(newSession));
    setSession(newSession);
    setPage("home");
    return null;
  }

  function handleLogout() {
    localStorage.removeItem("fragr-session");
    setSession(null);
    setPage("logged-out");
  }

  function handleUpdateProfile(displayName: string, avatarUrl: string) {
    if (!session) return;
    const raw = localStorage.getItem("fragr-users");
    const users: User[] = raw ? JSON.parse(raw) : [];
    const updated = users.map((u) =>
      u.email === session.email ? { ...u, displayName, avatarUrl } : u
    );
    localStorage.setItem("fragr-users", JSON.stringify(updated));
    const newSession: Session = { ...session, displayName, avatarUrl };
    localStorage.setItem("fragr-session", JSON.stringify(newSession));
    setSession(newSession);
  }

  // Form state
  const [form, setForm] = useState<FormState>({
    season: "any",
    intensity: 6,
    budget: 0,
    notes: [],
    energy: 50,
    style: 50,
    mood: 50,
    complexity: 50,
  });

  const [loading, setLoading] = useState(false);
  const [recs, setRecs] = useState<Rec[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [likedRecs, setLikedRecs] = useState<Rec[]>([]);

  // Reload liked recs whenever session changes (login/logout/signup)
  useEffect(() => {
    if (!session) {
      setLikedRecs([]);
      return;
    }
    try {
      const key = `fragr-liked-${session.email}`;
      setLikedRecs(JSON.parse(localStorage.getItem(key) ?? "[]"));
    } catch {
      setLikedRecs([]);
    }
  }, [session]);

  const canSubmit = useMemo(
    () => !loading && form.notes.length > 0 && form.budget > 0,
    [loading, form.notes.length, form.budget]
  );

  function onToggleLike(rec: Rec) {
    if (!session) return;
    setLikedRecs((prev) => {
      const isLiked = prev.some((r) => r.id === rec.id);
      const next = isLiked ? prev.filter((r) => r.id !== rec.id) : [...prev, rec];
      localStorage.setItem(`fragr-liked-${session.email}`, JSON.stringify(next));
      return next;
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await getRecommendations(form);
      setRecs(data);
    } catch {
      setError("Prediction failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout currentPage={page} onNavigate={setPage} session={session} onLogout={handleLogout}>
      {page === "home" && (
        <>
          <div className="grid gap-10 lg:grid-cols-[1.2fr,1fr] lg:gap-12">
            <PreferencesForm
              form={form}
              setForm={setForm}
              loading={loading}
              canSubmit={canSubmit}
              onSubmit={onSubmit}
            />
            <ResultsPanel
              recs={recs}
              likedRecs={likedRecs}
              onToggleLike={onToggleLike}
              isLoggedIn={!!session}
              onReset={() => setRecs(null)}
            />
          </div>
          {error && (
            <div className="mt-6 rounded-xl border border-red-500/50 bg-red-500/10 px-5 py-3 text-sm text-red-300 backdrop-blur">
              ⚠️ {error}
            </div>
          )}
        </>
      )}

      {page === "profile" && (
        <ProfilePage
          likedRecs={likedRecs}
          onToggleLike={onToggleLike}
          onNavigateHome={() => setPage("home")}
          isLoggedIn={!!session}
          onGoLogin={() => setPage("login")}
        />
      )}

      {page === "signup" && (
        <SignUpPage onSignUp={handleSignUp} onGoLogin={() => setPage("login")} onGuest={() => setPage("home")} />
      )}

      {page === "login" && (
        <LoginPage onLogin={handleLogin} onGoSignUp={() => setPage("signup")} onGuest={() => setPage("home")} />
      )}

      {page === "logged-out" && (
        <LoggedOutPage
          onGoSignUp={() => setPage("signup")}
          onGoLogin={() => setPage("login")}
          onGuest={() => setPage("home")}
        />
      )}

      {page === "user-profile" && session && (
        <UserProfilePage
          session={session}
          onSave={handleUpdateProfile}
          onBack={() => setPage("home")}
        />
      )}
    </Layout>
  );
};

export default App;
