'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface VariantInput {
  id?: string;
  name: string;
  type: 'single' | 'pack' | 'crate';
  price: number;
  stock_deduction: number;
  sku?: string;
}

interface ProductInput {
  title: string;
  description: string;
  category_id: string;
  base_image_url: string;
  variants: VariantInput[];
  initial_stock: number;
  threshold: number;
  brand: string;
  is_featured: boolean;
  discount_percent: number;
  discount_start_at: string | null;
  discount_end_at: string | null;
}

// Helper to sanitize promotion data
function sanitizePromotion(input: ProductInput) {
  if (!input.is_featured) {
    return { percent: 0, start: null, end: null };
  }
  return {
    percent: input.discount_percent,
    start: input.discount_start_at || null,
    end: input.discount_end_at || null
  };
}

export async function createProduct(input: ProductInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  try {
    const promo = sanitizePromotion(input);

    // 1. Inventory
    const { data: inventory, error: invError } = await supabase
      .from('inventory_master')
      .insert({
        product_name: `${input.title} (Inventory)`,
        current_stock_level: input.initial_stock,
        low_stock_threshold: input.threshold || 10
      })
      .select()
      .single();

    if (invError) throw new Error(`Inventory Error: ${invError.message}`);

    // 2. Category Name
    const { data: catData } = await supabase.from('categories').select('name').eq('id', input.category_id).single();
    
    // 3. Product
    const slug = input.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Date.now().toString().slice(-4);
    
    const { data: product, error: prodError } = await supabase
      .from('products')
      .insert({
        title: input.title,
        slug: slug,
        description: input.description,
        category: catData?.name || 'Uncategorized',
        category_id: input.category_id,
        base_image_url: input.base_image_url,
        is_active: true,
        brand: input.brand,
        is_featured: input.is_featured,
        discount_percent: promo.percent,
        discount_start_at: promo.start,
        discount_end_at: promo.end
      })
      .select()
      .single();

    if (prodError) throw new Error(`Product Error: ${prodError.message}`);

    // 4. Variants (FIX: Unique SKU generation)
    const variantsData = input.variants.map(v => ({
      product_id: product.id,
      master_stock_id: inventory.id,
      name: v.name,
      type: v.type,
      price: v.price,
      stock_deduction: v.stock_deduction,
      // Add random string to ensure uniqueness even if type is same
      sku: v.sku || `${slug}-${v.type}-${Math.random().toString(36).substring(2, 7)}`
    }));

    const { error: varError } = await supabase.from('product_variants').insert(variantsData);
    if (varError) throw new Error(`Variant Error: ${varError.message}`);

    revalidatePath('/shop');
    revalidatePath('/admin/products');
    revalidatePath('/admin/inventory');
    return { success: true };

  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateProduct(productId: string, input: Omit<ProductInput, 'initial_stock' | 'threshold'>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  try {
    // Cast to full input for sanitize helper (inventory fields ignored)
    const promo = sanitizePromotion(input as ProductInput);

    const { data: existingVariants } = await supabase
      .from('product_variants')
      .select('id, master_stock_id')
      .eq('product_id', productId);

    const masterStockId = existingVariants?.[0]?.master_stock_id;
    if (!masterStockId) throw new Error("Critical: Could not find Inventory Link.");

    // Image Cleanup Logic...
    const { data: oldProduct } = await supabase.from('products').select('base_image_url').eq('id', productId).single();
    if (oldProduct && oldProduct.base_image_url !== input.base_image_url) {
      if (oldProduct.base_image_url.includes('product-images')) {
        const oldPath = oldProduct.base_image_url.split('/product-images/')[1];
        if (oldPath) await supabase.storage.from('product-images').remove([oldPath]);
      }
    }

    // Update Product
    const { data: catData } = await supabase.from('categories').select('name').eq('id', input.category_id).single();
    
    await supabase.from('products').update({
      title: input.title,
      description: input.description,
      category: catData?.name || 'Uncategorized',
      category_id: input.category_id,
      base_image_url: input.base_image_url,
      brand: input.brand,
      is_featured: input.is_featured,
      discount_percent: promo.percent,
      discount_start_at: promo.start,
      discount_end_at: promo.end
    }).eq('id', productId);

    // Update Inventory Name
    await supabase.from('inventory_master').update({
      product_name: `${input.title} (Inventory)`
    }).eq('id', masterStockId);

    // Variant Sync Logic...
    const inputIds = input.variants.map(v => v.id).filter(Boolean);
    const dbIds = existingVariants?.map(v => v.id) || [];
    
    // Delete
    const toDelete = dbIds.filter(id => !inputIds.includes(id));
    if (toDelete.length > 0) {
      await supabase.from('product_variants').delete().in('id', toDelete);
    }

    // Update
    const toUpdate = input.variants.filter(v => v.id);
    for (const v of toUpdate) {
      await supabase.from('product_variants').update({
        name: v.name,
        type: v.type,
        price: v.price,
        stock_deduction: v.stock_deduction
      }).eq('id', v.id);
    }

    // Insert (FIX: Unique SKU)
    const toInsert = input.variants.filter(v => !v.id).map(v => ({
      product_id: productId,
      master_stock_id: masterStockId,
      name: v.name,
      type: v.type,
      price: v.price,
      stock_deduction: v.stock_deduction,
      sku: `${input.title.slice(0,3)}-${v.type}-${Date.now()}-${Math.random().toString(36).substring(2,5)}`
    }));

    if (toInsert.length > 0) {
      await supabase.from('product_variants').insert(toInsert);
    }

    revalidatePath('/shop');
    revalidatePath('/admin/products');
    revalidatePath('/admin/inventory');
    
    return { success: true };

  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: variants } = await supabase
    .from('product_variants')
    .select('master_stock_id')
    .eq('product_id', productId)
    .limit(1);

  const inventoryId = variants?.[0]?.master_stock_id;

  const { error } = await supabase.from('products').delete().eq('id', productId);
  if (error) return { error: error.message };

  if (inventoryId) {
    await supabase.from('inventory_master').delete().eq('id', inventoryId);
  }

  revalidatePath('/admin/products');
  revalidatePath('/shop');
  return { success: true };
}