"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { bookingApi, BookingDto, SEAT_CLASS_LABELS, SPECIAL_REQUEST_LABELS, DAY_LABELS } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function BookingDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);
  const { user } = useAuth();

  const [booking, setBooking] = useState<BookingDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    bookingApi
      .getById(id)
      .then(setBooking)
      .catch((e) => setError(String(e)));
  }, [id]);

  async function handleCancel() {
    if (!confirm("Cancel this booking?")) return;
    setBusy(true);
    setActionError(null);
    const res = await bookingApi.cancel(id);
    if (!res.ok) {
      setActionError(res.status === 401 ? "Please log in first." : "You don't have permission to cancel this booking.");
      setBusy(false);
      return;
    }
    bookingApi.getById(id).then(setBooking);
    setBusy(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this booking permanently? This cannot be undone.")) return;
    setBusy(true);
    setActionError(null);
    const res = await bookingApi.remove(id);
    if (!res.ok) {
      setActionError(res.status === 401 ? "Please log in first." : "You don't have permission to delete this booking.");
      setBusy(false);
      return;
    }
    router.push("/bookings");
  }

  if (error) return <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>;
  if (!booking) return <p>Loading...</p>;

  // Mirrors the backend's ownership rule: unowned (legacy/seeded) bookings are
  // manageable by any logged-in user; owned bookings only by their owner.
  const canManage = !!user && (!booking.userId || booking.userId === user.id);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-2xl font-bold">Booking #{booking.id}</h1>
        <span className={`px-2 py-0.5 rounded text-xs text-white ${booking.status === "Confirmed" ? "bg-green-600" : "bg-slate-500"}`}>{booking.status}</span>
      </div>

      <dl className="bg-white border border-violet-100 rounded p-5 grid sm:grid-cols-2 gap-3 mb-4">
        <div>
          <dt className="text-sm text-slate-500">Route</dt>
          <dd className="font-medium">{booking.routeDisplayName}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-500">Travel date</dt>
          <dd className="font-medium">{booking.travelDate}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-500">Time</dt>
          <dd className="font-medium">
            {booking.departureTime.slice(0, 5)} - {booking.arrivalTime.slice(0, 5)}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-slate-500">Seat</dt>
          <dd className="font-medium">
            {booking.seatNumber} ({SEAT_CLASS_LABELS[booking.seatClass]})
          </dd>
        </div>
        <div>
          <dt className="text-sm text-slate-500">Fare</dt>
          <dd className="font-medium">£{booking.farePrice.toFixed(2)}</dd>
        </div>
        {booking.isRecurring && booking.recurrenceDays && (
          <div>
            <dt className="text-sm text-slate-500">Recurrence</dt>
            <dd className="font-medium">{booking.recurrenceDays.map((d) => DAY_LABELS[d]).join(", ")}</dd>
          </div>
        )}
        <div className="sm:col-span-2">
          <dt className="text-sm text-slate-500">Special requests</dt>
          <dd className="font-medium">
            {booking.specialRequests.length === 0
              ? "None"
              : booking.specialRequests.map((r) => `${SPECIAL_REQUEST_LABELS[r.type]}${r.details ? ` - ${r.details}` : ""}`).join("; ")}
          </dd>
        </div>
      </dl>

      {actionError && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{actionError}</div>}

      {!user && (
        <p className="text-sm text-slate-500 mb-3">
          <Link href="/login" className="text-violet-700 hover:underline">
            Log in
          </Link>{" "}
          to cancel or delete this booking.
        </p>
      )}
      {user && !canManage && <p className="text-sm text-slate-500 mb-3">This booking belongs to another user, so you can only view it.</p>}

      <div className="flex gap-2">
        {canManage && booking.status === "Confirmed" && (
          <button onClick={handleCancel} disabled={busy} className="px-4 py-2 border border-amber-400 text-amber-700 rounded hover:bg-amber-50">
            Cancel Booking
          </button>
        )}
        {canManage && (
          <button onClick={handleDelete} disabled={busy} className="px-4 py-2 border border-red-400 text-red-700 rounded hover:bg-red-50">
            Delete
          </button>
        )}
        <Link href="/bookings" className="px-4 py-2 border rounded hover:bg-slate-50">
          Back to list
        </Link>
      </div>
    </div>
  );
}
