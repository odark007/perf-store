import React from 'react';
import { createClient } from '@/lib/supabase/server';
import ProductForm from '@/components/admin/products/ProductForm';

// Next.js 15
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Fetch Categories
  const { data: categories } = await supabase.from('categories').select('id, name').order('name');

  // 2. Fetch Product with Variants
  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      variants:product_variants(*)
    `)
    .eq('id', id)
    .single();

  if (error || !product) {
    return <div className="p-8">Product not found</div>;
  }

  return (
    <div>
      <ProductForm 
        categories={categories || []} 
        initialData={product} // Pass data here
      />
    </div>
  );
}