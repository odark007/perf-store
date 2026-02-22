import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { sendNotification } from '@/lib/notification';

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
      const orderId = event.data.metadata.order_id;
      console.log(`Payment success for Order: ${orderId}`);

      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // 1. Update Status
      const { error } = await supabaseAdmin
        .from('orders')
        .update({ 
          payment_status: 'paid',
          notes: `Paystack Ref: ${event.data.reference}`
        })
        .eq('id', orderId);

      if (error) {
        console.error('Database Update Failed:', error);
        return NextResponse.json({ error: 'DB Update Failed' }, { status: 500 });
      }

      // 2. Fetch Full Order Details + Items for Invoice
      const { data: fullOrder } = await supabaseAdmin
        .from('orders')
        .select(`
          order_number, 
          user_phone, 
          user_email, 
          total_amount, 
          tax_amount,
          delivery_fee,
          notes,
          items:order_items(*)
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
        await sendNotification('new_order_admin', notifyData);
        await sendNotification('new_order_customer', notifyData);
        
        // Optional: Also send 'payment_received' if you have a specific template for that, 
        // but 'new_order_customer' usually serves as the confirmation receipt.
      }
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}