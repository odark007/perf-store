'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';
import Button from '@/components/ui/Button';
import FilterSection from './FilterSection';

interface ShopSidebarProps {
  categories: { id: string; name: string; slug: string }[];
  brands: string[];
  isOpen: boolean;
  onClose: () => void;
}

const ShopSidebar: React.FC<ShopSidebarProps> = ({ categories, brands, isOpen, onClose }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local state for Price inputs
  const [minPrice, setMinPrice] = useState(searchParams.get('min') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max') || '');

  // Helper to update URL
  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    params.set('page', '1'); // Reset pagination
    router.push(`/shop?${params.toString()}`);
  };

  const applyPrice = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set('min', minPrice); else params.delete('min');
    if (maxPrice) params.set('max', maxPrice); else params.delete('max');
    params.set('page', '1');
    router.push(`/shop?${params.toString()}`);
    if (window.innerWidth < 768) onClose();
  };

  const clearFilters = () => {
    router.push('/shop');
    setMinPrice('');
    setMaxPrice('');
    onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out p-6 overflow-y-auto
        md:relative md:transform-none md:w-64 md:shadow-none md:p-0 md:bg-transparent md:block md:z-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>

        {/* Mobile Header */}
        <div className="flex justify-between items-center mb-6 md:hidden">
          <h2 className="text-xl font-bold">Filters</h2>
          <button onClick={onClose}><X size={24} /></button>
        </div>

        {/* Clear Button */}
        {(searchParams.toString().length > 0) && (
          <button
            onClick={clearFilters}
            className="text-sm text-red-600 hover:underline mb-4 block w-full text-left"
          >
            Clear all filters
          </button>
        )}

        {/* 1. Categories */}
        <FilterSection title="Categories">
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="category"
                checked={searchParams.get('category') === cat.slug}
                onChange={() => updateFilter('category', cat.slug)}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <span className={`text-sm ${searchParams.get('category') === cat.slug ? 'font-bold text-primary-700' : 'text-secondary-600 group-hover:text-secondary-900'}`}>
                {cat.name}
              </span>
            </label>
          ))}
        </FilterSection>

        {/* 2. Price Range */}
        <FilterSection title="Price Range (GH₵)">
          <div className="flex items-center gap-2 mb-3">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full p-2 border border-secondary-200 rounded-lg text-sm"
            />
            <span className="text-secondary-400">-</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full p-2 border border-secondary-200 rounded-lg text-sm"
            />
          </div>
          <Button size="sm" variant="outline" fullWidth onClick={applyPrice}>
            Apply
          </Button>
        </FilterSection>

        {/* 3. Brands */}
        {brands.length > 0 && (
          <FilterSection title="Brands" defaultOpen={false}>
            {brands.map((brand) => (
              <label key={brand} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="brand"
                  checked={searchParams.get('brand') === brand}
                  onChange={() => updateFilter('brand', brand)}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <span className="text-sm text-secondary-600 group-hover:text-secondary-900">
                  {brand}
                </span>
              </label>
            ))}
          </FilterSection>
        )}

        {/* 4. Type (Variant) */}
        <FilterSection title="Type">
          {['single', 'pack', 'crate'].map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={searchParams.get('type') === type}
                onChange={(e) => updateFilter('type', e.target.checked ? type : null)} // FIX: Added 'e'
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 border-gray-300"
              />
              <span className="text-sm capitalize text-secondary-600 group-hover:text-secondary-900">
                {type}
              </span>
            </label>
          ))}
        </FilterSection>

        {/* 5. Special */}
        <div className="py-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={searchParams.get('featured') === 'true'}
              onChange={(e) => updateFilter('featured', e.target.checked ? 'true' : null)} // FIX: Added 'e'
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 border-gray-300"
            />
            <span className="text-sm font-bold text-amber-600">
              Special Offers Only
            </span>
          </label>
        </div>

      </aside>
    </>
  );
};

export default ShopSidebar;