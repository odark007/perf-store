'use client';

import React, { useState } from 'react';
import ProductCard from '@/components/shop/ProductCard';
import ShopSidebar from '@/components/shop/filters/ShopSidebar';
import ShopToolbar from '@/components/shop/filters/ShopToolbar';

interface Props {
  categories: any[];
  brands: string[];
  concentrations: string[];
  scentFamilies: string[];
  products: any[];
}

const ShopLayoutClient: React.FC<Props> = ({
  categories,
  brands,
  concentrations,
  scentFamilies,
  products
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="container-custom py-8 md:py-12">
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">

        {/* Sidebar */}
        <div className="flex-shrink-0">
          <ShopSidebar
            categories={categories}
            brands={brands}
            concentrations={concentrations}
            scentFamilies={scentFamilies}
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
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 md:gap-8">
              {products.map((product) => {
                const uiVariants = product.variants.map((v: any) => ({
                  id: v.id,
                  name: v.name,
                  type: v.type,
                  price: v.price,
                  stock_deduction: v.stock_deduction || 1,
                  master_stock: v.inventory?.current_stock_level || 0
                }));

                return (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    slug={product.slug}
                    title={product.title}
                    image={product.base_image_url}
                    category={product.categories?.name || 'Fragrance'}
                    variants={uiVariants}
                    isFeatured={product.is_featured}
                    brand={product.brand}
                    concentration={product.concentration}
                    scent_family={product.scent_family}
                    discountPercent={product.discount_percent}
                    discountStart={product.discount_start_at}
                    discountEnd={product.discount_end_at}
                  />
                );
              })}
            </div>
          ) : (
            <div className="py-24 text-center bg-brand-cream/5 rounded-3xl border border-dashed border-brand-border">
              <h3 className="text-xl font-display font-medium text-brand-deep mb-2">No fragrances found</h3>
              <p className="text-brand-muted text-sm">Try adjusting your filters or search criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopLayoutClient;
