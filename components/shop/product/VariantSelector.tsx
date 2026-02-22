'use client';

import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Variant {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface Props {
  variants: Variant[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const VariantSelector: React.FC<Props> = ({ variants, selectedId, onSelect }) => {
  return (
    <div className="flex flex-wrap gap-3 my-4">
      {variants.map((v) => {
        const isSelected = selectedId === v.id;
        const isOutOfStock = v.stock <= 0;

        return (
          <button
            key={v.id}
            onClick={() => !isOutOfStock && onSelect(v.id)}
            disabled={isOutOfStock}
            className={cn(
              "px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all relative overflow-hidden text-left min-w-[120px]",
              isSelected 
                ? "border-primary-500 bg-primary-50 text-primary-900" 
                : "border-secondary-200 bg-white text-secondary-600 hover:border-secondary-300",
              isOutOfStock && "opacity-50 cursor-not-allowed bg-secondary-100"
            )}
          >
            <div className="font-bold">{v.name}</div>
            <div className={isSelected ? "text-primary-700" : "text-secondary-500"}>
              {formatCurrency(v.price)}
            </div>
            
            {isOutOfStock && (
              <span className="absolute top-0 right-0 bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-bl">
                Sold Out
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default VariantSelector;