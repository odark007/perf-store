import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendNotification } from '@/lib/notification';
import { getTables, getStoreOrNull } from '@/lib/stores/config';

export async function POST(req: Request) {
  try {
    const { reference } = await req.json();

    if (!reference) {
      return NextResponse.json({ error: 'No reference provided' }, { status: 400 });
    }

    // 1. Ask Paystack: "Is this reference valid?"
    const verifyReq = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const verifyData = await verifyReq.json();

    if (!verifyData.status || verifyData.data.status !== 'success') {
      return NextResponse.json({ error: 'Payment not successful' }, { status: 400 });
    }

    const orderId = verifyData.data.metadata?.order_id;
    const storeSlug = verifyData.data.metadata?.store_slug || 'derme';

    const store = getStoreOrNull(storeSlug);
    if (!store) {
      return NextResponse.json({ error: 'Invalid store' }, { status: 400 });
    }

    const t = getTables(storeSlug);

    // 2. Payment is Valid! Update DB (Admin Access)
    //    Only "pending" -> "paid" transitions trigger notifications.
    //    This makes the verify route idempotent: if the webhook (production)
    //    already confirmed this order, we skip so the customer isn't notified twice.
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: updatedOrders, error: updateError } = await supabaseAdmin
      .from(t.orders)
      .update({ payment_status: 'paid', store_slug: storeSlug })
      .eq('id', orderId)
      .eq('payment_status', 'pending')
      .select('id');

    if (updateError) {
      console.error('Verify DB Update Error:', updateError);
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }

    // 2b. Insert a record into the payments table for this store.
    const { error: payError } = await supabaseAdmin
      .from(t.payments)
      .insert({
        order_id: orderId,
        store_slug: storeSlug,
        paystack_reference: reference,
        amount: verifyData.data.amount || 0,
        currency: verifyData.data.currency || store.currency,
        channel: verifyData.data.channel || null,
        payment_status: 'success',
        gateway_response: verifyData.data.gateway_response || null,
        customer_email: verifyData.data.customer?.email || null,
        customer_phone: verifyData.data.customer?.phone || null,
        raw_payload: verifyData.data,
        paid_at: verifyData.data.paid_at ? new Date(verifyData.data.paid_at) : new Date(),
      });

    if (payError) {
      console.error('Verify Payments Insert Error:', payError);
    }

    // 3. Send notifications ONLY if this route performed the confirmation.
    //    This is the dev fallback path (Paystack webhooks can't reach localhost).
    if (updatedOrders && updatedOrders.length > 0) {
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
          items: fullOrder.items
        };

        console.log(`[Verify] Payment confirmed for Order #${fullOrder.order_number} (dev fallback). Sending notifications.`);

        try {
          await sendNotification('new_order_admin', notifyData, storeSlug);
          await sendNotification('new_order_customer', notifyData, storeSlug);
        } catch (notifyErr) {
          console.error('[Verify] Notification Trigger Failed:', notifyErr);
        }
      }
    } else {
      console.log(`[Verify] Order ${orderId} already confirmed (webhook handled it). Skipping duplicate notifications.`);
    }

    return NextResponse.json({ success: true, orderId, store: storeSlug });

  } catch (error) {
    console.error('Verify API Error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}