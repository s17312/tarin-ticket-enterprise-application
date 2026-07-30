"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { bookingApi, RouteDto, SEAT_CLASS_LABELS, SPECIAL_REQUEST_LABELS } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_VALUES = [1, 2, 3, 4, 5, 6, 0]; // .NET DayOfWeek: Sunday=0..Saturday=6

export default function NewBookingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [routes, setRoutes] = useState<RouteDto[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [travelDate, setTravelDate] = useState("");
  const [routeId, setRouteId] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [seatNumber, setSeatNumber] = useState("");
  const [seatClass, setSeatClass] = useState(0);
  const [farePrice, setFarePrice] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([]);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState("");
  const [recurrenceOccurrences, setRecurrenceOccurrences] = useState("");
  const [specialRequests, setSpecialRequests] = useState<boolean[]>([false, false, false, false]);
  const [specialRequestDetails, setSpecialRequestDetails] = useState<string[]>(["", "", "", ""]);

  useEffect(() => {
    bookingApi.routes().then(setRoutes);
  }, []);

  function toggleDay(day: number) {
    setRecurrenceDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrors([]);

    try {
      const response = await bookingApi.create({
        travelDate,
        routeId: Number(routeId),
        departureTime,
        arrivalTime,
        seatNumber,
        seatClass,
        farePrice: Number(farePrice),
        isRecurring,
        recurrenceDays: isRecurring ? recurrenceDays : undefined,
        recurrenceEndDate: isRecurring && recurrenceEndDate ? recurrenceEndDate : null,
        recurrenceOccurrences: isRecurring && recurrenceOccurrences ? Number(recurrenceOccurrences) : null,
        specialRequests: specialRequests
          .map((included, i) => (included ? { type: i, details: specialRequestDetails[i] || null } : null))
          .filter((r): r is { type: number; details: string | null } => r !== null),
      });

      if (!response.success) {
        setErrors(response.errors.map((e) => `${e.field}: ${e.message}`));
        setSubmitting(false);
        return;
      }

      router.push(`/bookings/${response.createdBookings[0].id}`);
    } catch (err) {
      setErrors([String(err)]);
      setSubmitting(false);
    }
  }

  if (authLoading) return <p>Loading...</p>;

  if (!user) {
    return (
      <div>
        <p className="mb-3">You need to be logged in to add a booking.</p>
        <Link href="/login" className="text-violet-700 hover:underline">
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Add Booking</h1>

      {errors.length > 0 && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {errors.map((e, i) => (
            <div key={i}>{e}</div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-violet-100 rounded p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Travel date</label>
            <input type="date" required className="border rounded px-2 py-1 w-full" value={travelDate} onChange={(e) => setTravelDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Route</label>
            <select required className="border rounded px-2 py-1 w-full" value={routeId} onChange={(e) => setRouteId(e.target.value)}>
              <option value="">-- Select route --</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.displayName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Departure time</label>
            <input type="time" required className="border rounded px-2 py-1 w-full" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Arrival time</label>
            <input type="time" required className="border rounded px-2 py-1 w-full" value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Seat number</label>
            <input required placeholder="e.g. A12" className="border rounded px-2 py-1 w-full" value={seatNumber} onChange={(e) => setSeatNumber(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Seat class</label>
            <select className="border rounded px-2 py-1 w-full" value={seatClass} onChange={(e) => setSeatClass(Number(e.target.value))}>
              {SEAT_CLASS_LABELS.map((label, i) => (
                <option key={i} value={i}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fare price (£)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              className="border rounded px-2 py-1 w-full"
              value={farePrice}
              onChange={(e) => setFarePrice(e.target.value)}
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />
            <span className="font-medium">This is a recurring booking</span>
          </label>

          {isRecurring && (
            <div className="mt-3 bg-violet-50 border border-violet-200 rounded p-3">
              <p className="text-sm text-slate-600 mb-2">
                Pick the days this booking repeats on. Leave end date and occurrences blank to default to 12 occurrences.
              </p>
              <div className="flex flex-wrap gap-3 mb-3">
                {DAYS.map((day, i) => (
                  <label key={day} className="flex items-center gap-1 text-sm">
                    <input type="checkbox" checked={recurrenceDays.includes(DAY_VALUES[i])} onChange={() => toggleDay(DAY_VALUES[i])} />
                    {day}
                  </label>
                ))}
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Recurrence end date</label>
                  <input type="date" className="border rounded px-2 py-1 w-full" value={recurrenceEndDate} onChange={(e) => setRecurrenceEndDate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Number of occurrences</label>
                  <input
                    type="number"
                    min="1"
                    max="52"
                    className="border rounded px-2 py-1 w-full"
                    value={recurrenceOccurrences}
                    onChange={(e) => setRecurrenceOccurrences(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">Special requests (optional)</h3>
          {SPECIAL_REQUEST_LABELS.map((label, i) => (
            <div key={label} className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={specialRequests[i]}
                onChange={(e) => setSpecialRequests((prev) => prev.map((v, idx) => (idx === i ? e.target.checked : v)))}
              />
              <span className="w-40 text-sm">{label}</span>
              <input
                className="border rounded px-2 py-1 flex-1 text-sm"
                placeholder="Details (optional)"
                value={specialRequestDetails[i]}
                onChange={(e) => setSpecialRequestDetails((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))}
              />
            </div>
          ))}
        </div>

        <button type="submit" disabled={submitting} className="bg-violet-600 text-white px-5 py-2 rounded hover:bg-violet-700 disabled:opacity-50">
          {submitting ? "Adding..." : "Add Booking"}
        </button>
      </form>
    </div>
  );
}
