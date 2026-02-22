'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Helper: Check Super Admin (reused logic)
async function checkPermissions() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'super_admin' && profile?.role !== 'store_manager') {
    throw new Error('Permission Denied');
  }
  return { supabase, user };
}

export async function restockInventory(inventoryId: string, quantityToAdd: number, reason: string) {
  try {
    const { supabase, user } = await checkPermissions();

    // 1. Get current level
    const { data: current, error: fetchError } = await supabase
      .from('inventory_master')
      .select('current_stock_level, product_name')
      .eq('id', inventoryId)
      .single();

    if (fetchError) throw new Error('Inventory item not found');

    const newLevel = current.current_stock_level + quantityToAdd;

    // 2. Update level
    const { error: updateError } = await supabase
      .from('inventory_master')
      .update({ current_stock_level: newLevel })
      .eq('id', inventoryId);

    if (updateError) throw updateError;

    // 3. Log the action (Optional: You could create an 'inventory_logs' table later)
    console.log(`[Inventory] ${user.email} added ${quantityToAdd} to ${current.product_name}. Reason: ${reason}`);

    revalidatePath('/admin/inventory');
    revalidatePath('/shop'); // Update shop cache too so buttons re-enable
    
    return { success: true, message: 'Stock updated successfully' };
  } catch (error: any) {
    return { error: error.message };
  }
}