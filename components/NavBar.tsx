"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function NavBar() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <header className="bg-gradient-to-r from-violet-700 to-violet-500 text-white shadow">
      <nav className="max-w-5xl mx-auto flex items-center gap-6 px-4 py-3 flex-wrap">
        <Link href="/" className="font-bold text-lg">
          🚆 Train Ticket Manager
        </Link>
        <Link href="/bookings" className="hover:underline">
          Bookings
        </Link>
        <Link href="/bookings/new" className="hover:underline">
          Add Booking
        </Link>
        <Link href="/reports" className="hover:underline">
          Weekly Report
        </Link>
        <Link href="/predict" className="hover:underline">
          Predict
        </Link>
        {user && (
          <Link href="/bookings/mine" className="hover:underline">
            My Bookings
          </Link>
        )}
        <div className="ml-auto flex items-center gap-3">
          {loading ? null : user ? (
            <>
              <Link href="/profile" className="hover:underline">
                {user.fullName}
              </Link>
              <button onClick={handleLogout} className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline">
                Log in
              </Link>
              <Link href="/register" className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
