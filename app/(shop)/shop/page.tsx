import React from 'react';
import { createClient } from '@/lib/supabase/server';
import ShopLayoutClient from '@/components/shop/ShopLayoutClient';

export const dynamic = 'force-dynamic';

interface ShopPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  // 1. Parse Filters
  const categorySlug = params.category as string;
  const brand = params.brand as string;
  const concentration = params.concentration as string;
  const scentFamily = params.scent_family as string;
  const featured = params.featured === 'true';
  const minPrice = Number(params.min) || 0;
  const maxPrice = Number(params.max) || 20000;
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
      targetCategoryId = '00000000-0000-0000-0000-000000000000';
    }
  }

  // 3. Fetch Metadata (Categories, Brands, Concentration, Scent Family)
  const [categoriesRes, productsMetaRes] = await Promise.all([
    supabase.from('categories').select('id, name, slug').order('name'),
    supabase.from('products').select('brand, concentration, scentFamily')
  ]);

  const categories = categoriesRes.data || [];
  const allProductsMeta = productsMetaRes.data || [];

  const uniqueBrands = Array.from(new Set(allProductsMeta.map(p => p.brand).filter(Boolean))).sort();
  const uniqueConcentrations = Array.from(new Set(allProductsMeta.map(p => p.concentration).filter(Boolean))).sort();
  const uniqueScentFamilies = Array.from(new Set(allProductsMeta.map(p => p.scentFamily).filter(Boolean))).sort();

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

  // Apply Filters
  if (targetCategoryId) query = query.eq('category_id', targetCategoryId);
  if (brand) query = query.eq('brand', brand);
  if (concentration) query = query.eq('concentration', concentration);
  if (scentFamily) query = query.eq('scentFamily', scentFamily);
  if (featured) query = query.eq('is_featured', true);
  if (queryTerm) query = query.ilike('title', `%${queryTerm}%`);

  if (minPrice > 0) query = query.gte('variants.price', minPrice);
  if (maxPrice < 20000) query = query.lte('variants.price', maxPrice);

  switch (sort) {
    case 'name_asc': query = query.order('title', { ascending: true }); break;
    case 'price_asc': query = query.order('variants(price)', { ascending: true }); break;
    case 'price_desc': query = query.order('variants(price)', { ascending: false }); break;
    case 'newest':
    default: query = query.order('created_at', { ascending: false }); break;
  }

  const { data: products, error } = await query;

  if (error) {
    console.error("Shop Error:", error);
    return <div className="container-custom py-12">Error loading products.</div>;
  }

  return (
    <ShopLayoutClient
      categories={categories}
      brands={uniqueBrands as string[]}
      concentrations={uniqueConcentrations as string[]}
      scentFamilies={uniqueScentFamilies as string[]}
      products={products || []}
    />
  );
}
