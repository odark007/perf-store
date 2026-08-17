import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { sendNotification } from '@/lib/notification';
import { getTables, getStoreOrNull } from '@/lib/stores/config';

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();

    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(bodyText)
      .digest('hex');

    const signature = req.headers.get('x-paystack-signature');

    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(bodyText);

    if (event.event === 'charge.success') {
      const orderId = event.data.metadata?.order_id;
      const storeSlug = event.data.metadata?.store_slug || 'derme';

      const store = getStoreOrNull(storeSlug);
      if (!store) {
        console.error(`[Webhook] Unknown store: ${storeSlug}`);
        return NextResponse.json({ received: true });
      }

      const t = getTables(storeSlug);
      console.log(`[Webhook] Payment success for Order: ${orderId} (store: ${storeSlug})`);

      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // 1. Update Status — only "pending" -> "paid" transitions trigger notifications.
      //    This makes the webhook idempotent: if the verify route (dev fallback)
      //    already confirmed this order, we skip so the customer isn't notified twice.
      const { data: updatedOrders, error } = await supabaseAdmin
        .from(t.orders)
        .update({ 
          payment_status: 'paid',
          store_slug: storeSlug,
          notes: `Paystack Ref: ${event.data.reference}`
        })
        .eq('id', orderId)
        .eq('payment_status', 'pending')
        .select('id');

      if (error) {
        console.error('Database Update Failed:', error);
        return NextResponse.json({ error: 'DB Update Failed' }, { status: 500 });
      }

      // 1b. Record the payment in the payments table.
      const { error: payError } = await supabaseAdmin
        .from(t.payments)
        .insert({
          order_id: orderId,
          store_slug: storeSlug,
          paystack_reference: event.data.reference,
          amount: event.data.amount || 0,
          currency: event.data.currency || store.currency,
          channel: event.data.channel || null,
          payment_status: 'success',
          gateway_response: event.data.gateway_response || null,
          customer_email: event.data.customer?.email || null,
          customer_phone: event.data.customer?.phone || null,
          raw_payload: event.data,
          paid_at: event.data.paid_at ? new Date(event.data.paid_at) : new Date(),
        });

      if (payError) {
        console.error('[Webhook] Payments Insert Error:', payError);
      }

      // If no row was updated, the order was already confirmed -> skip notifications.
      if (!updatedOrders || updatedOrders.length === 0) {
        console.log(`[Webhook] Order ${orderId} already confirmed. Skipping duplicate notifications.`);
        return NextResponse.json({ received: true });
      }

      // 2. Fetch Full Order Details + Items for Invoice
      const { data: fullOrder } = await (supabaseAdmin as any)
        .from(t.orders)
        .select(`
          order_number, 
          user_phone, 
          user_email, 
          total_amount, 
          tax_amount,
          delivery_fee,
          notes,
          items:${t.orderItems}(*)
        `)
        .eq('id', orderId)
        .single();

      if (fullOrder) {
        const derivedCustomerName = fullOrder.notes?.split(' - ')[0] || 'Customer';
        
        // Use subtotal logic if not stored, or recalculate simply for display
        // Subtotal = Total - Tax - Delivery
        const subtotal = fullOrder.total_amount - (fullOrder.tax_amount || 0) - (fullOrder.delivery_fee || 0);

        const notifyData = {
          order_number: fullOrder.order_number,
          customer_name: derivedCustomerName,
          total_amount: fullOrder.total_amount,
          subtotal: subtotal,
          tax: fullOrder.tax_amount,
          delivery: fullOrder.delivery_fee,
          user_phone: fullOrder.user_phone,
          user_email: fullOrder.user_email,
          items: fullOrder.items // Include items for HTML table
        };

        console.log(`[Webhook] Sending "New Order" Alerts for #${fullOrder.order_number}`);
        
        // Trigger Standard "New Order" Alerts (since they were skipped at checkout)
        await sendNotification('new_order_admin', notifyData, storeSlug);
        await sendNotification('new_order_customer', notifyData, storeSlug);
      }
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}