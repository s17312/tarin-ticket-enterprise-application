import Link from "next/link";

const cards = [
  { href: "/bookings/new", title: "Add Booking", desc: "Record a new one-off or recurring booking, with optional special requests." },
  { href: "/bookings", title: "Bookings", desc: "Search, view, edit, cancel or delete existing bookings." },
  { href: "/reports", title: "Weekly View & Report", desc: "See bookings organised Monday-Sunday, with a summary report." },
  { href: "/predict", title: "Predict Availability & Pricing", desc: "Ask about a future date and route for an availability/pricing forecast." },
];

export default function Home() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Train Ticket Reservation &amp; Management</h1>
      <p className="text-slate-600 mb-6">
        This client is a Next.js SPA that calls two independent ASP.NET Core Web API microservices - Booking Service (SQL Server via EF Core)
        and Analytics &amp; Prediction Service (XML cache, background-refreshed) - entirely over REST/JSON. It never connects to a database directly.
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="block rounded-lg border border-violet-200 bg-white p-5 shadow-sm hover:shadow-md transition">
            <h2 className="font-semibold text-lg text-violet-800 mb-1">{c.title}</h2>
            <p className="text-sm text-slate-600">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
