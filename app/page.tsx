import React from 'react';
import Link from 'next/link';
import { STORES } from '@/lib/stores/config';
import { Sparkles, ArrowRight, Store as StoreIcon, Globe } from 'lucide-react';

export const metadata = {
  title: 'Jarayel Technologies | Commerce Platform',
  description: 'Jarayelɔ — the Ga word meaning "merchant" or "trader". A welcoming home for our family of online shops.',
};

export default function PortalPage() {
  const stores = Object.values(STORES);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-teal-50/40 to-slate-100">
      {/* Soft ambient glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[40rem] h-[40rem] bg-teal-200/30 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[40rem] h-[40rem] bg-indigo-200/30 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 container-custom min-h-screen flex flex-col">

        {/* Header */}
        <header className="py-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Globe size={20} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-none text-slate-800 tracking-tight">Jarayel Technologies</span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-teal-700/70 font-medium">Commerce Platform</span>
            </div>
          </div>


        </header>

        {/* Hero */}
        <main className="flex-1 flex flex-col items-center justify-center text-center py-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur border border-teal-200 text-teal-800 text-xs font-medium mb-8 animate-fade-in-up">
            <Sparkles size={14} />
            Jarayelɔ — the Ga word meaning "merchant" or "trader"
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight max-w-3xl">
            We hope you would have an <span className="text-teal-600">awesome time</span> interacting with our shops.
          </h1>

          <p className="mt-6 text-lg text-slate-600 max-w-xl font-body">
            Jarayel Technologies is a home for carefully curated online stores. Pick a shop below and begin your journey.
          </p>

          {/* Store Selector */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
            {stores.map((store) => (
              <Link
                key={store.slug}
                href={`/${store.slug}`}
                className="group relative bg-white/80 backdrop-blur border border-slate-200 rounded-2xl p-8 text-left shadow-sm hover:shadow-xl hover:border-teal-400 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-6">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: `${store.theme.primaryColor}1A`, color: store.theme.primaryColor }}
                  >
                    <StoreIcon size={26} />
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Open
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-slate-900">{store.name}</h2>
                <p className="text-sm font-semibold uppercase tracking-widest mt-1" style={{ color: store.theme.primaryColor }}>
                  {store.tagline}
                </p>
                <p className="mt-3 text-slate-600 text-sm leading-relaxed">{store.description}</p>

                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 group-hover:gap-3 transition-all">
                  Visit {store.name}
                  <ArrowRight size={16} />
                </div>
              </Link>
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer className="py-8 border-t border-slate-200/70 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} Jarayel Technologies. All rights reserved.</p>
          <p className="text-xs text-slate-400 italic">Bridging commerce and technology.</p>
        </footer>
      </div>
    </div>
  );
}