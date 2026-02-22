'use client';

import { useEffect } from 'react';
import { sendGAEvent } from '@/lib/analytics';

interface Props {
  order: any;
  items: any[];
}

const PurchaseTracker: React.FC<Props> = ({ order, items }) => {
  useEffect(() => {
    // Basic deduplication using sessionStorage
    const key = `ga_tracked_${order.id}`;
    if (sessionStorage.getItem(key)) return;

    sendGAEvent('purchase', {
      transaction_id: order.order_number,
      value: order.total_amount,
      tax: order.tax_amount,
      shipping: order.delivery_fee,
      currency: 'GHS',
      items: items.map((i: any) => ({
        item_id: i.product_title, // or ID if available in order_items
        item_name: i.product_title,
        item_variant: i.variant_name,
        price: i.price_at_purchase,
        quantity: i.quantity
      }))
    });

    sessionStorage.setItem(key, 'true');
  }, [order, items]);

  return null;
};

export default PurchaseTracker;