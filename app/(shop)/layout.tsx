import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AgeGateModal from '@/components/modals/AgeGateModal';
import CartDrawer from '@/components/shop/CartDrawer';
import { createClient } from '@/lib/supabase/server';

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Fetch Store Settings for Footer/Contact info
  const { data: settings } = await supabase
    .from('store_settings')
    .select('*')
    .single();

  return (
    <>
      <AgeGateModal />
      <CartDrawer />
      <Navbar />
      <main className="flex-1 pt-4 md:pt-8">
        {children}
      </main>
      {/* Pass the fetched settings to the Footer */}
      <Footer settings={settings} />
    </>
  );
}