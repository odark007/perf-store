import React from 'react';
import { createClient } from '@/lib/supabase/server';
import ProductForm from '@/components/admin/products/ProductForm';

export default async function CreateProductPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from('categories_perfume_store').select('id, name');

  return (
    <div>
      <ProductForm categories={categories || []} />
    </div>
  );
}