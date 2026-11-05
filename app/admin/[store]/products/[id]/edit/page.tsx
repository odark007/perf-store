import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { getTables } from '@/lib/stores/config';
import ProductForm from '@/components/admin/products/ProductForm';

// Next.js 15
interface PageProps {
  params: Promise<{ id: string; store: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { id, store: storeSlug } = await params;
  const t = getTables(storeSlug);
  const supabase = await createClient();

  // 1. Fetch Categories
  const { data: categories } = await supabase.from(t.categories).select('id, name').order('name');

  // 2. Fetch Product with Variants
  const { data: product, error } = await supabase
    .from(t.products)
    .select(`
      *,
      variants:${t.productVariants}(*)
    `)
    .eq('id', id)
    .single();

  if (error || !product) {
    return <div className="p-8">Product not found</div>;
  }

  // 3. Listed (single-item) products for bundle building, excluding this product itself
  const { data: allProducts } = await supabase
    .from(t.products)
    .select('id, title')
    .is('set_type', null)
    .eq('is_active', true)
    .neq('id', id)
    .order('title');

  return (
    <div>
      <ProductForm 
        categories={categories || []} 
        allProducts={allProducts || []}
        initialData={product} // Pass data here
      />
    </div>
  );
}