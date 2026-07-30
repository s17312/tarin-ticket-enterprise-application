"use client";

import { useEffect, useState } from "react";
import { analyticsApi, WeeklyReportDto } from "@/lib/api";

function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function ReportsPage() {
  const [week, setWeek] = useState<string | undefined>(undefined);
  const [report, setReport] = useState<WeeklyReportDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    analyticsApi
      .weeklyReport(week)
      .then((r) => {
        setReport(r);
        setError(null);
      })
      .catch((e) => setError(String(e)));
  }, [week]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Weekly View &amp; Report</h1>
        {report && (
          <div className="flex gap-2">
            <button onClick={() => setWeek(addDays(report.weekStart, -7))} className="px-3 py-1 border rounded">
              ← Previous week
            </button>
            <button onClick={() => setWeek(undefined)} className="px-3 py-1 border rounded">
              This week
            </button>
            <button onClick={() => setWeek(addDays(report.weekStart, 7))} className="px-3 py-1 border rounded">
              Next week →
            </button>
          </div>
        )}
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error} - is the Analytics Service running on :5021?</div>}
      {!report && !error && <p>Loading...</p>}

      {report && (
        <>
          <p className="text-slate-500 mb-4">
            {report.weekStart} to {report.weekEnd}
            {report.dataAsOf && <span className="ml-2 text-xs">(analytics cache last refreshed {new Date(report.dataAsOf).toLocaleTimeString()})</span>}
          </p>

          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-violet-100 rounded p-4 text-center">
              <div className="text-3xl font-bold">{report.totalBookings}</div>
              <div className="text-sm text-slate-500">Total bookings</div>
            </div>
            <div className="bg-white border border-violet-100 rounded p-4 text-center">
              <div className="text-3xl font-bold">{report.totalRoutesTravelled}</div>
              <div className="text-sm text-slate-500">Distinct routes travelled</div>
            </div>
            <div className="bg-white border border-violet-100 rounded p-4 text-center">
              <div className="text-3xl font-bold">£{report.totalFareValue.toFixed(2)}</div>
              <div className="text-sm text-slate-500">Total fare value (confirmed)</div>
            </div>
          </div>

          {report.days.map((day) => (
            <div key={day.date} className="bg-white border border-violet-100 rounded mb-3">
              <div className="bg-violet-50 px-4 py-2 flex justify-between font-medium">
                <span>{day.dayOfWeek}</span>
                <span className="text-slate-500">{day.date}</span>
              </div>
              <div className="p-4">
                {day.bookings.length === 0 ? (
                  <p className="text-slate-400 text-sm">No bookings.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-500">
                        <th className="pb-1">Route</th>
                        <th className="pb-1">Time</th>
                        <th className="pb-1">Seat</th>
                        <th className="pb-1">Fare</th>
                        <th className="pb-1">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {day.bookings.map((b) => (
                        <tr key={b.id} className="border-t">
                          <td className="py-1">{b.routeDisplayName}</td>
                          <td className="py-1">{b.departureTime.slice(0, 5)}</td>
                          <td className="py-1">{b.seatNumber}</td>
                          <td className="py-1">£{b.farePrice.toFixed(2)}</td>
                          <td className="py-1">
                            <span className={`px-2 py-0.5 rounded text-xs text-white ${b.status === "Confirmed" ? "bg-green-600" : "bg-slate-500"}`}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
