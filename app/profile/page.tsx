"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { updateProfile } from "@/lib/auth";

export default function ProfilePage() {
  const { user, loading, refresh } = useAuth();
  const [fullName, setFullName] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) setFullName(user.fullName);
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      await updateProfile(fullName, null);
      await refresh();
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p>Loading...</p>;

  if (!user) {
    return (
      <div>
        <p className="mb-3">You need to be logged in to view your profile.</p>
        <Link href="/login" className="text-violet-700 hover:underline">
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>

      <div className="bg-white border border-violet-100 rounded p-5 mb-4">
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt className="text-slate-500">Email</dt>
          <dd>{user.email}</dd>
          <dt className="text-slate-500">Member since</dt>
          <dd>{new Date(user.createdAtUtc).toLocaleDateString()}</dd>
        </dl>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      {saved && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">Profile updated.</div>}

      <form onSubmit={handleSave} className="bg-white border border-violet-100 rounded p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full name</label>
          <input required className="border rounded px-2 py-1 w-full" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <button type="submit" disabled={busy} className="bg-violet-600 text-white px-4 py-2 rounded hover:bg-violet-700 disabled:opacity-50">
          {busy ? "Saving..." : "Save changes"}
        </button>
      </form>

      <Link href="/bookings/mine" className="inline-block mt-4 text-violet-700 hover:underline">
        View my bookings →
      </Link>
    </div>
  );
}
