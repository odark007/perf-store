import type { Metadata } from "next";
import { Cormorant_Garamond, Jost, Outfit, Nunito, Fraunces, Sora } from "next/font/google";
import { GoogleAnalytics } from '@next/third-parties/google';
import "./globals.css";

// Font Configuration
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-store-display",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-store-body",
  display: "swap",
});

// Portal landing page fonts (Jarayel Technologies homepage)
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "600", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-portal-display",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-portal-body",
  display: "swap",
});

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
    <html lang="en" className={`${cormorant.variable} ${jost.variable} ${outfit.variable} ${nunito.variable} ${fraunces.variable} ${sora.variable}`} suppressHydrationWarning>
      <body className="antialiased bg-brand-cream min-h-screen flex flex-col font-body" suppressHydrationWarning>
        {children}
      </body>
      {/* Google Analytics 4 */}
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ''} />
    </html>
  );
}