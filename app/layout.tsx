import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { GoogleAnalytics } from '@next/third-parties/google';
import "./globals.css";

// Font Configuration
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
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
  title: "LiquorShop GH | Premium Drinks",
  description: "Ghana's premier online destination for premium wines, spirits, and beers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable}`} suppressHydrationWarning>
      <body className="antialiased bg-secondary-50 min-h-screen flex flex-col" suppressHydrationWarning>
        {children}
      </body>
      {/* Google Analytics 4 */}
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ''} />
    </html>
  );
}