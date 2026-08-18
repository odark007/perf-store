'use client';

import React from 'react';
import Link from 'next/link';
import SmartImage from '@/components/ui/SmartImage';
import { ShoppingCart, Heart, Sparkles, Check } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';

export interface ToyProductCardProps {
  id: string;
  slug: string;
  title: string;
  description?: string;
  image: string;
  category: string;
  price: number;
  compareAtPrice?: number | null;
  discountPercent?: number;
  ageRating?: string;
  tags?: string[];
  quantityAvailable?: number;
  variantId?: string;
  variantName?: string;
  storeSlug?: string;
}

const TAG_META: Record<string, { label: string; icon: string }> = {
  camera: { label: 'Camera', icon: '📷' },
  vr: { label: 'VR Ready', icon: '🕶️' },
  app: { label: 'App-Controlled', icon: '📶' },
  rechargeable: { label: 'Rechargeable', icon: '🔋' },
  ai: { label: 'AI-Powered', icon: '🤖' },
  voice: { label: 'Voice Control', icon: '🎙️' },
};

const ToyProductCard: React.FC<ToyProductCardProps> = ({
  id,
  slug,
  title,
  description,
  image,
  category,
  price,
  compareAtPrice,
  discountPercent = 0,
  ageRating = '6+',
  tags = [],
  quantityAvailable = 10,
  variantId,
  variantName = 'Single Unit',
  storeSlug = 'play-time'
}) => {
  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const toggleCart = useCartStore((state) => state.toggleCart);

  const effectiveVariantId = variantId || id;
  const isOutOfStock = quantityAvailable <= 0;
  const isLowStock = quantityAvailable > 0 && quantityAvailable <= 15;
  const stockLevel = isOutOfStock ? 'out' : isLowStock ? 'low' : 'in';
  const stockLabel = isOutOfStock ? 'Out of stock' : isLowStock ? `Only ${quantityAvailable} left` : 'In stock';

  // Calculate final discounted price
  let finalPrice = price;
  if (discountPercent > 0) {
    finalPrice = Math.round(price * (1 - discountPercent / 100) * 100) / 100;
  }
  const originalPrice = compareAtPrice || (discountPercent > 0 ? price : null);
  const isOnSale = discountPercent > 0 || (compareAtPrice != null && compareAtPrice > price);

  const existingItem = cartItems.find((i) => i.variantId === effectiveVariantId);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    if (existingItem) {
      updateQuantity(effectiveVariantId, existingItem.quantity + 1);
    } else {
      addItem({
        variantId: effectiveVariantId,
        productId: id,
        title: title,
        variantName: variantName,
        price: finalPrice,
        quantity: 1,
        image: image,
        stockDeduction: 1,
        masterStockTotal: quantityAvailable
      });
    }

    toggleCart();
  };

  const tagBadges = tags
    .slice(0, 3)
    .map((t) => TAG_META[t.toLowerCase()])
    .filter(Boolean);

  return (
    <div className="group bg-white rounded-[18px] border border-[#e2ddf7] p-4 sm:p-5 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_30px_-14px_rgba(104,87,232,0.35)] relative">
      {/* Product Image Wrapper */}
      <Link
        href={`/${storeSlug}/products/${slug}`}
        className="relative aspect-[1.15/1] rounded-[12px] bg-gradient-to-br from-[#ecebfa] to-white overflow-hidden flex items-center justify-center"
      >
        <SmartImage
          src={image || 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?q=80&w=600&auto=format&fit=crop'}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Sale Badge */}
        {isOnSale && (
          <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-white text-[11px] font-mono font-bold bg-[#ff8f66] shadow-sm z-10">
            SALE
          </span>
        )}

        {/* Quick Add overlay button */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`absolute bottom-3 right-3 w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
            isOutOfStock
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-[#ff8f66] text-white hover:bg-[#f2704a] hover:scale-110 active:scale-95'
          }`}
          title={isOutOfStock ? 'Out of stock' : 'Add to cart'}
          aria-label="Add to cart"
        >
          <ShoppingCart size={18} />
        </button>
      </Link>

      {/* Feature Tag Badges */}
      <div className="flex flex-wrap gap-1.5 min-h-[22px]">
        {tagBadges.map((tag) => (
          <span
            key={tag.label}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-[#ecebfa] text-[#5b5876]"
          >
            <span>{tag.icon}</span>
            <span>{tag.label}</span>
          </span>
        ))}
      </div>

      {/* Title & Description */}
      <div className="flex-1">
        <Link href={`/${storeSlug}/products/${slug}`}>
          <h3 className="text-base font-display font-bold text-[#23213d] line-clamp-1 group-hover:text-[#6857e8] transition-colors">
            {title}
          </h3>
        </Link>
        {description && (
          <p className="text-xs text-[#5b5876] line-clamp-2 mt-1 font-body">
            {description}
          </p>
        )}
      </div>

      {/* Price + Age Badge */}
      <div className="flex items-center justify-between pt-1 border-t border-[#ecebfa]">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold font-display text-[#23213d]">
            {formatCurrency(finalPrice)}
          </span>
          {originalPrice && originalPrice > finalPrice && (
            <span className="text-xs text-[#5b5876] line-through font-mono">
              {formatCurrency(originalPrice)}
            </span>
          )}
        </div>
        {ageRating && (
          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full border border-[#8c7ef6] text-[#6857e8]">
            {ageRating}
          </span>
        )}
      </div>

      {/* Stock Status Indicator */}
      <div className="flex items-center gap-1.5 text-xs text-[#5b5876] font-body">
        <span
          className={`w-2 h-2 rounded-full ${
            stockLevel === 'in' ? 'bg-[#4fd6ae]' : stockLevel === 'low' ? 'bg-[#ff8f66]' : 'bg-[#c9c5df]'
          }`}
        />
        <span>{stockLabel}</span>
      </div>
    </div>
  );
};

export default ToyProductCard;
