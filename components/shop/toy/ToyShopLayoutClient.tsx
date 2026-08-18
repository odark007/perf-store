'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ToyProductCard from './ToyProductCard';
import { Filter, X, Search, RotateCcw, Sparkles } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ToyProduct {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  category_id?: string;
  base_image_url: string;
  brand?: string;
  age_rating?: string;
  tags?: string[];
  discount_percent?: number;
  compare_at_price?: number;
  variants: Array<{
    id: string;
    name: string;
    price: number;
    inventory?: { current_stock_level: number };
  }>;
}

interface ToyShopLayoutClientProps {
  categories: Category[];
  products: ToyProduct[];
  storeSlug?: string;
}

const FEATURE_TAGS = [
  { value: 'camera', label: 'Camera', icon: '📷' },
  { value: 'vr', label: 'VR Ready', icon: '🕶️' },
  { value: 'app', label: 'App-Controlled', icon: '📶' },
  { value: 'ai', label: 'AI-Powered', icon: '🤖' },
  { value: 'voice', label: 'Voice Control', icon: '🎙️' },
  { value: 'rechargeable', label: 'Rechargeable', icon: '🔋' },
];

const ToyShopLayoutClient: React.FC<ToyShopLayoutClientProps> = ({
  categories,
  products,
  storeSlug = 'play-time'
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Selected filters from URL or state
  const initialCategory = searchParams.get('category') || '';
  const initialTag = searchParams.get('tag') || '';
  const initialQuery = searchParams.get('q') || '';

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialTag ? [initialTag] : []
  );
  const [priceFilter, setPriceFilter] = useState<'all' | 'under50' | '50to100' | 'over100'>('all');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Toggle category
  const handleCategoryToggle = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    );
  };

  // Toggle tag
  const handleTagToggle = (tagVal: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagVal) ? prev.filter((t) => t !== tagVal) : [...prev, tagVal]
    );
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedTags([]);
    setPriceFilter('all');
    setSearchQuery('');
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesDesc = (p.description || '').toLowerCase().includes(q);
        const matchesCat = (p.category || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCat) return false;
      }

      // 2. Category Filter
      if (selectedCategories.length > 0) {
        const catObj = categories.find((c) => c.id === p.category_id || c.name === p.category);
        const catSlug = catObj?.slug || (p.category ? p.category.toLowerCase().replace(/\s+/g, '-') : '');
        const matchesCatSlug = selectedCategories.includes(catSlug);
        const matchesCatName = selectedCategories.includes(p.category);
        if (!matchesCatSlug && !matchesCatName) return false;
      }

      // 3. Tags Filter
      if (selectedTags.length > 0) {
        const productTags = (p.tags || []).map((t) => t.toLowerCase());
        const hasAllTags = selectedTags.every((st) => productTags.includes(st.toLowerCase()));
        if (!hasAllTags) return false;
      }

      // 4. Price Filter
      const price = Number(p.variants?.[0]?.price) || 0;
      if (priceFilter === 'under50' && price >= 50) return false;
      if (priceFilter === '50to100' && (price < 50 || price > 100)) return false;
      if (priceFilter === 'over100' && price <= 100) return false;

      return true;
    });
  }, [products, categories, selectedCategories, selectedTags, priceFilter, searchQuery]);

  const activeFiltersCount = selectedCategories.length + selectedTags.length + (priceFilter !== 'all' ? 1 : 0);

  // Filter Sidebar UI Content
  const filterContent = (
    <div className="space-y-6">
      {/* Category Group */}
      <div>
        <h4 className="font-mono text-xs uppercase tracking-widest text-[#5b5876] font-semibold mb-3">
          Category
        </h4>
        <div className="space-y-2">
          {categories.map((cat) => {
            const isChecked = selectedCategories.includes(cat.slug) || selectedCategories.includes(cat.name);
            return (
              <label
                key={cat.id}
                className="flex items-center gap-2.5 text-sm text-[#23213d] font-body cursor-pointer hover:text-[#6857e8] transition-colors py-0.5"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleCategoryToggle(cat.slug)}
                  className="w-4 h-4 rounded text-[#8c7ef6] focus:ring-[#8c7ef6] border-[#e2ddf7]"
                />
                <span>{cat.name}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Features / Tags Group */}
      <div>
        <h4 className="font-mono text-xs uppercase tracking-widest text-[#5b5876] font-semibold mb-3">
          Features
        </h4>
        <div className="space-y-2">
          {FEATURE_TAGS.map((tag) => {
            const isChecked = selectedTags.includes(tag.value);
            return (
              <label
                key={tag.value}
                className="flex items-center gap-2.5 text-sm text-[#23213d] font-body cursor-pointer hover:text-[#6857e8] transition-colors py-0.5"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleTagToggle(tag.value)}
                  className="w-4 h-4 rounded text-[#8c7ef6] focus:ring-[#8c7ef6] border-[#e2ddf7]"
                />
                <span className="inline-flex items-center gap-1.5">
                  <span>{tag.icon}</span>
                  <span>{tag.label}</span>
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Price Group */}
      <div>
        <h4 className="font-mono text-xs uppercase tracking-widest text-[#5b5876] font-semibold mb-3">
          Price Range
        </h4>
        <div className="space-y-2 text-sm text-[#23213d] font-body">
          <label className="flex items-center gap-2.5 cursor-pointer hover:text-[#6857e8] transition-colors py-0.5">
            <input
              type="radio"
              name="price"
              value="all"
              checked={priceFilter === 'all'}
              onChange={() => setPriceFilter('all')}
              className="w-4 h-4 text-[#8c7ef6] focus:ring-[#8c7ef6]"
            />
            <span>Any price</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer hover:text-[#6857e8] transition-colors py-0.5">
            <input
              type="radio"
              name="price"
              value="under50"
              checked={priceFilter === 'under50'}
              onChange={() => setPriceFilter('under50')}
              className="w-4 h-4 text-[#8c7ef6] focus:ring-[#8c7ef6]"
            />
            <span>Under GH₵50</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer hover:text-[#6857e8] transition-colors py-0.5">
            <input
              type="radio"
              name="price"
              value="50to100"
              checked={priceFilter === '50to100'}
              onChange={() => setPriceFilter('50to100')}
              className="w-4 h-4 text-[#8c7ef6] focus:ring-[#8c7ef6]"
            />
            <span>GH₵50 – GH₵100</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer hover:text-[#6857e8] transition-colors py-0.5">
            <input
              type="radio"
              name="price"
              value="over100"
              checked={priceFilter === 'over100'}
              onChange={() => setPriceFilter('over100')}
              className="w-4 h-4 text-[#8c7ef6] focus:ring-[#8c7ef6]"
            />
            <span>GH₵100+</span>
          </label>
        </div>
      </div>

      {/* Clear Button */}
      {activeFiltersCount > 0 && (
        <button
          onClick={handleClearFilters}
          className="w-full py-2.5 px-4 rounded-full border border-[#e2ddf7] bg-white text-[#23213d] hover:border-[#8c7ef6] hover:text-[#6857e8] text-xs font-bold font-body transition-all inline-flex items-center justify-center gap-1.5"
        >
          <RotateCcw size={13} />
          Clear filters ({activeFiltersCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-[#f5f3fc] min-h-screen py-8 md:py-12">
      <div className="container-custom">
        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#6857e8] mb-2 font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#ff8f66] shadow-[0_0_0_3px_rgba(255,143,102,0.2)]" />
              Full Catalog
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-[#23213d] tracking-tight">
              Shop All Toys
            </h1>
          </div>

          {/* Search bar & Mobile Filter Button */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-72">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5b5876]" />
              <input
                type="text"
                placeholder="Search RC cars, robots..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-full bg-white border border-[#e2ddf7] text-sm text-[#23213d] placeholder:text-[#9b96c9] focus:outline-none focus:border-[#8c7ef6] font-body"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5b5876] hover:text-[#23213d]"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="lg:hidden px-4 py-2.5 rounded-full bg-white border border-[#e2ddf7] text-[#23213d] text-xs font-bold font-body inline-flex items-center gap-2 shrink-0 shadow-sm"
            >
              <Filter size={15} />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#ff8f66] text-white font-mono text-[10px] grid place-items-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block sticky top-24 bg-white rounded-2xl border border-[#e2ddf7] p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#ecebfa] mb-5">
              <span className="font-bold text-sm text-[#23213d] font-display">Filters</span>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="text-[11px] font-mono text-[#ff8f66] hover:underline"
                >
                  Reset
                </button>
              )}
            </div>
            {filterContent}
          </aside>

          {/* Product Results */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <p className="text-xs font-mono text-[#5b5876]">
                {filteredProducts.length} toy{filteredProducts.length === 1 ? '' : 's'} found
              </p>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredProducts.map((product) => {
                  const primaryVariant = product.variants?.[0];
                  const masterStock = primaryVariant?.inventory?.current_stock_level ?? 10;

                  return (
                    <ToyProductCard
                      key={product.id}
                      id={product.id}
                      slug={product.slug}
                      title={product.title}
                      description={product.description}
                      image={product.base_image_url}
                      category={product.category}
                      price={Number(primaryVariant?.price) || 0}
                      compareAtPrice={product.compare_at_price ? Number(product.compare_at_price) : null}
                      discountPercent={product.discount_percent || 0}
                      ageRating={product.age_rating || '6+'}
                      tags={product.tags || []}
                      quantityAvailable={masterStock}
                      variantId={primaryVariant?.id}
                      variantName={primaryVariant?.name}
                      storeSlug={storeSlug}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-[#e2ddf7] p-12 text-center space-y-4">
                <span className="text-4xl block">🔍</span>
                <h3 className="text-lg font-bold font-display text-[#23213d]">No toys match those filters</h3>
                <p className="text-xs text-[#5b5876] max-w-sm mx-auto">
                  Try clearing a filter or searching for a different keyword.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-6 py-2.5 rounded-full bg-[#ff8f66] text-white text-xs font-bold hover:bg-[#f2704a] transition-all"
                >
                  Reset all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Slide-over Modal */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMobileFiltersOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#ecebfa] mb-6">
                <h3 className="font-bold text-base font-display text-[#23213d]">Filter Toys</h3>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#f5f3fc] grid place-items-center text-[#23213d]"
                >
                  <X size={16} />
                </button>
              </div>
              {filterContent}
            </div>

            <div className="pt-6 border-t border-[#ecebfa] mt-6">
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full py-3 rounded-full bg-[#8c7ef6] text-white font-bold text-sm shadow-md"
              >
                View {filteredProducts.length} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToyShopLayoutClient;
