'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useCartStore } from '@/lib/store';
import { ShoppingBag } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Props {
  settings: any;
  taxes: any[];
  selectedZone: any | null;
}

const CheckoutSummary: React.FC<Props> = ({ settings, taxes, selectedZone }) => {
  const { items, getSubtotal, getTotalItems } = useCartStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return null;

  const subtotal = getSubtotal();
  const totalItemCount = getTotalItems();

  // 1. CALCULATE TAXES
  const taxLines = taxes.map(tax => ({
    name: tax.name,
    amount: subtotal * (tax.rate_percent / 100)
  }));
  const totalTax = taxLines.reduce((sum, t) => sum + t.amount, 0);

  // 2. CALCULATE DELIVERY (Base + Bulk Surcharge)
  let deliveryFee = 0;
  let bulkSurcharge = 0;

  if (selectedZone) {
    deliveryFee = selectedZone.base_price;
    // Bulk Logic: If items > threshold, add surcharge for each extra item
    if (totalItemCount > settings.bulk_threshold) {
      const extraItems = totalItemCount - settings.bulk_threshold;
      bulkSurcharge = extraItems * settings.bulk_surcharge;
      deliveryFee += bulkSurcharge;
    }
  }

  // 3. FINAL TOTAL
  const grandTotal = subtotal + totalTax + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="bg-secondary-50 p-6 rounded-xl border border-secondary-200 text-center">
        <ShoppingBag className="mx-auto text-secondary-400 mb-2" size={32} />
        <p className="text-secondary-600">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="bg-secondary-50 p-6 rounded-xl border border-secondary-200 sticky top-24">
      <h3 className="font-display font-bold text-lg text-secondary-900 mb-4">Order Summary</h3>
      
      {/* Items List */}
      <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 scrollbar-custom">
        {items.map((item) => (
          <div key={item.variantId} className="flex gap-3 pt-2">
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 bg-white rounded-md border border-secondary-200 overflow-hidden">
                <Image src={item.image} alt={item.title} fill className="object-cover" />
              </div>
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-secondary-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-secondary-50 shadow-sm z-10">
                {item.quantity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-secondary-900 truncate">{item.title}</p>
              <p className="text-xs text-secondary-500">{item.variantName}</p>
            </div>
            <p className="text-sm font-semibold text-secondary-900">
              {formatCurrency(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      {/* Breakdowns */}
      <div className="space-y-3 border-t border-secondary-200 pt-4 text-sm text-secondary-600">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-medium text-secondary-900">{formatCurrency(subtotal)}</span> 
        </div>

        {/* Dynamic Taxes */}
        {taxLines.map(tax => (
          <div key={tax.name} className="flex justify-between">
            <span>{tax.name}</span>
            <span>{formatCurrency(tax.amount)}</span> 
          </div>
        ))}

        {/* Dynamic Delivery */}
        <div className="flex justify-between">
          <span>Delivery {bulkSurcharge > 0 && <span className="text-xs italic text-amber-600">(Includes Bulk Surcharge)</span>}</span>
          {selectedZone ? (
            <span className="font-medium text-secondary-900">{formatCurrency(deliveryFee)}</span>
          ) : (
            <span className="text-xs bg-secondary-200 px-2 py-0.5 rounded">Select Zone</span>
          )}
        </div>

        {/* Grand Total */}
        <div className="flex justify-between text-base font-bold text-secondary-900 border-t border-secondary-200 pt-3">
          <span>Total to Pay</span>
          <span>{formatCurrency(grandTotal)}</span> 
        </div>
      </div>
    </div>
  );
};

export default CheckoutSummary;