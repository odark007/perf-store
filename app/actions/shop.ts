'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// 1. Fetch Single Product (Full Details)
export async function getProductBySlug(slug: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (id, name, slug),
      variants:product_variants (
        *,
        inventory:inventory_master (current_stock_level)
      )
    `)
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data;
}

// 2. Smart Related Products
export async function getRelatedProducts(categoryId: string, currentProductId: string) {
  const supabase = await createClient();
  const LIMIT = 4;

  // Attempt 1: Same Category
  let { data: related } = await supabase
    .from('products')
    .select(`
      *,
      variants:product_variants (
        *,
        inventory:inventory_master (current_stock_level)
      )
    `)
    .eq('category_id', categoryId)
    .neq('id', currentProductId) // Exclude current
    .limit(LIMIT);

  related = related || [];

  // Attempt 2: Fill with Random if not enough
  if (related.length < LIMIT) {
    const needed = LIMIT - related.length;
    const existingIds = related.map((p: any) => p.id);
    existingIds.push(currentProductId);

    const { data: random } = await supabase
      .from('products')
      .select(`
        *,
        variants:product_variants (
          *,
          inventory:inventory_master (current_stock_level)
        )
      `)
      .not('id', 'in', `(${existingIds.join(',')})`)
      .limit(needed);

    if (random) {
      related = [...related, ...random];
    }
  }

  return related;
}

// 3. Fetch Reviews
export async function getProductReviews(productId: string) {
  const supabase = await createClient();
  
  // We join with profiles to get the reviewer name (if you store names in profiles)
  // Or we just show "Verified Customer" if no name data exists publicly
  const { data } = await supabase
    .from('product_reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  return data || [];
}

// 4. Submit Review Action
export async function submitReview(productId: string, rating: number, comment: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'You must be logged in to leave a review.' };

  const { error } = await supabase
    .from('product_reviews')
    .insert({
      product_id: productId,
      user_id: user.id,
      rating,
      comment
    });

  if (error) {
    if (error.code === '23505') return { error: 'You have already reviewed this product.' };
    return { error: error.message };
  }

  revalidatePath(`/products/[slug]`); // We will fix the path dynamically in the UI
  return { success: true };
}