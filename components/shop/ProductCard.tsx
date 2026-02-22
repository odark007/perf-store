'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SmartImage from '@/components/ui/SmartImage';
import { ShoppingCart, Minus, Plus, Star } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useCartStore } from '@/lib/store';
import { formatCurrency, getDiscountedPrice } from '@/lib/utils'; // Added getDiscountedPrice

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
  discountPercent = 0,
  discountStart,
  discountEnd
}) => {
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id || '');
  const [isHovered, setIsHovered] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // 1. Get Cart
  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);

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

  useEffect(() => {
    setQuantity(1);
  }, [selectedVariantId]);

  const getBadgeVariant = (type: string) => {
    if (type === 'single') return 'single';
    if (type === 'pack') return 'pack';
    if (type === 'crate') return 'crate';
    return 'primary';
  };

  const handleIncrement = () => {
    setQuantity(prev => {
      const next = prev + 1;
      if (next > maxAddable) return prev;
      return next;
    });
  };

  const handleDecrement = () => {
    setQuantity(prev => Math.max(prev - 1, 1));
  };

  const handleAddToCart = () => {
    if (isOutOfStock || quantity > maxAddable) {
      return;
    }

    addItem({
      variantId: selectedVariantId,
      productId: id,
      title: title,
      variantName: selectedVariant.name,
      price: finalPrice, // <--- Send Discounted Price to Cart
      quantity: quantity,
      image: image,
      stockDeduction: currentVariantDeduction,
      masterStockTotal: masterStock
    });

    setQuantity(1);
  };

  return (
    <div
      className="group card card-hover relative overflow-hidden flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${slug}`} className="block relative">
        <div className="relative aspect-[3/4] bg-secondary-100 overflow-hidden rounded-t-xl">
          <SmartImage
            src={image || 'https://placehold.co/600x800/png?text=No+Image'}
            alt={title}
            fill
            className={`object-cover transition-all duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
          />

          <div className="absolute top-3 left-3 flex flex-col gap-2 items-start">
            <Badge variant={getBadgeVariant(selectedVariant?.type || 'single')} size="sm">
              {selectedVariant?.name}
            </Badge>

            {/* Discount Badge (Prioritized over generic Featured star) */}
            {isOnSale ? (
              <Badge className="bg-red-500 text-white border-red-600 font-bold shadow-sm" size="sm">
                -{discountPercent}%
              </Badge>
            ) : isFeatured ? (
              <Badge className="bg-yellow-400 text-yellow-900 border-yellow-500 font-bold flex items-center gap-1 shadow-sm" size="sm">
                <Star size={10} fill="currentColor" /> Special
              </Badge>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-secondary-500 uppercase tracking-wider mb-1">{category}</p>
        <Link href={`/products/${slug}`}>
          <h3 className="text-base font-semibold text-secondary-900 line-clamp-2 mb-2">{title}</h3>
        </Link>

        <div className="mt-auto">
          {variants.length > 1 && (
            <div className="mb-4">
              <select
                value={selectedVariantId}
                onChange={(e) => setSelectedVariantId(e.target.value)}
                title="Select product variant"
                className="w-full px-3 py-2 text-sm bg-secondary-50 border border-secondary-200 rounded-lg outline-none cursor-pointer focus:border-primary-500 transition-colors"
              >
                {variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.name} - {formatCurrency(variant.price)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-wrap items-end justify-between gap-2 mb-4">
            <div className="flex flex-col">
              {/* Show Strikethrough if on sale */}
              {isOnSale && (
                <span className="text-xs text-secondary-400 line-through font-medium">
                  {formatCurrency(originalPrice)}
                </span>
              )}
              <span className={`text-xl font-bold ${isOnSale ? 'text-red-600' : 'text-secondary-900'}`}>
                {formatCurrency(finalPrice)}
              </span>
            </div>

            <div className="flex items-center border border-secondary-200 rounded-lg bg-white h-9">
              <button
                onClick={(e) => { e.preventDefault(); handleDecrement(); }}
                title="Decrease quantity"
                className="p-1.5 h-full flex items-center justify-center text-secondary-500 hover:text-primary-600 hover:bg-secondary-50 rounded-l-lg transition-colors disabled:opacity-30"
                disabled={quantity <= 1 || isOutOfStock || isCartLimitReached}
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center text-sm font-medium text-secondary-900 leading-none">
                {quantity}
              </span>
              <button
                onClick={(e) => { e.preventDefault(); handleIncrement(); }}
                title="Increase quantity"
                className="p-1.5 h-full flex items-center justify-center text-secondary-500 hover:text-primary-600 hover:bg-secondary-50 rounded-r-lg transition-colors disabled:opacity-30"
                disabled={quantity >= maxAddable || isOutOfStock || isCartLimitReached}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <Button
            onClick={handleAddToCart}
            variant="primary"
            size="md"
            fullWidth
            leftIcon={isCartLimitReached && !isOutOfStock ? undefined : <ShoppingCart size={18} />}
            disabled={isOutOfStock || isCartLimitReached}
          >
            {isOutOfStock
              ? 'Out of Stock'
              : isCartLimitReached
                ? 'Limit in Cart'
                : 'Add to Cart'
            }
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;