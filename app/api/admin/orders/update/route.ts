import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { sendNotification } from '@/lib/notification';
import { getTables, getStoreOrNull } from '@/lib/stores/config';
import { getCurrentStoreSlugOrNull } from '@/lib/stores/context';

export async function POST(req: Request) {
  try {
    const { orderId, field, value, orderNumber, storeSlug } = await req.json();

    // Tenant is required — never default to derme.
    if (!storeSlug || !getStoreOrNull(storeSlug)) {
      return NextResponse.json({ error: 'Invalid or missing store' }, { status: 400 });
    }

    // The request may only act on the store it was made from.
    const activeStore = await getCurrentStoreSlugOrNull();
    if (!activeStore || activeStore !== storeSlug) {
      return NextResponse.json({ error: 'Store context mismatch' }, { status: 403 });
    }

    // 1. Init Admin Client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const t = getTables(storeSlug);

    // Authorization: only a Royal/derme manager or super admin may mutate orders.
    // The service-role client below bypasses RLS, so this check is mandatory.
    const cookieStore = await cookies();
    const authClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll() { /* read-only auth check */ },
        },
      }
    );
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { data: profile } = await authClient
      .from(t.profiles)
      .select('role')
      .eq('id', user.id)
      .single();
    if (profile?.role !== 'super_admin' && profile?.role !== 'store_manager') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Fetch Current Status BEFORE Update (Safety Check)
    const { data: currentOrder, error: fetchError } = await supabase
      .from(t.orders)
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
        .from(t.orderItems)
        .select('*')
        .eq('order_id', orderId);

      if (items) {
        for (const item of items) {
          // B. Find matching Variant to get Inventory ID and Deduction amount
          const { data: variants } = await supabase
            .from(t.productVariants)
            .select(`id, stock_deduction, master_stock_id, ${t.products}!inner(title)`)
            .eq('name', item.variant_name)
            .eq(`${t.products}.title`, item.product_title);

          const variant = variants?.[0] as { id: string; stock_deduction: number; master_stock_id: string | null } | undefined;

          if (variant && variant.master_stock_id) {
            // C. Calculate amount to return
            const amountToReturn = item.quantity * variant.stock_deduction;

            // D. Increment Master Inventory
            const { data: inventory } = await supabase
              .from(t.inventory)
              .select('current_stock_level')
              .eq('id', variant.master_stock_id)
              .single();

            if (inventory) {
              await supabase
                .from(t.inventory)
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
      .from(t.orders)
      .update({ [field]: value })
      .eq('id', orderId);

    if (error) throw error;

    // 5. Trigger Notification via Engine
    // We need to fetch full order details to populate template variables (email, phone, etc)
    const { data: fullOrder } = await supabase
      .from(t.orders)
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
        if (value === 'dispatched') await sendNotification('status_dispatched', notifyData, storeSlug);
        if (value === 'delivered') await sendNotification('status_delivered', notifyData, storeSlug);
      } 
      else if (field === 'payment_status') {
        if (value === 'paid') await sendNotification('payment_received', notifyData, storeSlug);
      }
    }

    return NextResponse.json({ success: true, message: 'Status Updated & Alerts Queued' });

  } catch (error: any) {
    console.error('Update Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}