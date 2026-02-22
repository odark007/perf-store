'use client';

import React, { useState } from 'react';
import { Trash2, Tag, Edit2, Plus } from 'lucide-react';
import { deleteCategory } from '@/app/actions/admin';
import CategoryModal from './CategoryModal';
import Button from '@/components/ui/Button';

interface CategoryListProps {
  categories: any[];
}

const CategoryList: React.FC<CategoryListProps> = ({ categories }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{id: string, name: string} | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Open Modal for Create
  const handleAdd = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleEdit = (cat: {id: string, name: string}) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This cannot be undone.')) return;
    
    setDeletingId(id);
    const res = await deleteCategory(id);
    setDeletingId(null);

    if (res.error) {
      alert(res.error);
    }
  };

  return (
    <>
      {/* Header moved here to consolidate controls */}
      <div className="flex justify-end mb-4">
        <Button onClick={handleAdd} leftIcon={<Plus size={18} />}>
          Add Category
        </Button>
      </div>

      <div className="bg-white border border-secondary-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary-50 border-b border-secondary-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-secondary-900">Name</th>
              <th className="px-6 py-4 font-semibold text-secondary-900">Slug</th>
              <th className="px-6 py-4 font-semibold text-secondary-900 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-100">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-secondary-50">
                <td className="px-6 py-4 font-medium text-secondary-900 flex items-center gap-2">
                  <Tag size={16} className="text-primary-500" />
                  {cat.name}
                </td>
                <td className="px-6 py-4 text-secondary-500 font-mono text-xs">
                  {cat.slug}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {/* Edit Button */}
                    <button 
                      onClick={() => handleEdit(cat)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 size={18} />
                    </button>

                    {/* Delete Button */}
                    <button 
                      onClick={() => handleDelete(cat.id)}
                      disabled={deletingId === cat.id}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete Category"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-secondary-500">
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* The Modal */}
      <CategoryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialData={editingCategory}
      />
    </>
  );
};

export default CategoryList;