"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await register(email, password, fullName);
      router.push("/bookings");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create an account</h1>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white border border-violet-100 rounded p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full name</label>
          <input required className="border rounded px-2 py-1 w-full" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" required className="border rounded px-2 py-1 w-full" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input type="password" required minLength={6} className="border rounded px-2 py-1 w-full" value={password} onChange={(e) => setPassword(e.target.value)} />
          <p className="text-xs text-slate-500 mt-1">At least 6 characters.</p>
        </div>
        <button type="submit" disabled={busy} className="bg-violet-600 text-white px-4 py-2 rounded hover:bg-violet-700 disabled:opacity-50 w-full">
          {busy ? "Creating account..." : "Register"}
        </button>
      </form>
      <p className="text-sm text-slate-600 mt-3">
        Already have an account?{" "}
        <Link href="/login" className="text-violet-700 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
