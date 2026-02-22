'use client';

import React, { useState } from 'react';
import ProductCard from '@/components/shop/ProductCard';
import ShopSidebar from '@/components/shop/filters/ShopSidebar';
import ShopToolbar from '@/components/shop/filters/ShopToolbar';

interface Props {
  categories: any[];
  brands: string[];
  products: any[];
}

const ShopLayoutClient: React.FC<Props> = ({ categories, brands, products }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="container-custom py-8 md:py-12">
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">

        {/* Sidebar */}
        <div className="flex-shrink-0">
          <ShopSidebar
            categories={categories}
            brands={brands}
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <ShopToolbar
            totalProducts={products.length}
            onOpenMobileFilters={() => setIsFilterOpen(true)}
          />

          {/* Product Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6">
              {products.map((product) => {

                // --- FIX: MAPPING LOGIC ---
                // We map the raw DB variants to the UI format.
                // We MUST include stock_deduction and inventory here.
                const uiVariants = product.variants.map((v: any) => ({
                  id: v.id,
                  name: v.name,
                  type: v.type,
                  price: v.price,

                  // FLATTENING THE DATA HERE
                  stock_deduction: v.stock_deduction || 1, // Default to 1 if missing
                  master_stock: v.inventory?.current_stock_level || 0 // Extract the number directly
                }));
                // -------------------------

                return (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    slug={product.slug}
                    title={product.title}
                    image={product.base_image_url}
                    category={product.category}
                    variants={uiVariants} // Passing the fixed variants
                    isFeatured={product.is_featured}
                    discountPercent={product.discount_percent}
                    discountStart={product.discount_start_at}
                    discountEnd={product.discount_end_at}
                  />
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center bg-secondary-50 rounded-xl border border-dashed border-secondary-200">
              <h3 className="text-lg font-bold text-secondary-900 mb-2">No products found</h3>
              <p className="text-secondary-500">Try adjusting your filters or search criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopLayoutClient;