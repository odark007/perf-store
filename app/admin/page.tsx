import React from 'react';
import Link from 'next/link';
import { STORES } from '@/lib/stores/config';
import { Store, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminHomePage() {
  return (
    <div className="min-h-screen bg-secondary-50">
      <main className="p-8 max-w-4xl mx-auto">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Store size={28} className="text-brand-gold" />
            <div>
              <h1 className="text-2xl font-display font-bold text-secondary-900">Admin Panel</h1>
              <p className="text-sm text-secondary-500">Select a store to manage</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.values(STORES).map((store) => (
              <Link
                key={store.slug}
                href={`/admin/${store.slug}/dashboard`}
                className="group bg-white border border-secondary-200 rounded-2xl p-8 shadow-sm hover:shadow-md hover:border-brand-gold/50 transition-all"
              >
                <div className="flex items-center justify-between mb-6">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-display font-bold text-2xl shadow-lg"
                    style={{ backgroundColor: store.theme.primaryColor }}
                  >
                    {store.name.charAt(0)}
                  </div>
                  <ArrowRight
                    size={20}
                    className="text-secondary-300 group-hover:text-brand-gold group-hover:translate-x-1 transition-all"
                  />
                </div>
                <h2 className="text-xl font-display font-bold text-secondary-900 mb-1">{store.name}</h2>
                <p className="text-sm text-secondary-500 mb-4">{store.tagline}</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-secondary-100 text-secondary-600">
                  {store.slug}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}