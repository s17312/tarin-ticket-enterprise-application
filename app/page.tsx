"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const cards = [
  {
    href: "/bookings/new",
    title: "Add Booking",
    desc: "Record a new one-off or recurring booking, with optional special requests.",
    requiresAuth: true,
    badge: (
      <svg className="w-full h-full select-none" viewBox="0 0 120 120" fill="none">
        {/* Background sparks */}
        <polygon points="5,30 18,10 8,22" fill="#2563eb" />
        <polygon points="102,52 118,45 108,58" fill="#e11d48" />
        {/* Background dots */}
        <circle cx="15" cy="82" r="6" fill="#2563eb" />
        <circle cx="62" cy="18" r="4" fill="#2563eb" />
        <circle cx="106" cy="32" r="5" fill="#f43f5e" />
        <circle cx="28" cy="74" r="3.5" fill="#1e293b" />

        {/* Slanted red box "BOOK" */}
        <path d="M12 25 L98 12 L92 50 L6 63 Z" fill="#e11d48" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="miter" />
        <text x="52" y="43" transform="rotate(-8 52 43)" fontFamily="Impact, Arial Black, sans-serif" fontSize="22" fill="white">BOOK</text>

        {/* Slanted blue box "NOW!" */}
        <path d="M22 86 L108 73 L102 36 L16 49 Z" fill="#2563eb" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="miter" />
        <text x="62" y="69" transform="rotate(-8 62 69)" fontFamily="Impact, Arial Black, sans-serif" fontSize="22" fill="white">NOW!</text>
      </svg>
    )
  },
  {
    href: "/bookings",
    title: "Bookings",
    desc: "Search, view, edit, cancel or delete existing bookings.",
    badge: (
      <svg className="w-full h-full select-none" viewBox="0 0 120 120" fill="none">
        {/* Background sparks */}
        <polygon points="5,30 18,10 8,22" fill="#7c3aed" />
        <polygon points="102,52 118,45 108,58" fill="#db2777" />
        {/* Background dots */}
        <circle cx="15" cy="82" r="6" fill="#7c3aed" />
        <circle cx="62" cy="18" r="4" fill="#7c3aed" />
        <circle cx="106" cy="32" r="5" fill="#e11d48" />
        <circle cx="28" cy="74" r="3.5" fill="#1e293b" />

        {/* Slanted violet box "VIEW" */}
        <path d="M12 25 L98 12 L92 50 L6 63 Z" fill="#7c3aed" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="miter" />
        <text x="52" y="43" transform="rotate(-8 52 43)" fontFamily="Impact, Arial Black, sans-serif" fontSize="22" fill="white">VIEW</text>

        {/* Slanted fuchsia box "LIST!" */}
        <path d="M22 86 L108 73 L102 36 L16 49 Z" fill="#db2777" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="miter" />
        <text x="62" y="69" transform="rotate(-8 62 69)" fontFamily="Impact, Arial Black, sans-serif" fontSize="22" fill="white">LIST!</text>
      </svg>
    )
  },
  {
    href: "/reports",
    title: "Weekly View & Report",
    desc: "See bookings organised Monday-Sunday, with a summary report.",
    badge: (
      <svg className="w-full h-full select-none" viewBox="0 0 120 120" fill="none">
        {/* Background sparks */}
        <polygon points="5,30 18,10 8,22" fill="#059669" />
        <polygon points="102,52 118,45 108,58" fill="#4f46e5" />
        {/* Background dots */}
        <circle cx="15" cy="82" r="6" fill="#059669" />
        <circle cx="62" cy="18" r="4" fill="#059669" />
        <circle cx="106" cy="32" r="5" fill="#f59e0b" />
        <circle cx="28" cy="74" r="3.5" fill="#1e293b" />

        {/* Slanted emerald box "WEEK" */}
        <path d="M12 25 L98 12 L92 50 L6 63 Z" fill="#059669" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="miter" />
        <text x="52" y="43" transform="rotate(-8 52 43)" fontFamily="Impact, Arial Black, sans-serif" fontSize="22" fill="white">WEEK</text>

        {/* Slanted indigo box "DATA!" */}
        <path d="M22 86 L108 73 L102 36 L16 49 Z" fill="#4f46e5" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="miter" />
        <text x="62" y="69" transform="rotate(-8 62 69)" fontFamily="Impact, Arial Black, sans-serif" fontSize="22" fill="white">DATA!</text>
      </svg>
    )
  },
  {
    href: "/predict",
    title: "Predict Availability & Pricing",
    desc: "Ask about a future date and route for an availability/pricing forecast.",
    badge: (
      <svg className="w-full h-full select-none" viewBox="0 0 120 120" fill="none">
        {/* Background sparks */}
        <polygon points="5,30 18,10 8,22" fill="#d97706" />
        <polygon points="102,52 118,45 108,58" fill="#c026d3" />
        {/* Background dots */}
        <circle cx="15" cy="82" r="6" fill="#d97706" />
        <circle cx="62" cy="18" r="4" fill="#d97706" />
        <circle cx="106" cy="32" r="5" fill="#06b6d4" />
        <circle cx="28" cy="74" r="3.5" fill="#1e293b" />

        {/* Slanted amber box "PRE" */}
        <path d="M12 25 L98 12 L92 50 L6 63 Z" fill="#d97706" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="miter" />
        <text x="52" y="43" transform="rotate(-8 52 43)" fontFamily="Impact, Arial Black, sans-serif" fontSize="22" fill="white">PRE</text>

        {/* Slanted magenta box "DICT!" */}
        <path d="M22 86 L108 73 L102 36 L16 49 Z" fill="#c026d3" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="miter" />
        <text x="62" y="69" transform="rotate(-8 62 69)" fontFamily="Impact, Arial Black, sans-serif" fontSize="22" fill="white">DICT!</text>
      </svg>
    )
  }
];

export default function Home() {
  const { user, openAuthModal } = useAuth();
  const router = useRouter();

  const handleCardClick = (e: React.MouseEvent, href: string, requiresAuth?: boolean) => {
    if (requiresAuth && !user) {
      e.preventDefault();
      openAuthModal("login", () => {
        router.push(href);
      });
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4 text-violet-900 text-center sm:text-left">Train Ticket Reservation &amp; Management</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            onClick={(e) => handleCardClick(e, c.href, c.requiresAuth)}
            className="flex flex-col sm:flex-row items-center sm:items-start gap-5 rounded-2xl border border-violet-100 bg-white p-5 shadow-sm hover:shadow-lg hover:border-violet-200 hover:-translate-y-0.5 transition-all duration-200 min-h-[160px] w-full group text-center sm:text-left"
          >
            {/* Left side: Themed Comic SVG Badge */}
            <div className="w-24 h-24 shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              {c.badge}
            </div>

            {/* Right side: Title & Description */}
            <div className="flex-1 flex flex-col justify-center items-center sm:items-start">
              <h2 className="font-bold text-lg text-violet-800 mb-1 group-hover:text-violet-900 transition-colors leading-snug">{c.title}</h2>
              <p className="text-sm text-slate-500 leading-normal">{c.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

