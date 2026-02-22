'use server';

import { createClient } from '@/lib/supabase/server';
import { CartItem } from '@/lib/types';
import { getDiscountedPrice, formatPhoneForGH } from '@/lib/utils'; // Fixed: Consolidated imports
import { sendNotification } from '@/lib/notification';

interface OrderPayload {
  items: CartItem[];
  userPhone: string;
  userEmail: string | null;
  deliveryZoneId: string | null;
  deliveryAddress: string;
  paymentMethod: string;
  notes: string;
}

export async function placeOrder(payload: OrderPayload) {
  const supabase = await createClient();

  // 1. Get Current User
  const { data: { user } } = await supabase.auth.getUser();

  try {
    // 2. FETCH DATA (Inventory + Pricing Validation)
    const variantIds = payload.items.map(i => i.variantId);

    const { data: dbVariants, error: varError } = await supabase
      .from('product_variants')
      .select(`
        id, 
        stock_deduction, 
        master_stock_id, 
        price, 
        inventory:inventory_master(id, current_stock_level),
        product:products(
          is_featured,
          discount_percent,
          discount_start_at,
          discount_end_at
        )
      `)
      .in('id', variantIds);

    if (varError || !dbVariants) throw new Error("Could not verify products.");

    // 3. VALIDATE STOCK & CALCULATE SECURE TOTAL
    const demandMap: Record<string, number> = {};
    let calculatedSubtotal = 0;
    let totalItemsCount = 0;

    const secureOrderItems = [];

    for (const item of payload.items) {
      const dbVariant = dbVariants.find(v => v.id === item.variantId);
      if (!dbVariant) throw new Error(`Product variant not found: ${item.title}`);

      // A. Stock Math
      // @ts-ignore
      const masterId = dbVariant.master_stock_id;
      const usage = item.quantity * dbVariant.stock_deduction;
      demandMap[masterId] = (demandMap[masterId] || 0) + usage;

      // B. Price Math
      const { finalPrice } = getDiscountedPrice(
        dbVariant.price,
        // @ts-ignore
        dbVariant.product
      );

      const itemTotal = finalPrice * item.quantity;
      calculatedSubtotal += itemTotal;
      totalItemsCount += item.quantity;

      secureOrderItems.push({
        product_title: item.title,
        variant_name: item.variantName,
        price_at_purchase: finalPrice,
        quantity: item.quantity,
        subtotal: itemTotal
      });
    }

    // 4. CHECK INVENTORY LEVELS
    for (const [masterId, totalRequired] of Object.entries(demandMap)) {
      // @ts-ignore
      const inventory = dbVariants.find(v => v.master_stock_id === masterId)?.inventory;

      if (!inventory) throw new Error("Inventory record missing.");
      // @ts-ignore
      if (inventory.current_stock_level < totalRequired) {
        throw new Error(`Items are out of stock. Please refresh cart.`);
      }

      // Deduct
      await supabase
        .from('inventory_master')
        // @ts-ignore
        .update({ current_stock_level: inventory.current_stock_level - totalRequired })
        .eq('id', masterId);
    }

    // 5. CALCULATE FINAL TOTAL (Delivery + Tax)
    const zonePromise = payload.deliveryZoneId
      ? supabase.from('delivery_zones').select('*').eq('id', payload.deliveryZoneId).single()
      : Promise.resolve({ data: null });

    const [settingsRes, taxesRes, zoneRes] = await Promise.all([
      supabase.from('store_settings').select('*').single(),
      supabase.from('taxes').select('*').eq('is_active', true),
      zonePromise
    ]);

    const taxes = taxesRes.data || [];
    const taxAmount = taxes.reduce((sum, t) => sum + (calculatedSubtotal * (t.rate_percent / 100)), 0);

    const settings = settingsRes.data || { bulk_threshold: 10, bulk_surcharge: 5 };
    const zone = zoneRes.data;

    let deliveryFee = 0;
    if (zone) {
      deliveryFee = zone.base_price;
      if (totalItemsCount > settings.bulk_threshold) {
        deliveryFee += (totalItemsCount - settings.bulk_threshold) * settings.bulk_surcharge;
      }
    }

    const finalGrandTotal = calculatedSubtotal + taxAmount + deliveryFee;

    // --- FIX: FORMAT PHONE NUMBER ---
    const formattedPhone = formatPhoneForGH(payload.userPhone);

    // 6. CREATE ORDER
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user?.id || null,
        user_phone: formattedPhone,
        user_email: payload.userEmail,
        total_amount: finalGrandTotal,
        tax_amount: taxAmount,
        delivery_fee: deliveryFee,
        delivery_zone_id: payload.deliveryZoneId,
        payment_method: payload.paymentMethod,
        payment_status: 'pending',
        delivery_status: 'processing',
        delivery_address: payload.deliveryAddress,
        notes: payload.notes
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 7. INSERT ITEMS
    const itemsToInsert = secureOrderItems.map(item => ({
      order_id: order.id,
      ...item
    }));

    await supabase.from('order_items').insert(itemsToInsert);

    // 8. NOTIFICATIONS
    // Logic: 
    // 1. If Manual/PayLater -> Send Immediately.
    // 2. If Paystack AND Localhost (Dev) -> Send Immediately (Mocking the webhook).
    // 3. If Paystack AND Production -> Skip (Wait for real Webhook).

    const isDev = process.env.NODE_ENV === 'development';
    const shouldSendNow = payload.paymentMethod !== 'paystack' || isDev;

    if (shouldSendNow) {
      const noteParts = payload.notes ? payload.notes.split(' - ') : [];
      const derivedCustomerName = noteParts.length > 0 ? noteParts[0] : "Customer";
      const validEmail = payload.userEmail && payload.userEmail.includes('@') ? payload.userEmail : null;

      const notificationData = {
        order_number: order.order_number,
        customer_name: derivedCustomerName,
        total_amount: finalGrandTotal,
        subtotal: calculatedSubtotal,
        tax: taxAmount,
        delivery: deliveryFee,
        user_phone: payload.userPhone, // Pass raw phone, let notification logic or formatter handle it if needed
        user_email: validEmail,
        items: secureOrderItems
      };

      console.log(`[Checkout] Triggering Notifications (Immediate Mode: ${isDev ? 'Dev Override' : 'Manual Payment'})`);

      try {
        await sendNotification('new_order_admin', notificationData);
        await sendNotification('new_order_customer', notificationData);
      } catch (notifyErr) {
        console.error("[Checkout] Notification Trigger Failed:", notifyErr);
      }
    } else {
      console.log(`[Checkout] Skipping notifications for Paystack order #${order.order_number} (Waiting for Webhook)`);
    }

    return { success: true, orderId: order.id, finalTotal: finalGrandTotal };

  } catch (error: any) {
    console.error("Order Error:", error);
    return { error: error.message };
  }
}