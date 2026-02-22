'use client';

import React, { useState } from 'react';
import { Package, AlertTriangle, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import RestockModal from './RestockModal';

interface InventoryItem {
  id: string;
  product_name: string;
  current_stock_level: number;
  low_stock_threshold: number;
}

interface Props {
  inventory: InventoryItem[];
}

const InventoryTable: React.FC<Props> = ({ inventory }) => {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const getStatus = (current: number, threshold: number) => {
    if (current <= 0) return <Badge variant="danger">Out of Stock</Badge>;
    if (current <= threshold) return <Badge variant="warning">Low Stock</Badge>;
    return <Badge variant="success">In Stock</Badge>;
  };

  return (
    <>
      <div className="bg-white border border-secondary-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary-50 border-b border-secondary-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-secondary-900">Product Name (Master)</th>
              <th className="px-6 py-4 font-semibold text-secondary-900">Current Level</th>
              <th className="px-6 py-4 font-semibold text-secondary-900">Threshold</th>
              <th className="px-6 py-4 font-semibold text-secondary-900">Status</th>
              <th className="px-6 py-4 font-semibold text-secondary-900 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-100">
            {inventory.map((item) => (
              <tr key={item.id} className="hover:bg-secondary-50">
                <td className="px-6 py-4 font-medium text-secondary-900 flex items-center gap-2">
                  <Package size={16} className="text-secondary-400" />
                  {item.product_name}
                </td>
                <td className="px-6 py-4 text-lg font-bold text-secondary-900 font-mono">
                  {item.current_stock_level}
                </td>
                <td className="px-6 py-4 text-secondary-500">
                  {item.low_stock_threshold}
                </td>
                <td className="px-6 py-4">
                  {getStatus(item.current_stock_level, item.low_stock_threshold)}
                </td>
                <td className="px-6 py-4 text-right">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSelectedItem(item)}
                    leftIcon={<Plus size={14} />}
                  >
                    Restock
                  </Button>
                </td>
              </tr>
            ))}
            {inventory.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-secondary-500">
                  No inventory items found. Add products to populate this list.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <RestockModal 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
        item={selectedItem} 
      />
    </>
  );
};

export default InventoryTable;