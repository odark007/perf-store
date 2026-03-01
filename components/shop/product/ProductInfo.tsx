'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Minus, Plus, Check, AlertCircle, Star, Clock, Droplets, Wind, Sparkles, Gift } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import VariantSelector from './VariantSelector';
import { useCartStore } from '@/lib/store';
import { formatCurrency, getDiscountedPrice } from '@/lib/utils';
import { Product } from '@/lib/types';
import { sendGAEvent } from '@/lib/analytics';

interface Props {
  product: Product;
  variants: any[];
}

const ProductInfo: React.FC<Props> = ({ product, variants }) => {
  const [selectedId, setSelectedId] = useState(variants[0]?.id || '');
  const [quantity, setQuantity] = useState(1);

  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const selectedVariant = variants.find(v => v.id === selectedId) || variants[0];
  const masterStock = Number(selectedVariant?.master_stock) || 0;
  const currentVariantDeduction = Math.max(1, Number(selectedVariant?.stock_deduction) || 1);

  const { finalPrice, isOnSale, originalPrice } = getDiscountedPrice(
    selectedVariant.price,
    product
  );

  const liquidInCart = cartItems
    .filter(item => item.productId === product.id)
    .reduce((total, item) => {
      const itemDeduction = Math.max(1, Number(item.stockDeduction) || 1);
      return total + (item.quantity * itemDeduction);
    }, 0);

  const remainingLiquid = Math.max(0, masterStock - liquidInCart);
  const maxAddable = Math.floor(remainingLiquid / currentVariantDeduction);

  const isOutOfStock = masterStock <= 0;
  const isCartLimitReached = maxAddable < 1;

  // Sync quantity with cart if item exists
  const existingItem = cartItems.find(item => item.variantId === selectedId);
  const displayQuantity = existingItem ? existingItem.quantity : quantity;

  useEffect(() => {
    setQuantity(1);
  }, [selectedId]);

  useEffect(() => {
    sendGAEvent('view_item', {
      currency: 'GHS',
      value: product.discount_percent > 0
        ? (variants[0]?.price || 0) * (1 - product.discount_percent / 100)
        : (variants[0]?.price || 0),
      items: [{
        item_id: product.id,
        item_name: product.title,
        item_category: product.category,
        item_brand: product.brand
      }]
    });
  }, [product, variants]);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    if (quantity > maxAddable) {
      alert(`Limit reached! You can only add ${maxAddable} more of this item.`);
      return;
    }

    sendGAEvent('add_to_cart', {
      currency: 'GHS',
      value: finalPrice * quantity,
      items: [{
        item_id: product.id,
        item_name: product.title,
        item_category: product.category,
        price: finalPrice,
        quantity: quantity,
        item_variant: selectedVariant.name
      }]
    });

    if (existingItem) {
      // If already in cart, increment by the selected amount (or just 1 if we want consistency with card)
      // The user wants "awareness", so most natural is that the button adds the current selector value
      updateQuantity(selectedId, existingItem.quantity + quantity);
    } else {
      addItem({
        variantId: selectedVariant.id,
        productId: product.id,
        title: product.title,
        variantName: selectedVariant.name,
        price: finalPrice,
        quantity: quantity,
        image: product.base_image_url,
        maxStock: 0,
        stockDeduction: currentVariantDeduction,
        masterStockTotal: masterStock
      });
    }

    setQuantity(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className="flex flex-col space-y-10">

      {/* 1. Header & Brand */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-3 items-center">
            {product.brand && (
              <span className="text-sm font-bold text-brand-gold uppercase tracking-[0.3em]">
                {product.brand}
              </span>
            )}
            <div className="w-1.5 h-1.5 rounded-full bg-brand-gold/20" />
            <span className="text-xs text-brand-muted uppercase tracking-widest">
              {product.concentration || 'Parfum'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-brand-gold">
            <Sparkles size={12} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Authentic</span>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-brand-deep leading-tight">
          {product.title}
        </h1>

        {/* Promo Row */}
        {(isOnSale || product.is_featured) && (
          <div className="flex flex-wrap items-center gap-3">
            {isOnSale && (
              <Badge className="bg-danger text-white border-transparent px-4 py-1 font-bold text-[10px] tracking-widest uppercase">
                {product.discount_percent}% LUXURY SALE
              </Badge>
            )}
            {product.is_featured && (
              <Badge className="bg-brand-gold text-brand-deep border-transparent px-4 py-1 font-bold text-[10px] tracking-widest uppercase">
                Maison's Pick
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* 2. Scent Identity (Olfactory Pyramid) */}
      {(product.scent_notes || product.scent_family) && (
        <div className="p-8 bg-white border border-brand-border rounded-3xl shadow-sm space-y-8">
          <div className="flex justify-between items-center border-b border-brand-border pb-4">
            <h3 className="font-display text-xl font-bold flex items-center gap-2 italic">
              Olfactive Journey
            </h3>
            {product.scent_family && (
              <span className="text-[10px] bg-brand-cream/50 px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-brand-border text-brand-muted">
                {product.scent_family} Famille
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold block">Top Notes</span>
              <p className="text-sm text-brand-deep font-medium leading-relaxed">
                {product.scent_notes?.top.join(', ') || 'Sparkling Citrus, Fresh Accords'}
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold block">Heart Notes</span>
              <p className="text-sm text-brand-deep font-medium leading-relaxed">
                {product.scent_notes?.heart.join(', ') || 'Floral Bloom, Spicy Echoes'}
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold block">Base Notes</span>
              <p className="text-sm text-brand-deep font-medium leading-relaxed">
                {product.scent_notes?.base.join(', ') || 'Velvet Musk, Sandalwood'}
              </p>
            </div>
          </div>

          {/* Performance Attributes */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-brand-cream/30 border border-brand-border/50">
              <Clock size={16} className="text-brand-gold" />
              <div>
                <span className="text-[8px] uppercase font-bold text-brand-muted block">Longevity</span>
                <span className="text-xs font-bold text-brand-deep uppercase">{product.longevity || '6-8 hrs'}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-brand-cream/30 border border-brand-border/50">
              <Wind size={16} className="text-brand-gold" />
              <div>
                <span className="text-[8px] uppercase font-bold text-brand-muted block">Sillage</span>
                <span className="text-xs font-bold text-brand-deep uppercase">{product.sillage || 'Strong'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Pricing & Scenography */}
      <div className="space-y-8">
        <div className="flex items-end gap-6 pb-2 border-b border-brand-border">
          <div className="flex flex-col">
            {isOnSale && (
              <span className="text-lg text-brand-muted line-through font-medium mb-1">
                {formatCurrency(originalPrice)}
              </span>
            )}
            <p className={`text-5xl font-display font-medium ${isOnSale ? 'text-danger' : 'text-brand-deep'}`}>
              {formatCurrency(finalPrice)}
            </p>
          </div>
          <div className="mb-2">
            {isOutOfStock ? (
              <Badge className="bg-danger/10 text-danger border-danger/20 flex items-center gap-1.5">
                <AlertCircle size={14} /> Unavailable
              </Badge>
            ) : (
              <Badge className="bg-success/10 text-success border-success/20 flex items-center gap-1.5">
                <Check size={14} /> At the Boutique
              </Badge>
            )}
          </div>
        </div>

        {/* Size Selector */}
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-deep">Select Presentation</p>
          <VariantSelector
            variants={variants}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        {/* Quantity & Action */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <div className="flex items-center border border-brand-border rounded-2xl overflow-hidden bg-white shadow-sm h-14 w-full max-w-[160px]">
            <button
              onClick={() => {
                if (existingItem) {
                  updateQuantity(selectedId, Math.max(1, existingItem.quantity - 1));
                } else {
                  setQuantity(q => Math.max(1, q - 1));
                }
              }}
              disabled={displayQuantity <= 1 || isOutOfStock || isCartLimitReached}
              className="flex-1 h-full flex items-center justify-center transition-colors hover:bg-brand-cream disabled:opacity-30"
              aria-label="Decrease quantity"
            >
              <Minus size={18} className="text-brand-deep" />
            </button>
            <span className="w-12 text-center font-bold text-lg text-brand-deep flex items-center justify-center h-full">{displayQuantity}</span>
            <button
              onClick={() => {
                if (existingItem) {
                  updateQuantity(selectedId, Math.min(maxAddable + existingItem.quantity, existingItem.quantity + 1));
                } else {
                  setQuantity(q => Math.min(maxAddable, q + 1));
                }
              }}
              disabled={displayQuantity >= (existingItem ? maxAddable + existingItem.quantity : maxAddable) || isOutOfStock || isCartLimitReached}
              className="flex-1 h-full flex items-center justify-center transition-colors hover:bg-brand-cream disabled:opacity-30"
              aria-label="Increase quantity"
            >
              <Plus size={18} className="text-brand-deep" />
            </button>
          </div>

          <Button
            size="xl"
            fullWidth
            onClick={handleAddToCart}
            disabled={isOutOfStock || isCartLimitReached}
            className={`h-14 font-bold uppercase tracking-widest text-xs transition-all duration-500 rounded-2xl border-none shadow-xl ${isOutOfStock || isCartLimitReached
              ? 'bg-brand-muted text-white cursor-not-allowed opacity-50'
              : 'bg-brand-deep text-white hover:bg-[#2d1554] shadow-brand-deep/20'
              }`}
            leftIcon={isCartLimitReached && !isOutOfStock ? undefined : <ShoppingCart className="mr-2" size={18} />}
          >
            {isOutOfStock
              ? 'Maison Restock Soon'
              : isCartLimitReached
                ? 'Maximum in Cart'
                : 'Acquire Scent'
            }
          </Button>
        </div>

        {/* Luxury Values */}
        <div className="grid grid-cols-2 gap-4 py-6 border-y border-brand-border">
          <div className="flex items-center gap-3 text-brand-muted">
            <Gift size={16} className="text-brand-gold" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Luxury Gift Wrap Available</span>
          </div>
          <div className="flex items-center gap-3 text-brand-muted">
            <Droplets size={16} className="text-brand-gold" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Meticulously Stored</span>
          </div>
        </div>
      </div>

      {/* 4. Description */}
      <div className="space-y-6 pt-6">
        <h3 className="font-display text-2xl font-bold text-brand-deep italic">The Story</h3>
        <p className="text-sm text-brand-muted leading-relaxed whitespace-pre-line font-medium border-l-2 border-brand-gold/20 pl-6 italic">
          {product.description || "No description available for this masterpiece."}
        </p>
      </div>

    </div>
  );
};

export default ProductInfo;
