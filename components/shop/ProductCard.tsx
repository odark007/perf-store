'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import SmartImage from '@/components/ui/SmartImage';
import { ShoppingCart, Heart, Sparkles, Minus, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useCartStore } from '@/lib/store';
import { formatCurrency, getDiscountedPrice } from '@/lib/utils';

// Interface for Variants passed from parent
export interface UIProductVariant {
  id: string;
  name: string;
  type: 'single' | 'pack' | 'crate';
  price: number;
  stock_deduction: number;
  master_stock: number;
}

export interface ProductCardProps {
  id: string;
  slug: string;
  title: string;
  image: string;
  category: string;
  variants: UIProductVariant[];
  isFeatured?: boolean;
  brand?: string;
  concentration?: string;
  scent_family?: string;
  // NEW: Discount Props
  discountPercent?: number;
  discountStart?: string | null;
  discountEnd?: string | null;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  slug,
  title,
  image,
  category,
  variants,
  isFeatured = false,
  brand = 'Luxury Fragrance',
  concentration = 'Eau de Parfum',
  scent_family = 'Floral',
  discountPercent = 0,
  discountStart,
  discountEnd
}) => {
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id || '');
  const [isHovered, setIsHovered] = useState(false);
  const [localQuantity, setLocalQuantity] = useState(1);
  const params = useParams();
  const storeSlug = (params?.store as string) || 'derme';

  // 1. Get Cart
  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const toggleCart = useCartStore((state) => state.toggleCart);

  const selectedVariant = variants.find(v => v.id === selectedVariantId) || variants[0];

  // 2. Calculate Price (Discount Logic)
  const { finalPrice, isOnSale, originalPrice } = getDiscountedPrice(
    selectedVariant.price,
    {
      is_featured: isFeatured,
      discount_percent: discountPercent,
      discount_start_at: discountStart,
      discount_end_at: discountEnd
    }
  );

  // 3. Data Check (Stock)
  const masterStock = selectedVariant?.master_stock || 0;
  const currentVariantDeduction = selectedVariant?.stock_deduction || 1;

  // 4. Calculate Cart Usage (Pool Logic)
  const liquidInCart = cartItems
    .filter(item => item.productId === id)
    .reduce((total, item) => {
      const itemDeduction = Number(item.stockDeduction) || 0;
      return total + (item.quantity * itemDeduction);
    }, 0);

  // 5. Calculate Limits
  const remainingLiquid = Math.max(0, masterStock - liquidInCart);
  const maxAddable = Math.floor(remainingLiquid / currentVariantDeduction);

  const isOutOfStock = masterStock <= 0;
  const isCartLimitReached = maxAddable < 1;

  // 6. Find existing item to sync quantity
  const existingItem = cartItems.find(item => item.variantId === selectedVariantId);
  const displayQuantity = existingItem ? existingItem.quantity : localQuantity;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock || isCartLimitReached) return;

    if (existingItem) {
      // If already in cart, just increment by 1 (maintains "clicking cart icon to increase" approach)
      updateQuantity(selectedVariantId, existingItem.quantity + 1);
    } else {
      // If not in cart, add the selected local quantity
      addItem({
        variantId: selectedVariantId,
        productId: id,
        title: title,
        variantName: selectedVariant.name,
        price: finalPrice,
        quantity: localQuantity,
        image: image,
        stockDeduction: currentVariantDeduction,
        masterStockTotal: masterStock
      });
      setLocalQuantity(1); // Reset local state after adding
    }

    toggleCart();
  };

  return (
    <div
      className="group bg-white rounded-2xl border border-brand-border overflow-hidden hover:shadow-2xl hover:shadow-brand-mid/5 transition-all duration-500 flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/${storeSlug}/products/${slug}`} className="block relative aspect-[4/5] overflow-hidden bg-brand-cream/30">
        <SmartImage
          src={image || 'https://placehold.co/600x800/png?text=No+Image'}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Hover Overlay Actions */}
        <div className={`absolute inset-0 bg-brand-deep/20 backdrop-blur-[2px] flex items-center justify-center gap-3 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-brand-deep hover:bg-brand-gold hover:text-white transition-all shadow-xl"
            title="Add to Wishlist"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          >
            <Heart size={18} />
          </button>
          <button
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xl ${isOutOfStock || isCartLimitReached
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-brand-gold text-brand-deep hover:scale-110 active:scale-95'
              }`}
            onClick={handleAddToCart}
            disabled={isOutOfStock || isCartLimitReached}
            title={isOutOfStock ? 'Out of Stock' : isCartLimitReached ? 'Limit reached' : 'Quick Add'}
          >
            <ShoppingCart size={20} />
          </button>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isFeatured && (
            <div className="bg-brand-gold text-brand-deep text-[10px] font-bold px-2 py-1 rounded shadow-lg uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={10} fill="currentColor" /> Featured
            </div>
          )}
          {isOnSale && (
            <div className="bg-danger text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg uppercase tracking-wider">
              -{discountPercent}% OFF
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 md:p-5 flex flex-col flex-1 space-y-3">
        {/* Brand & Scent Family */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-brand-gold truncate">
            {brand}
          </span>
          <span className="text-[9px] md:text-[10px] font-medium uppercase text-brand-muted shrink-0 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-light/30" />
            {scent_family}
          </span>
        </div>

        {/* Title */}
        <div className="flex-1">
          <Link href={`/${storeSlug}/products/${slug}`}>
            <h3 className="text-sm md:text-base font-display font-semibold text-brand-deep line-clamp-1 group-hover:text-brand-gold transition-colors">
              {title}
            </h3>
            <p className="text-[10px] md:text-xs text-brand-muted mt-1">
              {concentration}
            </p>
          </Link>
        </div>

        {/* Size Pill Selector */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {variants.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVariantId(v.id)}
              className={`px-2 py-1 text-[9px] md:text-[10px] font-bold rounded-full border transition-all ${selectedVariantId === v.id
                ? 'bg-brand-deep border-brand-deep text-white shadow-md shadow-brand-deep/20'
                : 'bg-white border-brand-border text-brand-muted hover:border-brand-gold hover:text-brand-gold'
                }`}
            >
              {v.name}
            </button>
          ))}
        </div>

        {/* Quantity Selector */}
        {!isOutOfStock && !isCartLimitReached && (
          <div className="flex items-center gap-3 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-muted shrink-0">Quantity</span>
            <div className="flex items-center border border-brand-border rounded-lg overflow-hidden bg-brand-cream/5 h-8 w-28">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (existingItem) {
                    updateQuantity(selectedVariantId, Math.max(1, existingItem.quantity - 1));
                  } else {
                    setLocalQuantity(q => Math.max(1, q - 1));
                  }
                }}
                disabled={displayQuantity <= 1}
                className="flex-1 h-full flex items-center justify-center hover:bg-white transition-colors border-r border-brand-border disabled:opacity-30"
                aria-label="Decrease quantity"
              >
                <Minus size={12} className="text-brand-deep" />
              </button>
              <span className="flex-1 text-center text-xs font-bold text-brand-deep">{displayQuantity}</span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (existingItem) {
                    updateQuantity(selectedVariantId, Math.min(maxAddable + existingItem.quantity, existingItem.quantity + 1));
                  } else {
                    setLocalQuantity(q => Math.min(maxAddable, q + 1));
                  }
                }}
                disabled={displayQuantity >= (existingItem ? maxAddable + existingItem.quantity : maxAddable) || isCartLimitReached}
                className="flex-1 h-full flex items-center justify-center hover:bg-white transition-colors border-l border-brand-border disabled:opacity-30"
                aria-label="Increase quantity"
              >
                <Plus size={12} className="text-brand-deep" />
              </button>
            </div>
          </div>
        )}

        {/* Price Section */}
        <div className="pt-2 flex items-center justify-between gap-2 border-t border-brand-border/50">
          <div className="flex items-baseline gap-2">
            <span className={`text-base md:text-lg font-bold ${isOnSale ? 'text-danger' : 'text-brand-deep'}`}>
              {formatCurrency(finalPrice)}
            </span>
            {isOnSale && (
              <span className="text-xs text-brand-muted line-through font-medium">
                {formatCurrency(originalPrice)}
              </span>
            )}
          </div>

          {isOutOfStock ? (
            <span className="text-[10px] font-bold text-danger uppercase tracking-wider">Out of Stock</span>
          ) : isCartLimitReached ? (
            <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">In Cart</span>
          ) : (
            <span className="text-[10px] font-bold text-success uppercase tracking-wider animate-pulse-subtle">Available</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
