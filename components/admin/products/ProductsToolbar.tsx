'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, List } from 'lucide-react';

interface Props {
  categories: { id: string; name: string }[];
}

const ProductsToolbar: React.FC<Props> = ({ categories }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1'); // Reset pagination
    router.replace(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Search */}
      <div className="relative flex-1">
        <Search size={18} className="absolute left-3 top-2.5 text-secondary-400" />
        <input
          type="text"
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:border-primary-500"
          defaultValue={searchParams.get('q') || ''}
          onChange={(e) => updateParams('q', e.target.value)}
        />
      </div>

      {/* Category Filter */}
      <div className="relative min-w-[200px]">
        <Filter size={18} className="absolute left-3 top-2.5 text-secondary-400" />
        <select
          className="w-full pl-10 pr-8 py-2 border border-secondary-300 rounded-lg appearance-none bg-white focus:outline-none focus:border-primary-500"
          defaultValue={searchParams.get('category') || 'all'}
          onChange={(e) => updateParams('category', e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Rows Per Page */}
      <div className="relative w-32">
        <List size={18} className="absolute left-3 top-2.5 text-secondary-400" />
        <select
          className="w-full pl-10 pr-8 py-2 border border-secondary-300 rounded-lg appearance-none bg-white focus:outline-none focus:border-primary-500"
          defaultValue={searchParams.get('limit') || '10'}
          onChange={(e) => updateParams('limit', e.target.value)}
        >
          <option value="10">10 rows</option>
          <option value="50">50 rows</option>
          <option value="100">100 rows</option>
          <option value="200">200 rows</option>
        </select>
      </div>
    </div>
  );
};

export default ProductsToolbar;