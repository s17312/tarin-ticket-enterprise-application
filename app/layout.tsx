import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import NavBar from "@/components/NavBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Train Ticket Manager (CW2)",
  description: "Train Ticket Reservation and Management - enterprise microservices client",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <AuthProvider>
          <NavBar />
          <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">{children}</main>
          <footer className="bg-violet-900 text-violet-100 text-sm text-center py-3">
            CW2 - Enterprise microservices client (Next.js) calling Booking Service and Analytics &amp; Prediction Service over REST
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
