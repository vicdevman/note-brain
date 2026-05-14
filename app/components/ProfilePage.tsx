"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Check, Image as ImageIcon, Mail, Pencil, UserRound } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type ProfileData = {
  id: string;
  name: string;
  email: string;
  image: string;
};

export default function ProfilePage({ editable = false }: { editable?: boolean }) {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    fetch("/api/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!mounted || !data) return;
        setProfile(data);
        setName(data.name || "");
        setImage(data.image || "");
      })
      .catch(() => {
        if (mounted) setError("Could not load profile");
      });

    return () => {
      mounted = false;
    };
  }, []);

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save profile");
        return;
      }

      setProfile(data);
      await update?.({ name: data.name, image: data.image });
      router.push("/app/profile");
      router.refresh();
    } catch {
      setError("Could not save profile");
    } finally {
      setSaving(false);
    }
  }

  const displayName = profile?.name || session?.user?.name || "User";
  const displayEmail = profile?.email || session?.user?.email || "";
  const displayImage = image || profile?.image || session?.user?.image || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="mx-auto w-full max-w-2xl px-1 md:px-0"
    >
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link
          href="/app"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--nb-border-strong)] bg-[var(--nb-sidebar-bg)] text-[var(--nb-border)]"
          aria-label="Back to notes"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        {!editable && (
          <Link
            href="/app/profile/edit"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--nb-primary)] px-4 text-sm font-semibold text-black"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        )}
      </div>

      <div className="rounded-[28px] border border-[var(--nb-border-strong)] bg-[var(--nb-sidebar-bg)] p-5 md:p-7">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--nb-primary)] text-2xl font-semibold text-black">
            {displayImage ? (
              <img src={displayImage} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              displayName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-3xl font-semibold text-[var(--nb-border)]">{displayName}</h1>
            <p className="mt-1 truncate text-sm text-[var(--nb-text-muted)]">{displayEmail}</p>
          </div>
        </div>

        {editable ? (
          <form onSubmit={saveProfile} className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm text-[var(--nb-border)]">
                <UserRound className="h-4 w-4" />
                Name
              </span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-13 w-full rounded-2xl border border-[var(--nb-border-strong)] bg-[var(--nb-note-bg)] px-4 text-base text-[var(--nb-border)] outline-none focus:border-[var(--nb-primary)]"
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm text-[var(--nb-border)]">
                <ImageIcon className="h-4 w-4" />
                Profile photo URL
              </span>
              <input
                value={image}
                onChange={(event) => setImage(event.target.value)}
                placeholder="https://..."
                className="h-13 w-full rounded-2xl border border-[var(--nb-border-strong)] bg-[var(--nb-note-bg)] px-4 text-base text-[var(--nb-border)] outline-none focus:border-[var(--nb-primary)]"
              />
            </label>

            <div className="rounded-2xl border border-[var(--nb-border-strong)] bg-[var(--nb-note-bg)] p-4">
              <div className="mb-1 flex items-center gap-2 text-sm text-[var(--nb-border)]">
                <Mail className="h-4 w-4" />
                Email
              </div>
              <div className="truncate text-base text-[var(--nb-text-muted)]">{displayEmail}</div>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--nb-primary)] text-base font-semibold text-black disabled:opacity-60"
            >
              <Check className="h-5 w-5" />
              {saving ? "Saving" : "Save profile"}
            </button>
          </form>
        ) : (
          <div className="mt-8 grid gap-3">
            <div className="rounded-2xl border border-[var(--nb-border-strong)] bg-[var(--nb-note-bg)] p-4">
              <div className="text-sm text-[var(--nb-text-muted)]">Name</div>
              <div className="mt-1 text-base text-[var(--nb-border)]">{displayName}</div>
            </div>
            <div className="rounded-2xl border border-[var(--nb-border-strong)] bg-[var(--nb-note-bg)] p-4">
              <div className="text-sm text-[var(--nb-text-muted)]">Email</div>
              <div className="mt-1 text-base text-[var(--nb-border)]">{displayEmail}</div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
