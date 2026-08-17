'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { X, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '@/components/ui/Button';
import FilterSection from './FilterSection';

interface ShopSidebarProps {
  categories: { id: string; name: string; slug: string }[];
  brands: string[];
  concentrations: string[];
  scentFamilies: string[];
  isOpen: boolean;
  onClose: () => void;
}

const ShopSidebar: React.FC<ShopSidebarProps> = ({
  categories,
  brands,
  concentrations,
  scentFamilies,
  isOpen,
  onClose
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const storeSlug = (params?.store as string) || 'derme';

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
    router.push(`/${storeSlug}/shop?${params.toString()}`);
  };

  const applyPrice = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set('min', minPrice); else params.delete('min');
    if (maxPrice) params.set('max', maxPrice); else params.delete('max');
    params.set('page', '1');
    router.push(`/${storeSlug}/shop?${params.toString()}`);
    if (window.innerWidth < 768) onClose();
  };

  const clearFilters = () => {
    router.push(`/${storeSlug}/shop`);
    setMinPrice('');
    setMaxPrice('');
    onClose();
  };

  const isSelected = (key: string, value: string) => searchParams.get(key) === value;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-brand-deep/60 backdrop-blur-sm z-40 md:hidden" onClick={onClose} />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-80 bg-white border-r border-brand-border transform transition-transform duration-500 ease-in-out p-8 overflow-y-auto
        md:relative md:transform-none md:w-64 md:border-none md:p-0 md:bg-transparent md:block md:z-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2 text-brand-deep">
            <SlidersHorizontal size={18} className="text-brand-gold" />
            <h2 className="text-lg font-display font-bold uppercase tracking-widest text-sm">Refine</h2>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-2 hover:bg-brand-cream rounded-full transition-colors"
            aria-label="Close filters"
          >
            <X size={20} />
          </button>
        </div>

        {/* Clear Button */}
        {(searchParams.toString().length > 0) && (
          <button
            onClick={clearFilters}
            className="text-[10px] uppercase tracking-widest font-bold text-danger hover:text-brand-deep mb-6 block w-full text-left transition-colors"
          >
            Clear all filters
          </button>
        )}

        {/* 1. Categories (Genders/Types) */}
        <div className="space-y-6">
          <FilterSection title="Categories">
            <div className="flex flex-col gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateFilter('category', isSelected('category', cat.slug) ? null : cat.slug)}
                  className={`flex items-center justify-between text-xs font-medium uppercase tracking-wider transition-all ${isSelected('category', cat.slug) ? 'text-brand-gold font-bold' : 'text-brand-muted hover:text-brand-deep'
                    }`}
                >
                  {cat.name}
                  {isSelected('category', cat.slug) && <div className="w-1 h-1 rounded-full bg-brand-gold" />}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* 2. Scent Family */}
          {scentFamilies.length > 0 && (
            <FilterSection title="Scent Family">
              <div className="flex flex-col gap-3">
                {scentFamilies.map((family) => (
                  <button
                    key={family}
                    onClick={() => updateFilter('scent_family', isSelected('scent_family', family) ? null : family)}
                    className={`flex items-center justify-between text-xs font-medium uppercase tracking-wider transition-all ${isSelected('scent_family', family) ? 'text-brand-gold font-bold' : 'text-brand-muted hover:text-brand-deep'
                      }`}
                  >
                    {family}
                    {isSelected('scent_family', family) && <div className="w-1 h-1 rounded-full bg-brand-gold" />}
                  </button>
                ))}
              </div>
            </FilterSection>
          )}

          {/* 3. Concentration */}
          {concentrations.length > 0 && (
            <FilterSection title="Concentration">
              <div className="flex flex-col gap-3">
                {concentrations.map((conc) => (
                  <button
                    key={conc}
                    onClick={() => updateFilter('concentration', isSelected('concentration', conc) ? null : conc)}
                    className={`flex items-center justify-between text-xs font-medium uppercase tracking-wider transition-all ${isSelected('concentration', conc) ? 'text-brand-gold font-bold' : 'text-brand-muted hover:text-brand-deep'
                      }`}
                  >
                    {conc}
                    {isSelected('concentration', conc) && <div className="w-1 h-1 rounded-full bg-brand-gold" />}
                  </button>
                ))}
              </div>
            </FilterSection>
          )}

          {/* 4. Brands */}
          {brands.length > 0 && (
            <FilterSection title="Brands" defaultOpen={false}>
              <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-3">
                {brands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => updateFilter('brand', isSelected('brand', brand) ? null : brand)}
                    className={`flex items-center justify-between text-xs font-medium uppercase tracking-wider transition-all text-left ${isSelected('brand', brand) ? 'text-brand-gold font-bold' : 'text-brand-muted hover:text-brand-deep'
                      }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </FilterSection>
          )}

          {/* 5. Price Range */}
          <FilterSection title="Price Range">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="MIN"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-cream/20 border border-brand-border rounded-lg text-xs font-bold focus:border-brand-gold outline-none"
                />
                <span className="text-brand-muted font-bold">-</span>
                <input
                  type="number"
                  placeholder="MAX"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-cream/20 border border-brand-border rounded-lg text-xs font-bold focus:border-brand-gold outline-none"
                />
              </div>
              <Button size="sm" className="w-full bg-brand-deep text-white border-none py-2 font-bold uppercase tracking-widest text-[10px]" onClick={applyPrice}>
                Apply Price
              </Button>
            </div>
          </FilterSection>

          {/* 6. Special */}
          <div className="pt-6 border-t border-brand-border">
            <button
              onClick={() => updateFilter('featured', searchParams.get('featured') === 'true' ? null : 'true')}
              className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all ${searchParams.get('featured') === 'true'
                ? 'bg-brand-gold/10 border border-brand-gold text-brand-gold'
                : 'bg-brand-cream/20 border border-transparent text-brand-muted hover:border-brand-border'
                }`}
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${searchParams.get('featured') === 'true' ? 'bg-brand-gold border-brand-gold' : 'bg-white border-brand-border'
                }`}>
                {searchParams.get('featured') === 'true' && <X size={10} className="text-brand-deep" />}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">Special Offers</span>
            </button>
          </div>
        </div>

      </aside>
    </>
  );
};

export default ShopSidebar;
