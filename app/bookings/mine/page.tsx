"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { bookingApi, BookingDto } from "@/lib/api";

export default function MyBookingsPage() {
  const { user, loading } = useAuth();
  const [bookings, setBookings] = useState<BookingDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    bookingApi
      .mine()
      .then(setBookings)
      .catch((e) => setError(String(e)));
  }, [user]);

  if (loading) return <p>Loading...</p>;

  if (!user) {
    return (
      <div>
        <p className="mb-3">You need to be logged in to see your bookings.</p>
        <Link href="/login" className="text-violet-700 hover:underline">
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <Link href="/bookings/new" className="bg-violet-600 text-white px-4 py-2 rounded hover:bg-violet-700">
          + Add Booking
        </Link>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white border border-violet-100 rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-violet-50">
            <tr>
              <th className="text-left p-2">Date</th>
              <th className="text-left p-2">Route</th>
              <th className="text-left p-2">Time</th>
              <th className="text-left p-2">Seat</th>
              <th className="text-left p-2">Fare</th>
              <th className="text-left p-2">Status</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {bookings?.map((b) => (
              <tr key={b.id} className="border-t">
                <td className="p-2">{b.travelDate}</td>
                <td className="p-2">{b.routeDisplayName}</td>
                <td className="p-2">
                  {b.departureTime.slice(0, 5)} - {b.arrivalTime.slice(0, 5)}
                </td>
                <td className="p-2">{b.seatNumber}</td>
                <td className="p-2">£{b.farePrice.toFixed(2)}</td>
                <td className="p-2">
                  <span className={`px-2 py-0.5 rounded text-xs text-white ${b.status === "Confirmed" ? "bg-green-600" : "bg-slate-500"}`}>
                    {b.status}
                  </span>
                </td>
                <td className="p-2">
                  <Link href={`/bookings/${b.id}`} className="text-violet-700 hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bookings?.length === 0 && <p className="p-4 text-slate-500">You haven&apos;t made any bookings yet.</p>}
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden space-y-3">
        {bookings?.map((b) => (
          <div key={b.id} className="bg-white border border-violet-100 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex justify-between items-start gap-2">
              <div>
                <span className="text-xs text-slate-400 font-medium">{b.travelDate}</span>
                <h3 className="font-bold text-slate-900 leading-tight mt-0.5">{b.routeDisplayName}</h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold text-white ${b.status === "Confirmed" ? "bg-green-600" : "bg-slate-500"}`}>
                {b.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 border-t border-slate-50 pt-2.5">
              <div>
                <span className="text-xs text-slate-400 block">Time</span>
                <span className="font-medium text-slate-800">{b.departureTime.slice(0, 5)} - {b.arrivalTime.slice(0, 5)}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Seat</span>
                <span className="font-medium text-slate-800">{b.seatNumber}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Fare</span>
                <span className="font-medium text-slate-800">£{b.farePrice.toFixed(2)}</span>
              </div>
              <div className="flex items-end justify-end">
                <Link href={`/bookings/${b.id}`} className="text-xs font-semibold text-violet-700 hover:text-violet-800 bg-violet-50 hover:bg-violet-100 px-3.5 py-1.5 rounded-lg transition-colors w-full text-center">
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
        {bookings?.length === 0 && (
          <div className="bg-white border border-violet-100 rounded-xl p-6 text-center">
            <p className="text-slate-500 text-sm">You haven&apos;t made any bookings yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
