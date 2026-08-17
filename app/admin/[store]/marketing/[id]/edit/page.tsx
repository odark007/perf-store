import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { getTables } from '@/lib/stores/config';
import CampaignForm from '@/components/admin/marketing/CampaignForm';

interface PageProps {
  params: Promise<{ id: string; store: string }>;
}

export default async function EditCampaignPage({ params }: PageProps) {
  const { id, store: storeSlug } = await params;
  const t = getTables(storeSlug);
  const supabase = await createClient();

  const [campaignRes, productsRes, categoriesRes] = await Promise.all([
    supabase.from(t.campaigns).select('*').eq('id', id).single(),
    supabase.from(t.products).select('id, title, slug').eq('is_featured', true),
    supabase.from(t.categories).select('id, name, slug')
  ]);

  if (campaignRes.error || !campaignRes.data) {
    return <div>Campaign not found</div>;
  }

  return (
    <CampaignForm 
      initialData={campaignRes.data}
      featuredProducts={productsRes.data || []}
      categories={categoriesRes.data || []}
    />
  );
}