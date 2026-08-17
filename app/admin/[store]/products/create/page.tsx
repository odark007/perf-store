import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { getTables } from '@/lib/stores/config';
import ProductForm from '@/components/admin/products/ProductForm';

export default async function CreateProductPage({ params }: { params: Promise<{ store: string }> }) {
  const { store: storeSlug } = await params;
  const t = getTables(storeSlug);
  const supabase = await createClient();
  const { data: categories } = await supabase.from(t.categories).select('id, name');

  return (
    <div>
      <ProductForm categories={categories || []} />
    </div>
  );
}