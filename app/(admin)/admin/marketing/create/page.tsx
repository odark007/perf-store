import React from 'react';
import { createClient } from '@/lib/supabase/server';
import CampaignForm from '@/components/admin/marketing/CampaignForm';

export default async function CreateCampaignPage() {
  const supabase = await createClient();

  const [productsRes, categoriesRes] = await Promise.all([
    supabase.from('products').select('id, title, slug').eq('is_featured', true),
    supabase.from('categories').select('id, name, slug')
  ]);

  return (
    <CampaignForm 
      featuredProducts={productsRes.data || []}
      categories={categoriesRes.data || []}
    />
  );
}