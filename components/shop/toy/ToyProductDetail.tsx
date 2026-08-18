'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import SmartImage from '@/components/ui/SmartImage';
import {
  ShoppingCart,
  Minus,
  Plus,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Battery,
  Smartphone,
  Sparkles,
  Check,
  Package
} from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import ToyProductCard from './ToyProductCard';

interface ToyProductDetailProps {
  product: any;
  allRcProducts?: any[];
  relatedProducts?: any[];
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

const ToyProductDetail: React.FC<ToyProductDetailProps> = ({
  product,
  allRcProducts = [],
  relatedProducts = [],
  storeSlug = 'play-time'
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'shipping' | 'compare'>('overview');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const toggleCart = useCartStore((state) => state.toggleCart);

  // Variant & Stock logic
  const primaryVariant = product.variants?.[0] || {
    id: product.id,
    name: 'Single Unit',
    price: product.price || 79.99,
    sku: product.mfr_part || 'RC-01',
    inventory: { current_stock_level: 100 }
  };

  const masterStock = primaryVariant.inventory?.current_stock_level ?? 50;
  const isOutOfStock = masterStock <= 0;
  const isLowStock = masterStock > 0 && masterStock <= 15;
  const stockLevel = isOutOfStock ? 'out' : isLowStock ? 'low' : 'in';
  const stockLabel = isOutOfStock
    ? 'Out of stock'
    : isLowStock
    ? `Only ${masterStock} left in stock`
    : 'In stock — ready to ship';

  const price = Number(primaryVariant.price) || 0;
  const discountPercent = product.discount_percent || 0;
  const finalPrice = discountPercent > 0 ? Math.round(price * (1 - discountPercent / 100) * 100) / 100 : price;
  const compareAtPrice = product.compare_at_price ? Number(product.compare_at_price) : null;

  // Gallery array
  const galleryImages: string[] = [
    product.base_image_url,
    ...(Array.isArray(product.gallery) ? product.gallery : [])
  ].filter(Boolean);

  const currentImage = galleryImages[activeImageIndex] || product.base_image_url;

  // Shipping specs
  const shipping = product.shipping_info || {
    unitDimensionsCm: { l: 30, w: 18, h: 16 },
    netWeightKg: 1.0,
    cartonQty: 2,
    cartonDimensionsCm: { l: 65, w: 38, h: 35 },
    grossWeightKg: 2.8,
    packaging: 'Sealed Box'
  };

  // Tech Specs
  const specs: Record<string, string> = product.specs || {};

  const existingItem = cartItems.find((i) => i.variantId === primaryVariant.id);

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    if (existingItem) {
      updateQuantity(primaryVariant.id, existingItem.quantity + quantity);
    } else {
      addItem({
        variantId: primaryVariant.id,
        productId: product.id,
        title: product.title,
        variantName: primaryVariant.name || 'Standard Unit',
        price: finalPrice,
        quantity: quantity,
        image: product.base_image_url,
        stockDeduction: 1,
        masterStockTotal: masterStock
      });
    }

    toggleCart();
  };

  const tagBadges = (product.tags || [])
    .map((t: string) => TAG_META[t.toLowerCase()])
    .filter(Boolean);

  const isRcCategory = product.category === 'RC Vehicles' || (product.tags || []).includes('rc');

  return (
    <div className="bg-[#f5f3fc] min-h-screen py-8 md:py-14">
      <div className="container-custom">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href={`/${storeSlug}/shop?category=${encodeURIComponent(product.category || '')}`}
            className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#5b5876] hover:text-[#6857e8] transition-colors"
          >
            <ArrowLeft size={14} /> Back to {product.category || 'All Toys'}
          </Link>
        </div>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* Left Column: Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-[24px] bg-white border border-[#e2ddf7] overflow-hidden shadow-sm">
              <SmartImage
                src={currentImage}
                alt={product.title}
                fill
                className="object-cover"
                priority
              />
              {discountPercent > 0 && (
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-white text-xs font-mono font-bold bg-[#ff8f66] shadow-sm">
                  -{discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {galleryImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl bg-white border-2 overflow-hidden shrink-0 transition-all ${
                      activeImageIndex === idx ? 'border-[#8c7ef6] shadow-sm scale-105' : 'border-[#e2ddf7] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <SmartImage src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Buy Box & Product Info */}
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#6857e8] font-semibold mb-2">
                <span className="w-2 h-2 rounded-full bg-[#ff8f66] shadow-[0_0_0_3px_rgba(255,143,102,0.2)]" />
                {product.category || 'Toy'}
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-[#23213d] tracking-tight">
                {product.title}
              </h1>
            </div>

            {/* Price Row */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-display font-bold text-[#23213d]">
                {formatCurrency(finalPrice)}
              </span>
              {compareAtPrice && compareAtPrice > finalPrice && (
                <span className="text-lg text-[#5b5876] line-through font-mono">
                  {formatCurrency(compareAtPrice)}
                </span>
              )}
            </div>

            {/* Quick Spec Badges */}
            <div className="flex flex-wrap gap-2">
              {tagBadges.map((tag: any) => (
                <span
                  key={tag.label}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono bg-white border border-[#e2ddf7] text-[#5b5876]"
                >
                  <span>{tag.icon}</span>
                  <span>{tag.label}</span>
                </span>
              ))}
              {product.age_rating && (
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full border border-[#8c7ef6] text-[#6857e8] bg-white">
                  Ages {product.age_rating}
                </span>
              )}
            </div>

            {/* Buy Box Actions */}
            <div className="bg-white rounded-2xl border border-[#e2ddf7] p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-4">
                {/* Quantity selector */}
                <div className="flex items-center border border-[#e2ddf7] rounded-full h-11 px-3 bg-[#f5f3fc]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[#23213d] hover:bg-white disabled:opacity-30"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-[#23213d] font-mono">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(masterStock, quantity + 1))}
                    disabled={quantity >= masterStock || isOutOfStock}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[#23213d] hover:bg-white disabled:opacity-30"
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="flex-1 py-3 px-6 rounded-full bg-[#ff8f66] hover:bg-[#f2704a] text-white font-bold text-sm shadow-[0_10px_24px_-10px_rgba(242,112,74,0.6)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={18} />
                  <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
                </button>
              </div>

              {/* SKU & Stock Row */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-[#ecebfa]">
                <span className="font-mono text-[#5b5876]">
                  SKU: <strong className="text-[#23213d]">{primaryVariant.sku || product.mfr_part || 'TY-01'}</strong>
                </span>
                <span className="inline-flex items-center gap-1.5 font-body">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      stockLevel === 'in' ? 'bg-[#4fd6ae]' : stockLevel === 'low' ? 'bg-[#ff8f66]' : 'bg-[#c9c5df]'
                    }`}
                  />
                  <span className="text-[#5b5876]">{stockLabel}</span>
                </span>
              </div>
            </div>

            {/* Highlights Trust Strip */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-[#e2ddf7] text-xs font-body text-[#23213d]">
                <ShieldCheck size={18} className="text-[#4fd6ae] shrink-0" />
                <span>ASTM Safety Certified</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-[#e2ddf7] text-xs font-body text-[#23213d]">
                <Truck size={18} className="text-[#ff8f66] shrink-0" />
                <span>Same-day Accra Dispatch</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Specs, Shipping & Comparison Panels */}
        <div className="mt-16 bg-white rounded-3xl border border-[#e2ddf7] p-6 sm:p-10 shadow-sm">
          {/* Tab Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-4 border-b border-[#ecebfa] mb-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm font-body transition-all shrink-0 ${
                activeTab === 'overview' ? 'bg-[#8c7ef6] text-white shadow-sm' : 'text-[#5b5876] hover:bg-[#f5f3fc]'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm font-body transition-all shrink-0 ${
                activeTab === 'specs' ? 'bg-[#8c7ef6] text-white shadow-sm' : 'text-[#5b5876] hover:bg-[#f5f3fc]'
              }`}
            >
              Specs
            </button>
            <button
              onClick={() => setActiveTab('shipping')}
              className={`px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm font-body transition-all shrink-0 ${
                activeTab === 'shipping' ? 'bg-[#8c7ef6] text-white shadow-sm' : 'text-[#5b5876] hover:bg-[#f5f3fc]'
              }`}
            >
              Shipping & Box
            </button>
            {isRcCategory && allRcProducts.length > 0 && (
              <button
                onClick={() => setActiveTab('compare')}
                className={`px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm font-body transition-all shrink-0 ${
                  activeTab === 'compare' ? 'bg-[#8c7ef6] text-white shadow-sm' : 'text-[#5b5876] hover:bg-[#f5f3fc]'
                }`}
              >
                Compare RC Cars
              </button>
            )}
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-3xl animate-fade-in">
              <p className="text-base text-[#5b5876] leading-relaxed font-body">
                {product.description}
              </p>
              {Object.keys(specs).length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="font-bold text-sm text-[#23213d] font-display">Key Highlights:</h4>
                  <ul className="space-y-2 list-disc list-inside text-sm text-[#5b5876] font-body">
                    {Object.entries(specs).slice(0, 4).map(([k, v]) => (
                      <li key={k}>
                        <strong className="text-[#23213d]">{k}:</strong> {v}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Specs Table */}
          {activeTab === 'specs' && (
            <div className="overflow-x-auto max-w-3xl animate-fade-in">
              <table className="w-full text-left text-sm font-body">
                <tbody className="divide-y divide-[#ecebfa]">
                  {Object.entries(specs).map(([key, val]) => (
                    <tr key={key} className="hover:bg-[#f5f3fc]/50">
                      <td className="py-3.5 pr-4 font-mono text-xs text-[#5b5876] w-1/3">{key}</td>
                      <td className="py-3.5 pl-4 font-semibold text-[#23213d]">{val}</td>
                    </tr>
                  ))}
                  {product.age_rating && (
                    <tr className="hover:bg-[#f5f3fc]/50">
                      <td className="py-3.5 pr-4 font-mono text-xs text-[#5b5876] w-1/3">Recommended Age</td>
                      <td className="py-3.5 pl-4 font-semibold text-[#23213d]">{product.age_rating} years and up</td>
                    </tr>
                  )}
                  {product.mfr_part && (
                    <tr className="hover:bg-[#f5f3fc]/50">
                      <td className="py-3.5 pr-4 font-mono text-xs text-[#5b5876] w-1/3">Manufacturer Part #</td>
                      <td className="py-3.5 pl-4 font-mono text-xs font-semibold text-[#6857e8]">{product.mfr_part}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 3: Shipping & Box Dimensions */}
          {activeTab === 'shipping' && (
            <div className="overflow-x-auto max-w-3xl animate-fade-in space-y-4">
              <p className="text-xs text-[#5b5876] font-body">
                Exact measurements from our logistics sheet for transparent freight & parcel rates:
              </p>
              <table className="w-full text-left text-sm font-body">
                <tbody className="divide-y divide-[#ecebfa]">
                  <tr className="hover:bg-[#f5f3fc]/50">
                    <td className="py-3.5 pr-4 font-mono text-xs text-[#5b5876] w-2/5">Unit Dimensions (L × W × H)</td>
                    <td className="py-3.5 pl-4 font-mono text-xs font-semibold text-[#23213d]">
                      {shipping.unitDimensionsCm?.l ?? '—'} × {shipping.unitDimensionsCm?.w ?? '—'} × {shipping.unitDimensionsCm?.h ?? '—'} cm
                    </td>
                  </tr>
                  <tr className="hover:bg-[#f5f3fc]/50">
                    <td className="py-3.5 pr-4 font-mono text-xs text-[#5b5876]">Single Unit Net Weight (N.W.)</td>
                    <td className="py-3.5 pl-4 font-mono text-xs font-semibold text-[#23213d]">
                      {shipping.netWeightKg ?? '—'} kg
                    </td>
                  </tr>
                  <tr className="hover:bg-[#f5f3fc]/50">
                    <td className="py-3.5 pr-4 font-mono text-xs text-[#5b5876]">Master Carton QTY & Type</td>
                    <td className="py-3.5 pl-4 font-semibold text-[#23213d]">
                      {shipping.cartonQty ?? '2'} pcs ({shipping.packaging ?? 'Sealed Box'})
                    </td>
                  </tr>
                  <tr className="hover:bg-[#f5f3fc]/50">
                    <td className="py-3.5 pr-4 font-mono text-xs text-[#5b5876]">Carton Dimensions</td>
                    <td className="py-3.5 pl-4 font-mono text-xs font-semibold text-[#23213d]">
                      {shipping.cartonDimensionsCm?.l ?? '—'} × {shipping.cartonDimensionsCm?.w ?? '—'} × {shipping.cartonDimensionsCm?.h ?? '—'} cm
                    </td>
                  </tr>
                  <tr className="hover:bg-[#f5f3fc]/50">
                    <td className="py-3.5 pr-4 font-mono text-xs text-[#5b5876]">Carton Gross Weight (G.W.)</td>
                    <td className="py-3.5 pl-4 font-mono text-xs font-semibold text-[#23213d]">
                      {shipping.grossWeightKg ?? '—'} kg
                    </td>
                  </tr>
                  <tr className="hover:bg-[#f5f3fc]/50">
                    <td className="py-3.5 pr-4 font-mono text-xs text-[#5b5876]">Mfr Part Number</td>
                    <td className="py-3.5 pl-4 font-mono text-xs font-semibold text-[#6857e8]">
                      {product.mfr_part || 'TY-STD'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 4: Compare RC Cars */}
          {activeTab === 'compare' && isRcCategory && (
            <div className="overflow-x-auto animate-fade-in">
              <table className="w-full text-left text-sm border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-[#e2ddf7] text-[#5b5876] font-mono text-xs uppercase tracking-wider">
                    <th className="pb-3 pr-4 font-semibold">Model</th>
                    <th className="pb-3 px-4 font-semibold">Price</th>
                    <th className="pb-3 px-4 font-semibold">Battery Life</th>
                    <th className="pb-3 px-4 font-semibold">Camera</th>
                    <th className="pb-3 px-4 font-semibold">Top Speed</th>
                    <th className="pb-3 pl-4 font-semibold">App Required</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ecebfa]">
                  {allRcProducts.map((p) => {
                    const isCurrent = p.id === product.id;
                    const pSpecs = p.specs || {};
                    const pPrice = p.variants?.[0]?.price || p.price;
                    return (
                      <tr
                        key={p.id}
                        className={isCurrent ? 'bg-[#e3faf3] font-semibold text-[#23213d]' : 'hover:bg-[#f5f3fc]/50'}
                      >
                        <td className="py-3.5 pr-4 font-body">
                          {p.title} {isCurrent && <span className="text-[#4fd6ae] font-mono text-xs">(this one)</span>}
                        </td>
                        <td className="py-3.5 px-4 font-display font-bold">{formatCurrency(Number(pPrice))}</td>
                        <td className="py-3.5 px-4 font-body">{pSpecs['Battery Life'] || '—'}</td>
                        <td className="py-3.5 px-4 font-body">{pSpecs['Camera'] || '—'}</td>
                        <td className="py-3.5 px-4 font-body">{pSpecs['Top Speed'] || '—'}</td>
                        <td className="py-3.5 pl-4 font-body">{pSpecs['Companion App'] || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Related Toys Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <div className="mb-8">
              <span className="text-xs font-mono uppercase tracking-widest text-[#6857e8] font-semibold">
                More to Explore
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#23213d] mt-1">
                You Might Also Like
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (
                <ToyProductCard
                  key={rel.id}
                  id={rel.id}
                  slug={rel.slug}
                  title={rel.title}
                  description={rel.description}
                  image={rel.base_image_url}
                  category={rel.category}
                  price={Number(rel.variants?.[0]?.price) || 0}
                  compareAtPrice={rel.compare_at_price ? Number(rel.compare_at_price) : null}
                  discountPercent={rel.discount_percent || 0}
                  ageRating={rel.age_rating || '6+'}
                  tags={rel.tags || []}
                  quantityAvailable={rel.variants?.[0]?.inventory?.current_stock_level ?? 10}
                  variantId={rel.variants?.[0]?.id}
                  variantName={rel.variants?.[0]?.name}
                  storeSlug={storeSlug}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToyProductDetail;
