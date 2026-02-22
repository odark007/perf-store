'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Percent } from 'lucide-react';
import Button from '@/components/ui/Button';
import { upsertTax, deleteTax } from '@/app/actions/settings';

interface Props {
  taxes: any[];
}

const TaxSettings: React.FC<Props> = ({ taxes }) => {
  const [editingTax, setEditingTax] = useState<any>(null);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    await upsertTax({
      id: editingTax?.id,
      name: formData.get('name'),
      rate_percent: Number(formData.get('rate_percent')),
      is_active: formData.get('is_active') === 'on'
    });
    setEditingTax(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this tax?")) await deleteTax(id);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Tax Configuration</h2>
        {!editingTax && (
          <Button onClick={() => setEditingTax({ is_active: true })} leftIcon={<Plus size={18} />}>
            Add New Tax
          </Button>
        )}
      </div>

      {editingTax && (
        <div className="bg-secondary-50 p-6 rounded-xl border border-secondary-200 animate-slide-up">
          <form onSubmit={handleSave} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase mb-1">Tax Name</label>
              <input required name="name" defaultValue={editingTax.name} placeholder="e.g. VAT" className="w-full p-2 border rounded" />
            </div>
            <div className="w-32">
              <label className="block text-xs font-bold uppercase mb-1">Rate (%)</label>
              <input required type="number" step="0.01" name="rate_percent" defaultValue={editingTax.rate_percent} placeholder="12.5" className="w-full p-2 border rounded" />
            </div>
            <div className="pb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="is_active" defaultChecked={editingTax.is_active} className="w-4 h-4" />
                <span className="text-sm">Active</span>
              </label>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setEditingTax(null)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-secondary-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-secondary-50 border-b border-secondary-200">
            <tr>
              <th className="px-6 py-3 text-sm font-bold text-secondary-900">Name</th>
              <th className="px-6 py-3 text-sm font-bold text-secondary-900">Rate</th>
              <th className="px-6 py-3 text-sm font-bold text-secondary-900">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-100">
            {taxes.map((tax: any) => (
              <tr key={tax.id} className="hover:bg-secondary-50">
                <td className="px-6 py-4 font-medium">{tax.name}</td>
                <td className="px-6 py-4 font-mono">{tax.rate_percent}%</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${tax.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {tax.is_active ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-3">
                  <button onClick={() => setEditingTax(tax)} className="text-blue-600 hover:underline text-sm">Edit</button>
                  <button onClick={() => handleDelete(tax.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaxSettings;