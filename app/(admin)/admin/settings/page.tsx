import React from 'react';
import { createClient } from '@/lib/supabase/server';
import GeneralSettings from '@/components/admin/settings/GeneralSettings';
import DeliverySettings from '@/components/admin/settings/DeliverySettings';
import TaxSettings from '@/components/admin/settings/TaxSettings';
import NotificationSettings from '@/components/admin/settings/NotificationSettings';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = await createClient();

  // Fetch all settings data
  // FIX: Added 'templatesRes' to the variable list [ ... ]
  const [settingsRes, zonesRes, taxesRes, templatesRes] = await Promise.all([
    supabase.from('store_settings').select('*').single(),
    supabase.from('delivery_zones').select('*').order('name'),
    supabase.from('taxes').select('*').order('priority'),
    supabase.from('notification_templates').select('*').order('name'),
  ]);

  const settings = settingsRes.data || {};
  const zones = zonesRes.data || [];
  const taxes = taxesRes.data || [];
  const templates = templatesRes.data || []; // Now this variable exists

  return (
    <div className="space-y-12 pb-20">
      <div>
        <h1 className="text-3xl font-display font-bold text-secondary-900 mb-2">Store Settings</h1>
        <p className="text-secondary-500">Manage contacts, delivery, tax, and notification configurations.</p>
      </div>

      <div className="grid gap-12">
        <section>
          <GeneralSettings settings={settings} />
        </section>

        <section className="border-t border-secondary-200 pt-10">
          <DeliverySettings zones={zones} />
        </section>

        <section className="border-t border-secondary-200 pt-10">
          <TaxSettings taxes={taxes} />
        </section>

        <section className="border-t border-secondary-200 pt-10">
          <NotificationSettings settings={settings} templates={templates} />
        </section>
      </div>
    </div>
  );
}