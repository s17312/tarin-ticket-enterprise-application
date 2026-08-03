"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { bookingApi, BookingDto, SEAT_CLASS_LABELS, SPECIAL_REQUEST_LABELS, DAY_LABELS } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function BookingDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);
  const { user } = useAuth();
  const { toast } = useToast();

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

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: "cancel" | "delete" | null;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    type: null,
    title: "",
    message: "",
    onConfirm: () => { },
  });

  async function performCancel() {
    setBusy(true);
    setActionError(null);
    const res = await bookingApi.cancel(id);
    if (!res.ok) {
      const errMsg = res.status === 401 ? "Please log in first." : "You don't have permission to cancel this booking.";
      setActionError(errMsg);
      toast(errMsg, "error");
      setBusy(false);
      return;
    }
    toast("Booking cancelled successfully!", "success");
    bookingApi.getById(id).then(setBooking);
    setBusy(false);
  }

  async function performDelete() {
    setBusy(true);
    setActionError(null);
    const res = await bookingApi.remove(id);
    if (!res.ok) {
      const errMsg = res.status === 401 ? "Please log in first." : "You don't have permission to delete this booking.";
      setActionError(errMsg);
      toast(errMsg, "error");
      setBusy(false);
      return;
    }
    toast("Booking deleted successfully!", "success");
    router.push("/bookings");
  }

  function handleCancel() {
    setConfirmModal({
      isOpen: true,
      type: "cancel",
      title: "Cancel Booking",
      message: "Are you sure you want to cancel this booking? This will update the status to Cancelled.",
      onConfirm: performCancel,
    });
  }

  function handleDelete() {
    setConfirmModal({
      isOpen: true,
      type: "delete",
      title: "Delete Booking",
      message: "Are you sure you want to delete this booking permanently? This action cannot be undone.",
      onConfirm: performDelete,
    });
  }

  if (error) return <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>;
  if (!booking) return <p>Loading...</p>;

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

      <div className="flex flex-col sm:flex-row gap-2">
        {canManage && booking.status === "Confirmed" && (
          <button onClick={handleCancel} disabled={busy} className="w-full sm:w-auto text-center px-4 py-2 border border-amber-400 text-amber-700 rounded-lg hover:bg-amber-50 cursor-pointer transition font-medium">
            Cancel Booking
          </button>
        )}
        {canManage && (
          <button onClick={handleDelete} disabled={busy} className="w-full sm:w-auto text-center px-4 py-2 border border-red-400 text-red-700 rounded-lg hover:bg-red-50 cursor-pointer transition font-medium">
            Delete
          </button>
        )}
        <Link href="/bookings" className="w-full sm:w-auto text-center px-4 py-2 border rounded-lg hover:bg-slate-50 transition font-medium">
          Back to list
        </Link>
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
          />
          <div className="relative w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 z-10 animate-in fade-in zoom-in-95 duration-200 text-slate-800">
            <div className="mb-4 flex items-center justify-center">
              {confirmModal.type === "delete" ? (
                <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
              ) : (
                <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center mb-2">{confirmModal.title}</h3>
            <p className="text-sm text-slate-500 text-center mb-6">{confirmModal.message}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                }}
                className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold text-white active:scale-[0.98] transition cursor-pointer ${confirmModal.type === "delete"
                    ? "bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-200"
                    : "bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-200"
                  }`}
              >
                {confirmModal.type === "delete" ? "Delete" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
