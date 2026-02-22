import React from 'react';
import { createClient } from '@/lib/supabase/server';
import ProductCard from '@/components/shop/ProductCard';
import ShopSidebar from '@/components/shop/filters/ShopSidebar';
import ShopLayoutClient from '@/components/shop/ShopLayoutClient';

export const dynamic = 'force-dynamic';

interface ShopPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  // 1. Parse Filters
  const categorySlug = params.category as string; // This is now 'beer', 'wine', etc.
  const brand = params.brand as string;
  const type = params.type as string;
  const featured = params.featured === 'true';
  const minPrice = Number(params.min) || 0;
  const maxPrice = Number(params.max) || 10000;
  const sort = (params.sort as string) || 'newest';
  const queryTerm = (params.q as string) || '';

  // 2. Resolve Category Slug to ID
  let targetCategoryId = null;

  if (categorySlug) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();

    if (cat) {
      targetCategoryId = cat.id;
    } else {
      // If slug provided but not found, we should probably return 0 results
      // or handle it gracefully. We'll set a dummy ID to ensure query returns empty.
      targetCategoryId = '00000000-0000-0000-0000-000000000000';
    }
  }

  // 3. Fetch Metadata (Categories & Brands)
  const { data: categories } = await supabase.from('categories').select('id, name, slug').order('name');

  // Get distinct brands
  const { data: allProducts } = await supabase.from('products').select('brand');
  // @ts-ignore
  const uniqueBrands = Array.from(new Set(allProducts?.map(p => p.brand).filter(Boolean)));

  // 4. Build Main Product Query
  let query = supabase
    .from('products')
    .select(`
      *,
      variants:product_variants!inner (
        *,
        inventory:inventory_master (current_stock_level)
      )
    `);

  // Apply ID Filter (Not Slug)
  if (targetCategoryId) query = query.eq('category_id', targetCategoryId);

  if (brand) query = query.eq('brand', brand);
  if (featured) query = query.eq('is_featured', true);
  if (queryTerm) query = query.ilike('title', `%${queryTerm}%`);

  if (type) query = query.eq('variants.type', type);
  if (minPrice > 0) query = query.gte('variants.price', minPrice);
  if (maxPrice < 10000) query = query.lte('variants.price', maxPrice);

  switch (sort) {
    case 'name_asc': query = query.order('title', { ascending: true }); break;
    case 'newest':
    default: query = query.order('created_at', { ascending: false }); break;
  }

  const { data: products, error } = await query;

  // DEBUG LOG (Check your VS Code Terminal)
  if (products && products.length > 0) {
    const fanta = products.find((p: any) => p.title.includes('Fanta'));
    if (fanta) {
      console.log("SERVER DATA CHECK:", JSON.stringify(fanta.variants, null, 2));
    }
  }

  if (error) {
    console.error("Shop Error:", error);
    return <div className="container-custom py-12">Error loading products.</div>;
  }

  return (
    <ShopLayoutClient
      categories={categories || []}
      brands={uniqueBrands as string[]}
      products={products || []}
    />
  );
}