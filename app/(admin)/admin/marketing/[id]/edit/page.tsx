import React from 'react';
import { createClient } from '@/lib/supabase/server';
import CampaignForm from '@/components/admin/marketing/CampaignForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCampaignPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [campaignRes, productsRes, categoriesRes] = await Promise.all([
    supabase.from('marketing_campaigns_perfume_store').select('*').eq('id', id).single(),
    supabase.from('products_perfume_store').select('id, title, slug').eq('is_featured', true),
    supabase.from('categories_perfume_store').select('id, name, slug')
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