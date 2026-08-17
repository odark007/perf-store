import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { getTables } from '@/lib/stores/config';
import CampaignForm from '@/components/admin/marketing/CampaignForm';

export default async function CreateCampaignPage({ params }: { params: Promise<{ store: string }> }) {
  const { store: storeSlug } = await params;
  const t = getTables(storeSlug);
  const supabase = await createClient();

  const [productsRes, categoriesRes] = await Promise.all([
    supabase.from(t.products).select('id, title, slug').eq('is_featured', true),
    supabase.from(t.categories).select('id, name, slug')
  ]);

  return (
    <CampaignForm 
      featuredProducts={productsRes.data || []}
      categories={categoriesRes.data || []}
    />
  );
}