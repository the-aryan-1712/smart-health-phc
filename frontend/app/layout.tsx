import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0d9488",
};

export const metadata: Metadata = {
  title: {
    default: "Smart Health — AI-Driven PHC & CHC Management",
    template: "%s | Smart Health",
  },
  description:
    "AI-powered supply chain, patient triage, bed allocation, and staff management for Primary and Community Health Centres across rural India.",
  keywords: ["PHC", "CHC", "health centre", "supply chain", "triage", "AI health", "rural healthcare", "India"],
  authors: [{ name: "Smart Health Team" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {/* WCAG 2.4.1 — Skip to main content */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        <div className="app-shell">
          {/* banner landmark */}
          <header className="app-header" role="banner">
            <Header />
          </header>

          {/* navigation landmark */}
          <nav className="app-sidebar" aria-label="Module navigation">
            <Sidebar />
          </nav>

          {/* main landmark */}
          <main
            id="main-content"
            className="app-main"
            role="main"
            tabIndex={-1}
          >
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
