"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function NavBar() {
  const { user, loading, logout, openAuthModal } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const router = useRouter();

  function handleLogout() {
    logout();
    setIsProfileOpen(false);
    router.push("/");
  }

  function getInitials(name: string) {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  const memberSince = user?.createdAtUtc
    ? new Date(user.createdAtUtc).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <header className="bg-gradient-to-r from-violet-700 to-violet-500 text-white shadow relative z-40">
      <nav className="max-w-5xl mx-auto flex items-center gap-6 px-4 py-3 flex-wrap">
        <Link href="/" className="font-bold text-lg flex items-center gap-2 hover:scale-[1.02] transition-transform">
          🚆 Train Ticket Manager
        </Link>
        <Link href="/bookings" className="hover:text-violet-100 transition-colors">
          Bookings
        </Link>
        <Link href="/bookings/new" className="hover:text-violet-100 transition-colors">
          Add Booking
        </Link>
        <Link href="/reports" className="hover:text-violet-100 transition-colors">
          Weekly Report
        </Link>
        <Link href="/predict" className="hover:text-violet-100 transition-colors">
          Predict
        </Link>
        {user && (
          <Link href="/bookings/mine" className="hover:text-violet-100 transition-colors">
            My Bookings
          </Link>
        )}
        
        <div className="ml-auto flex items-center gap-3 relative">
          {loading ? null : user ? (
            <div className="relative">
              {/* Dummy avatar with initials */}
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-white text-violet-700 ring-2 ring-white/30 hover:ring-white/80 shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all"
              >
                {getInitials(user.fullName)}
              </button>

              {/* Backdrop for click-away */}
              {isProfileOpen && (
                <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsProfileOpen(false)} />
              )}

              {/* User profile dropdown popup */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200 text-slate-800">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-gradient-to-tr from-violet-600 to-fuchsia-500 text-white shadow-inner">
                      {getInitials(user.fullName)}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-slate-900 truncate leading-tight">{user.fullName}</h4>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                    </div>
                  </div>

                  <div className="space-y-1 mb-4 text-sm">
                    {memberSince && (
                      <div className="flex justify-between py-1 text-xs text-slate-500 border-b border-slate-50/50">
                        <span>Member since</span>
                        <span className="font-medium text-slate-700">{memberSince}</span>
                      </div>
                    )}
                    <Link
                      href="/bookings/mine"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-violet-700 transition"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 114 0v2m-4 0h4m-6 2h10" />
                      </svg>
                      My Bookings
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-violet-700 transition"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile Settings
                    </Link>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full text-center py-2 px-4 rounded-xl bg-rose-50 text-rose-600 font-semibold hover:bg-rose-100 active:scale-95 transition-all text-sm cursor-pointer"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => openAuthModal("login")}
                className="hover:text-violet-100 transition-colors font-medium cursor-pointer"
              >
                Log in
              </button>
              <button
                onClick={() => openAuthModal("register")}
                className="bg-white text-violet-600 font-semibold px-4 py-1.5 rounded-full hover:bg-violet-50 active:scale-95 transition-all text-sm cursor-pointer shadow-sm shadow-violet-800/20"
              >
                Register
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

