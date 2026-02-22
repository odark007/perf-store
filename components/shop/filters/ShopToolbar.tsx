'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, SlidersHorizontal } from 'lucide-react';

interface ShopToolbarProps {
  totalProducts: number;
  onOpenMobileFilters: () => void;
}

const ShopToolbar: React.FC<ShopToolbarProps> = ({ totalProducts, onOpenMobileFilters }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSort = (sortValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', sortValue);
    router.replace(`/shop?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
      
      {/* Mobile Filter Button */}
      <button 
        onClick={onOpenMobileFilters}
        className="md:hidden flex items-center gap-2 px-4 py-2 bg-secondary-100 rounded-lg text-sm font-medium w-full sm:w-auto justify-center"
      >
        <Filter size={16} />
        Filters
      </button>

      {/* Results Count */}
      <p className="text-sm text-secondary-500">
        Showing <span className="font-bold text-secondary-900">{totalProducts}</span> results
      </p>

      {/* Sort Dropdown */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <SlidersHorizontal size={16} className="text-secondary-400 hidden sm:block" />
        <select 
          className="p-2 border border-secondary-200 rounded-lg text-sm bg-white outline-none focus:border-primary-500 w-full sm:w-48 cursor-pointer"
          defaultValue={searchParams.get('sort') || 'newest'}
          onChange={(e) => handleSort(e.target.value)}
        >
          <option value="newest">Newest Arrivals</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name_asc">Name: A to Z</option>
        </select>
      </div>
    </div>
  );
};

export default ShopToolbar;