import React, { useState } from "react";
import type { Session } from "../lib/types";

interface UserProfilePageProps {
  session: Session;
  onSave: (displayName: string, avatarUrl: string) => void;
  onBack: () => void;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({ session, onSave, onBack }) => {
  const [displayName, setDisplayName] = useState(session.displayName ?? session.username);
  const [avatarUrl, setAvatarUrl] = useState(session.avatarUrl ?? "");
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(displayName.trim() || session.username, avatarUrl.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const previewInitial = (displayName.trim() || session.username).charAt(0).toUpperCase();

  return (
    <div className="flex min-h-[60vh] items-start justify-center pt-4">
      <div className="w-full max-w-md space-y-8">

        {/* Header */}
        <div className="space-y-2">
          <p className="text-[11px] tracking-[0.32em] uppercase text-[#b5a896]">
            Account
          </p>
          <h1
            className="text-3xl font-semibold text-[#f5f0e9]"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            Your profile.
          </h1>
          <p className="text-[13px] text-[#c3b7a4]">
            {session.email}
          </p>
        </div>

        {/* Avatar preview */}
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-[#c19a6b]/50 bg-[#1d1812]">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="avatar preview"
                className="h-full w-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            ) : (
              <span
                className="text-2xl font-semibold text-[#c19a6b]"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                {previewInitial}
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#f5f0e9]" style={{ fontFamily: "Playfair Display, serif" }}>
              {displayName.trim() || session.username}
            </p>
            <p className="text-[11px] text-[#8f8270]">@{session.username}</p>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-[#3a2d22] bg-gradient-to-br from-[#15100d] via-[#17110e] to-[#231510] p-6 shadow-[0_22px_50px_rgba(0,0,0,0.7)]"
        >
          {/* Display name */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b5a896]">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => { setDisplayName(e.target.value); setSaved(false); }}
              placeholder={session.username}
              className="w-full rounded-md border border-[#3a2d22] bg-[#18110d] px-4 py-2.5 text-sm text-[#f5f0e9] placeholder-[#5a4e42] outline-none focus:border-[#c19a6b] focus:ring-1 focus:ring-[#c19a6b]/70 transition-all"
            />
            <p className="text-[11px] text-[#6f6253]">This is what appears in the nav bar.</p>
          </div>

          {/* Avatar URL */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b5a896]">
              Profile Picture URL
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => { setAvatarUrl(e.target.value); setSaved(false); }}
              placeholder="https://example.com/your-photo.jpg"
              className="w-full rounded-md border border-[#3a2d22] bg-[#18110d] px-4 py-2.5 text-sm text-[#f5f0e9] placeholder-[#5a4e42] outline-none focus:border-[#c19a6b] focus:ring-1 focus:ring-[#c19a6b]/70 transition-all"
            />
            <p className="text-[11px] text-[#6f6253]">Paste any image URL. Leave blank to use your initial.</p>
          </div>

          {/* Save button */}
          <button
            type="submit"
            className="w-full rounded-md border border-[#c19a6b]/80 bg-[#4a1515] px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-[#f5f0e9] transition-all duration-200 hover:bg-[#6b1f1f] hover:border-[#d8b373]"
          >
            {saved ? "Saved ✓" : "Save Changes"}
          </button>
        </form>

        {/* Back */}
        <button
          onClick={onBack}
          className="text-[12px] text-[#b5a896] hover:text-[#e2d6c4] transition-colors duration-200"
        >
          ← Back to home
        </button>

      </div>
    </div>
  );
};
