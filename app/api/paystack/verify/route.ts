import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendNotification } from '@/lib/notification';

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

    const orderId = verifyData.data.metadata.order_id;

    // 2. Payment is Valid! Update DB (Admin Access)
    //    Only "pending" -> "paid" transitions trigger notifications.
    //    This makes the verify route idempotent: if the webhook (production)
    //    already confirmed this order, we skip so the customer isn't notified twice.
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: updatedOrders, error: updateError } = await supabaseAdmin
      .from('orders_perfume_store')
      .update({ payment_status: 'paid' })
      .eq('id', orderId)
      .eq('payment_status', 'pending')
      .select('id');

    if (updateError) {
      console.error('Verify DB Update Error:', updateError);
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }

    // 3. Send notifications ONLY if this route performed the confirmation.
    //    This is the dev fallback path (Paystack webhooks can't reach localhost).
    if (updatedOrders && updatedOrders.length > 0) {
      const { data: fullOrder } = await supabaseAdmin
        .from('orders_perfume_store')
        .select(`
          order_number, 
          user_phone, 
          user_email, 
          total_amount, 
          tax_amount,
          delivery_fee,
          notes,
          items:order_items_perfume_store(*)
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
          await sendNotification('new_order_admin', notifyData);
          await sendNotification('new_order_customer', notifyData);
        } catch (notifyErr) {
          console.error('[Verify] Notification Trigger Failed:', notifyErr);
        }
      }
    } else {
      console.log(`[Verify] Order ${orderId} already confirmed (webhook handled it). Skipping duplicate notifications.`);
    }

    return NextResponse.json({ success: true, orderId });

  } catch (error) {
    console.error('Verify API Error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}