'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { sendGAEvent } from '@/lib/analytics';

const CartDrawer = () => {
  // FIX: Select items directly for reactivity
  const {
    items,
    isCartOpen,
    toggleCart,
    removeItem,
    updateQuantity
  } = useCartStore();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return null;

  // FIX: Calculate subtotal on the fly (Reactive)
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);

  // FIX: Helper to check if we can increment
  const canIncrement = (item: any) => {
    // 1. Calculate how much of this product is already in the cart (liquid total)
    // We filter by productId to find all variants of this drink (e.g., Single + Crate)
    const usageForProduct = items
      .filter(i => i.productId === item.productId)
      .reduce((sum, i) => sum + (i.quantity * i.stockDeduction), 0);

    // 2. Determine Remaining Liquid
    const masterLimit = item.masterStockTotal || 0;
    const remaining = masterLimit - usageForProduct;

    // 3. Check if we have enough room for ONE more of THIS variant
    // e.g., if remaining is 10, and this is a Crate (24), we can't add more.
    return remaining >= item.stockDeduction;
  };

  return (
    <>
      {/* Overlay */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[1030] backdrop-blur-sm transition-opacity"
          onClick={toggleCart}
        />
      )}

      {/* Drawer */}
      <div
        className={`
          fixed top-0 right-0 h-full w-full md:w-[450px] bg-white z-[1040] shadow-2xl transform transition-transform duration-300 ease-in-out
          ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-secondary-100">
            <h2 className="text-xl font-display font-bold text-secondary-900 flex items-center gap-2">
              <ShoppingBag className="text-primary-600" />
              Your Cart ({items.length})
            </h2>
            <button
              onClick={toggleCart}
              className="p-2 hover:bg-secondary-100 rounded-full transition-colors"
            >
              <X size={24} className="text-secondary-500" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center">
                  <ShoppingBag size={40} className="text-secondary-400" />
                </div>
                <div>
                  <p className="text-lg font-medium text-secondary-900">Your cart is empty</p>
                  <p className="text-secondary-500">Looks like you haven't added any drinks yet.</p>
                </div>
                <Button onClick={toggleCart} variant="outline">
                  Continue Shopping
                </Button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.variantId} className="flex gap-4">
                  {/* Image */}
                  <div className="relative w-20 h-20 bg-secondary-50 rounded-lg overflow-hidden flex-shrink-0 border border-secondary-100">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h4 className="font-medium text-secondary-900 line-clamp-1">{item.title}</h4>
                        <p className="text-xs text-secondary-500">{item.variantName}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.variantId)}
                        className="text-secondary-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3 border border-secondary-200 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="p-1 hover:bg-secondary-100 rounded disabled:opacity-50"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="p-1 hover:bg-secondary-100 rounded disabled:opacity-50"
                          disabled={!canIncrement(item)}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="font-bold text-secondary-900">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-6 border-t border-secondary-100 bg-secondary-50">
              <div className="flex justify-between items-center mb-4">
                <span className="text-secondary-600">Subtotal</span>
                <span className="text-xl font-bold text-secondary-900">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <p className="text-xs text-secondary-500 mb-4 text-center">
                Shipping & Taxes calculated at checkout
              </p>
              <Link
                href="/checkout"
                onClick={() => {
                  toggleCart();
                  // GA4 Track
                  sendGAEvent('begin_checkout', {
                    currency: 'GHS',
                    value: subtotal,
                    items: items.map(i => ({
                      item_id: i.productId,
                      item_name: i.title,
                      price: i.price,
                      quantity: i.quantity,
                      item_variant: i.variantName
                    }))
                  });
                }}
              >
                <Button fullWidth size="lg">
                  Proceed to Checkout
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;