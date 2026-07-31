"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { bookingApi, BookingDto, RouteDto, PagedResult } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function BookingsPage() {
  const { user, openAuthModal } = useAuth();
  const router = useRouter();
  const [result, setResult] = useState<PagedResult<BookingDto> | null>(null);
  const [routes, setRoutes] = useState<RouteDto[]>([]);
  const [search, setSearch] = useState("");
  const [routeId, setRouteId] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const handleAddBookingClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      openAuthModal("login", () => {
        router.push("/bookings/new");
      });
    }
  };

  const load = useCallback(() => {
    bookingApi
      .search({ search, routeId, status, page, pageSize: 10 })
      .then(setResult)
      .catch((e) => setError(String(e)));
  }, [search, routeId, status, page]);

  useEffect(() => {
    bookingApi.routes().then(setRoutes).catch((e) => setError(String(e)));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Bookings</h1>
        <Link
          href="/bookings/new"
          onClick={handleAddBookingClick}
          className="bg-violet-600 text-white px-4 py-2 rounded hover:bg-violet-700"
        >
          + Add Booking
        </Link>
      </div>


      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error} - is the Booking Service running on :5011?</div>}

      <div className="bg-white border border-violet-100 rounded p-4 mb-4 grid sm:grid-cols-4 gap-3">
        <input
          className="border rounded px-2 py-1 sm:col-span-2"
          placeholder="Search seat or station..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
        <select
          className="border rounded px-2 py-1"
          value={routeId}
          onChange={(e) => {
            setPage(1);
            setRouteId(e.target.value);
          }}
        >
          <option value="">All routes</option>
          {routes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.displayName}
            </option>
          ))}
        </select>
        <select
          className="border rounded px-2 py-1"
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        >
          <option value="">All statuses</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white border border-violet-100 rounded overflow-x-auto">
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
            {result?.items.map((b) => (
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
        {result && result.items.length === 0 && <p className="p-4 text-slate-500">No bookings match these filters.</p>}
      </div>

      {result && result.totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-slate-500">
            Page {result.page} of {result.totalPages} ({result.totalCount} bookings)
          </span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 border rounded disabled:opacity-40">
              Previous
            </button>
            <button disabled={page >= result.totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 border rounded disabled:opacity-40">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
