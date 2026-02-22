'use server';

import { createClient } from '@/lib/supabase/server';

export async function getDashboardStats() {
  const supabase = await createClient();

  try {
    // 1. Get Orders Data
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('total_amount, payment_status, delivery_status');

    if (orderError) throw orderError;

    // 2. Get Inventory Data
    const { data: inventory, error: invError } = await supabase
      .from('inventory_master')
      .select('current_stock_level, low_stock_threshold');

    if (invError) throw invError;

    // 3. Calculate Metrics
    const totalRevenue = orders
      .filter(o => o.payment_status === 'paid')
      .reduce((sum, o) => sum + o.total_amount, 0);

    const pendingOrders = orders.filter(o => 
      o.delivery_status === 'processing' || o.delivery_status === 'ready'
    ).length;

    const completedOrders = orders.filter(o => o.delivery_status === 'delivered').length;

    const lowStockCount = inventory.filter(i => 
      i.current_stock_level <= i.low_stock_threshold
    ).length;

    return {
      totalRevenue,
      pendingOrders,
      completedOrders,
      lowStockCount
    };

  } catch (error) {
    console.error('Dashboard Error:', error);
    return {
      totalRevenue: 0,
      pendingOrders: 0,
      completedOrders: 0,
      lowStockCount: 0
    };
  }
}