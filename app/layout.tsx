import type { Metadata } from "next";
import localFont from "next/font/local";
import { GoogleAnalytics } from '@next/third-parties/google';
import "./globals.css";

// Self-hosted fonts. next/font/google fetches from Google at build time, which
// fails on Netlify (Turbopack internal resolution) and on offline/sandboxed
// builds. Local fonts are deterministic and faster.

const cormorant = localFont({
  src: [
    { path: "./fonts/cormorant-garamond-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/cormorant-garamond-latin-400-italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/cormorant-garamond-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-display",
  display: "swap",
});

const jost = localFont({
  src: [
    { path: "./fonts/jost-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/jost-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/jost-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-body",
  display: "swap",
});

// Store accents fall back to the primary body/display fonts.
const outfit = jost;
const nunito = jost;
const fraunces = cormorant;
const sora = jost;

export const runtime = "nodejs";

const fontClasses = [
  cormorant.variable,
  jost.variable,
  outfit.variable,
  nunito.variable,
  fraunces.variable,
  sora.variable,
].join(" ");

// Determine Base URL for SEO
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? (process.env.NEXT_PUBLIC_SITE_URL.startsWith('http')
    ? process.env.NEXT_PUBLIC_SITE_URL
    : `https://${process.env.NEXT_PUBLIC_SITE_URL}`)
  : 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl), // <--- Critical for Social Sharing
  title: "Jarayel Technologies | Commerce Platform",
  description: "Jarayelɔ — the Ga word meaning merchant or trader. A home for our family of online shops.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fontClasses} suppressHydrationWarning>
      <body className="antialiased bg-brand-cream min-h-screen flex flex-col font-body" suppressHydrationWarning>
        {children}
      </body>
      {/* Google Analytics 4 */}
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ''} />
    </html>
  );
}