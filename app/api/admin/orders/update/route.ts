import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendNotification } from '@/lib/notification';

export async function POST(req: Request) {
  try {
    const { orderId, field, value, orderNumber } = await req.json();

    // 1. Init Admin Client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 2. Fetch Current Status BEFORE Update (Safety Check)
    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('payment_status, delivery_status')
      .eq('id', orderId)
      .single();

    if (fetchError) throw new Error('Order not found');

    // 3. AUTOMATED RESTOCK LOGIC
    // Trigger if we are marking Payment as 'failed' (Cancelled)
    // AND if it wasn't already failed (Prevent Double Restock)
    if (field === 'payment_status' && value === 'failed' && currentOrder.payment_status !== 'failed') {
      
      console.log(`Restocking Inventory for Order #${orderNumber}...`);

      // A. Get Items
      const { data: items } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (items) {
        for (const item of items) {
          // B. Find matching Variant to get Inventory ID and Deduction amount
          const { data: variants } = await supabase
            .from('product_variants')
            .select('id, stock_deduction, master_stock_id, products!inner(title)')
            .eq('name', item.variant_name)
            .eq('products.title', item.product_title);

          const variant = variants?.[0];

          if (variant && variant.master_stock_id) {
            // C. Calculate amount to return
            const amountToReturn = item.quantity * variant.stock_deduction;

            // D. Increment Master Inventory
            const { data: inventory } = await supabase
              .from('inventory_master')
              .select('current_stock_level')
              .eq('id', variant.master_stock_id)
              .single();

            if (inventory) {
              await supabase
                .from('inventory_master')
                .update({ current_stock_level: inventory.current_stock_level + amountToReturn })
                .eq('id', variant.master_stock_id);
              
              console.log(`+${amountToReturn} units returned to inventory for ${item.product_title}`);
            }
          }
        }
      }
    }

    // 4. Update Database Status
    const { error } = await supabase
      .from('orders')
      .update({ [field]: value })
      .eq('id', orderId);

    if (error) throw error;

    // 5. Trigger Notification via Engine
    // We need to fetch full order details to populate template variables (email, phone, etc)
    const { data: fullOrder } = await supabase
      .from('orders')
      .select('order_number, user_phone, user_email, total_amount, notes')
      .eq('id', orderId)
      .single();

    if (fullOrder) {
      const notifyData = {
        order_number: fullOrder.order_number,
        customer_name: fullOrder.notes?.split(' - ')[0] || 'Customer',
        total_amount: fullOrder.total_amount,
        user_phone: fullOrder.user_phone,
        user_email: fullOrder.user_email,
        items: [] // Admin updates don't need the full item list in SMS usually
      };

      if (field === 'delivery_status') {
        if (value === 'dispatched') await sendNotification('status_dispatched', notifyData);
        if (value === 'delivered') await sendNotification('status_delivered', notifyData);
      } 
      else if (field === 'payment_status') {
        if (value === 'paid') await sendNotification('payment_received', notifyData);
      }
    }

    return NextResponse.json({ success: true, message: 'Status Updated & Alerts Queued' });

  } catch (error: any) {
    console.error('Update Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}