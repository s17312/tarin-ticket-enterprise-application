"use client";

import { useEffect, useState } from "react";
import { analyticsApi, bookingApi, RouteDto } from "@/lib/api";

type Message = { isUser: boolean; text: string };

export default function PredictPage() {
  const [routes, setRoutes] = useState<RouteDto[]>([]);
  const [routeId, setRouteId] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    bookingApi.routes().then(setRoutes);
    const d = new Date();
    d.setDate(d.getDate() + 7);
    setTravelDate(d.toISOString().slice(0, 10));
  }, []);

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    const route = routes.find((r) => r.id === Number(routeId));
    if (!route) return;

    setAsking(true);
    setMessages((prev) => [...prev, { isUser: true, text: `What's availability and pricing like for ${route.displayName} on ${travelDate}?` }]);

    try {
      const result = await analyticsApi.predict(Number(routeId), travelDate);
      setMessages((prev) => [...prev, { isUser: false, text: result.message }]);
    } catch {
      setMessages((prev) => [...prev, { isUser: false, text: "Sorry, the Analytics Service is unreachable right now." }]);
    } finally {
      setAsking(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Availability &amp; Pricing Predictor</h1>
      <p className="text-slate-600 mb-4">Ask about a future date and route. The prediction is based on patterns in existing booking history.</p>

      <div className="bg-white border border-violet-100 rounded p-4 mb-4 max-h-96 overflow-y-auto">
        {messages.length === 0 && <p className="text-slate-400">No questions yet - pick a route and date below to get started.</p>}
        {messages.map((m, i) => (
          <div key={i} className={`flex mb-3 ${m.isUser ? "justify-end" : "justify-start"} items-end gap-2`}>
            {!m.isUser && <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center text-sm">🚆</div>}
            <div className={`px-3 py-2 rounded-2xl max-w-[75%] ${m.isUser ? "bg-violet-600 text-white rounded-br-sm" : "bg-slate-100 rounded-bl-sm"}`}>
              {m.text}
            </div>
            {m.isUser && <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-sm">🧑</div>}
          </div>
        ))}
      </div>

      <form onSubmit={handleAsk} className="grid sm:grid-cols-3 gap-3">
        <select required className="border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition bg-white" value={routeId} onChange={(e) => setRouteId(e.target.value)}>
          <option value="">-- Select route --</option>
          {routes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.displayName}
            </option>
          ))}
        </select>
        <input type="date" required className="border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition bg-white" value={travelDate} onChange={(e) => setTravelDate(e.target.value)} />
        <button type="submit" disabled={asking} className="bg-violet-600 text-white rounded-lg px-4 py-2.5 font-semibold hover:bg-violet-700 disabled:opacity-50 cursor-pointer shadow-sm active:scale-[0.98] transition-all">
          {asking ? "Asking..." : "Ask"}
        </button>
      </form>
    </div>
  );
}
