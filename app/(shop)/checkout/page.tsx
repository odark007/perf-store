import React from 'react';
import { Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import CheckoutClientWrapper from '@/components/checkout/CheckoutClientWrapper';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  const supabase = await createClient();

  // 1. Fetch Dynamic Business Logic from DB
  const [settingsRes, zonesRes, taxesRes] = await Promise.all([
    supabase.from('store_settings').select('*').single(),
    supabase.from('delivery_zones').select('*').eq('is_active', true).order('name'),
    supabase.from('taxes').select('*').eq('is_active', true).order('priority'),
  ]);

  return (
    <div className="container-custom py-8 md:py-12">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-display font-bold text-secondary-900">Checkout</h1>
        <p className="text-secondary-500 flex items-center justify-center md:justify-start gap-2 mt-2">
          <Lock size={16} className="text-green-600" />
          Secure SSL Encrypted Transaction
        </p>
      </div>

      {/* Pass DB Data to Client Wrapper */}
      <CheckoutClientWrapper 
        settings={settingsRes.data || {}} 
        zones={zonesRes.data || []} 
        taxes={taxesRes.data || []} 
      />
    </div>
  );
}