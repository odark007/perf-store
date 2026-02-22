'use client';

import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import Button from '@/components/ui/Button';
import { createCategory, updateCategory } from '@/app/actions/admin';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: { id: string; name: string } | null; // <-- New Prop
}

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');

  // Populate form when initialData changes (Edit Mode)
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
    } else {
      setName('');
    }
  }, [initialData, isOpen]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData();
    formData.append('name', name);

    let res;
    if (initialData) {
      // Edit Mode
      res = await updateCategory(initialData.id, formData);
    } else {
      // Create Mode
      res = await createCategory(formData);
    }

    setLoading(false);

    if (res.error) {
      alert(res.error);
    } else {
      onClose();
      // Reset only if creating, keep value if editing failed? 
      // Actually best to clear on success
      if (!initialData) setName(''); 
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-scale-in">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-secondary-900">
            {initialData ? 'Edit Category' : 'Add New Category'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-secondary-100 rounded-lg">
            <X size={20} className="text-secondary-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Category Name</label>
            <input 
              name="name" 
              type="text" 
              required 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Energy Drinks"
              className="w-full p-2.5 bg-secondary-50 border border-secondary-200 rounded-lg outline-none focus:border-primary-500"
            />
            <p className="text-xs text-secondary-500 mt-1">Slug will be generated automatically.</p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-secondary-100">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" isLoading={loading} leftIcon={<Save size={18} />}>
              {initialData ? 'Update Category' : 'Save Category'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;