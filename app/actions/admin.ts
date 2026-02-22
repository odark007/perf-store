'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Helper: Check if Super Admin
async function checkSuperAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'super_admin') {
    throw new Error('Permission Denied: Super Admin only');
  }
  return supabase;
}

export async function createCategory(formData: FormData) {
  try {
    const supabase = await checkSuperAdmin();
    const name = formData.get('name') as string;
    
    // Auto-generate slug (e.g., "Soft Drinks" -> "soft-drinks")
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    const { error } = await supabase
      .from('categories')
      .insert({ name, slug });

    if (error) throw error;
    revalidatePath('/admin/inventory/categories');
    return { success: true, message: 'Category created' };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteCategory(categoryId: string) {
  try {
    const supabase = await checkSuperAdmin();

    // 1. Check for existing products
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', categoryId);

    if (countError) throw countError;

    if (count && count > 0) {
      return { error: `Cannot delete: ${count} products are using this category.` };
    }

    // 2. Delete
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) throw error;
    revalidatePath('/admin/inventory/categories');
    return { success: true, message: 'Category deleted' };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateCategory(id: string, formData: FormData) {
  try {
    const supabase = await checkSuperAdmin();
    const name = formData.get('name') as string;
    
    // Regenerate slug from new name
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    const { error } = await supabase
      .from('categories')
      .update({ name, slug })
      .eq('id', id);

    if (error) {
      if (error.code === '23505') { // Unique violation code
        return { error: 'A category with this name already exists.' };
      }
      throw error;
    }

    revalidatePath('/admin/inventory/categories');
    revalidatePath('/shop'); // Update shop filters too
    return { success: true, message: 'Category updated' };
  } catch (error: any) {
    return { error: error.message };
  }
}