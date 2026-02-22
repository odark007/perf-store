'use client';

import React, { useState } from 'react';
import { X, Plus, Save } from 'lucide-react';
import Button from '@/components/ui/Button';
import { restockInventory } from '@/app/actions/inventory';

interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: { id: string; product_name: string; current_stock_level: number } | null;
}

const RestockModal: React.FC<RestockModalProps> = ({ isOpen, onClose, item }) => {
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('New Shipment');

  if (!isOpen || !item) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    const qtyNumber = parseInt(quantity);
    if (isNaN(qtyNumber) || qtyNumber === 0) {
      alert("Please enter a valid quantity");
      setLoading(false);
      return;
    }

    const res = await restockInventory(item!.id, qtyNumber, reason);
    setLoading(false);

    if (res.error) {
      alert(res.error);
    } else {
      setQuantity('');
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-scale-in">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-secondary-900">Update Stock</h3>
            <p className="text-sm text-secondary-500">{item.product_name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary-100 rounded-lg">
            <X size={20} className="text-secondary-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg flex justify-between items-center">
            <span className="text-sm text-blue-700 font-medium">Current Stock</span>
            <span className="text-xl font-bold text-blue-900">{item.current_stock_level}</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Quantity to Add (or subtract)</label>
            <input 
              type="number" 
              required 
              placeholder="+50"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full p-2.5 bg-secondary-50 border border-secondary-200 rounded-lg outline-none focus:border-primary-500 text-lg font-mono"
            />
            <p className="text-xs text-secondary-500 mt-1">Enter negative number to remove stock (e.g. -5).</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Reason / Note</label>
            <input 
              type="text" 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2.5 bg-secondary-50 border border-secondary-200 rounded-lg outline-none focus:border-primary-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-secondary-100">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" isLoading={loading} leftIcon={<Save size={18} />}>
              Update Stock
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RestockModal;