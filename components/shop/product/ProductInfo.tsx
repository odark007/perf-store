'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Minus, Plus, Check, AlertCircle, Star, Clock } from 'lucide-react';
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

  // 1. Get Cart State
  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);

  const selectedVariant = variants.find(v => v.id === selectedId) || variants[0];
  
  // 2. Data Check
  const masterStock = Number(selectedVariant?.master_stock) || 0;
  const currentVariantDeduction = Math.max(1, Number(selectedVariant?.stock_deduction) || 1);

  // 3. Price Calculation (Discount Logic)
  const { finalPrice, isOnSale, originalPrice } = getDiscountedPrice(
    selectedVariant.price,
    product
  );

  // 4. Calculate Cart Usage
  const liquidInCart = cartItems
    .filter(item => item.productId === product.id)
    .reduce((total, item) => {
      const itemDeduction = Math.max(1, Number(item.stockDeduction) || 1);
      return total + (item.quantity * itemDeduction);
    }, 0);

  // 5. Calculate Limits
  const remainingLiquid = Math.max(0, masterStock - liquidInCart);
  const maxAddable = Math.floor(remainingLiquid / currentVariantDeduction);

  const isOutOfStock = masterStock <= 0;
  const isCartLimitReached = maxAddable < 1;

  useEffect(() => {
    setQuantity(1);
  }, [selectedId]);

  // Track View Item
  useEffect(() => {
    // FIX: Use 'variants' prop instead of 'product.variants' to avoid TS undefined error
    const basePrice = variants[0]?.price || 0;
    
    sendGAEvent('view_item', {
      currency: 'GHS',
      value: product.discount_percent > 0
        ? basePrice * (1 - product.discount_percent / 100)
        : basePrice,
      items: [{
        item_id: product.id,
        item_name: product.title,
        item_category: product.category,
        item_brand: product.brand
      }]
    });
  }, [product, variants]); // Added variants to dependency array

  const handleAddToCart = () => {
    // 1. Validation
    if (isOutOfStock) return;
    if (quantity > maxAddable) {
      alert(`Limit reached! You can only add ${maxAddable} more of this item.`);
      return;
    }

    // 2. GA4 Track
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

    // 3. Add to Store
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

    setQuantity(1);
  };

  // Helper to format promo dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className="flex flex-col h-full justify-center">
      {/* Header */}
      <div className="mb-6">
        <div className="flex gap-2 mb-2">
          {product.brand && (
            <span className="text-xs font-bold text-primary-600 uppercase tracking-wide">
              {product.brand}
            </span>
          )}
          <span className="text-xs text-secondary-400">•</span>
          <span className="text-xs text-secondary-500 uppercase tracking-wide">
            {product.category}
          </span>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-display font-bold text-secondary-900 mb-4">
          {product.title}
        </h1>

        {/* PROMO BADGES ROW */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {isOnSale ? (
             <>
               <Badge className="bg-red-500 text-white border-red-600 font-bold shadow-sm inline-flex">
                 Limited Time Offer: {product.discount_percent}% OFF
               </Badge>
               
               {product.discount_end_at && (
                 <span className="text-xs font-medium text-red-700 bg-red-50 px-2 py-1 rounded-full border border-red-100 flex items-center gap-1">
                   <Clock size={12} />
                   {product.discount_start_at 
                     ? `${formatDate(product.discount_start_at)} - ${formatDate(product.discount_end_at)}` 
                     : `Ends ${formatDate(product.discount_end_at)}`
                   }
                 </span>
               )}
             </>
          ) : product.is_featured ? (
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 inline-flex gap-1">
              <Star size={14} fill="currentColor" /> Featured Selection
            </Badge>
          ) : null}
        </div>

        {/* Price Display */}
        <div className="flex items-end gap-4">
          <div className="flex flex-col">
             {isOnSale && (
               <span className="text-lg text-secondary-400 line-through font-medium mb-1">
                 {formatCurrency(originalPrice)}
               </span>
             )}
             <p className={`text-4xl font-bold ${isOnSale ? 'text-red-600' : 'text-secondary-900'}`}>
               {formatCurrency(finalPrice)}
             </p>
          </div>
          
          {isOutOfStock ? (
            <span className="text-red-600 font-medium flex items-center gap-1 mb-2 pb-1">
              <AlertCircle size={18} /> Out of Stock
            </span>
          ) : (
            <span className="text-green-600 font-medium flex items-center gap-1 mb-2 pb-1">
              <Check size={18} /> In Stock
            </span>
          )}
        </div>
      </div>

      {/* Selector */}
      <div className="mb-8">
        <p className="text-sm font-medium text-secondary-700 mb-2">Select Size / Pack:</p>
        <VariantSelector 
          variants={variants} 
          selectedId={selectedId} 
          onSelect={setSelectedId} 
        />
      </div>

      {/* Action Row */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* Quantity */}
        <div className="flex items-center border-2 border-secondary-200 rounded-xl w-full sm:w-auto bg-white">
          <button 
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            disabled={quantity <= 1 || isOutOfStock || isCartLimitReached}
            className="p-3 text-secondary-500 hover:text-primary-600 disabled:opacity-30"
          >
            <Minus size={20} />
          </button>
          <span className="w-12 text-center font-bold text-lg">{quantity}</span>
          <button 
            onClick={() => setQuantity(q => Math.min(maxAddable, q + 1))}
            disabled={quantity >= maxAddable || isOutOfStock || isCartLimitReached}
            className="p-3 text-secondary-500 hover:text-primary-600 disabled:opacity-30"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Add Button */}
        <Button 
          size="lg" 
          fullWidth 
          onClick={handleAddToCart}
          disabled={isOutOfStock || isCartLimitReached}
          className="h-14 text-lg shadow-lg shadow-primary-500/20"
          leftIcon={isCartLimitReached && !isOutOfStock ? undefined : <ShoppingCart className="mr-2" />}
        >
          {isOutOfStock 
            ? 'Sold Out' 
            : isCartLimitReached 
              ? 'Limit in Cart' 
              : 'Add to Cart'
          }
        </Button>
      </div>

      {/* Description */}
      <div className="prose prose-sm text-secondary-600 max-w-none border-t border-secondary-100 pt-6">
        <h3 className="text-lg font-bold text-secondary-900 mb-2">Product Description</h3>
        <p className="whitespace-pre-line leading-relaxed">
          {product.description || "No description available for this product."}
        </p>
      </div>
    </div>
  );
};

export default ProductInfo;