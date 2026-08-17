import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/shop/CartDrawer';
import { createClient } from '@/lib/supabase/server';
import { getStoreOrNull, getTables } from '@/lib/stores/config';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ store: string }>;
}) {
  const { store: storeSlug } = await params;
  const store = getStoreOrNull(storeSlug);

  if (!store) {
    notFound();
  }

  const supabase = await createClient();

  // Fetch Store Settings for Footer/Contact info (dynamic table per store)
  const { data: settings } = await supabase
    .from(getTables(storeSlug).storeSettings)
    .select('*')
    .single();

  return (
    <>
      <CartDrawer storeSlug={storeSlug} />
      <Navbar storeSlug={storeSlug} />
      <main className="flex-1 pt-4 md:pt-8">
        {children}
      </main>
      <Footer settings={settings} storeSlug={storeSlug} />
    </>
  );
}