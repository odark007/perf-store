'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Plus, Trash2, ArrowLeft, Calendar, Percent } from 'lucide-react';
import Button from '@/components/ui/Button';
import ImageUpload from '@/components/admin/input/ImageUpload';
import { createProduct, updateProduct } from '@/app/actions/product';

interface ProductFormProps {
  categories: { id: string; name: string }[];
  initialData?: any;
}

const ProductForm: React.FC<ProductFormProps> = ({ categories, initialData }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEditMode = !!initialData;

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [image, setImage] = useState('');
  const [initialStock, setInitialStock] = useState(0);
  const [threshold, setThreshold] = useState(10);
  const [brand, setBrand] = useState('');

  // Promo State
  const [isFeatured, setIsFeatured] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Variants State
  const [variants, setVariants] = useState([
    { name: 'Single Bottle', type: 'single', price: 0, stock_deduction: 1 },
  ]);

  // Load Initial Data
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setCategoryId(initialData.category_id);
      setImage(initialData.base_image_url);
      setBrand(initialData.brand || '');
      setIsFeatured(initialData.is_featured || false);

      // Load Promo
      setDiscountPercent(initialData.discount_percent || 0);
      if (initialData.discount_start_at) setStartDate(initialData.discount_start_at.slice(0, 16));
      if (initialData.discount_end_at) setEndDate(initialData.discount_end_at.slice(0, 16));

      setVariants(initialData.variants || []);
    } else if (categories.length > 0) {
      setCategoryId(categories[0].id);
    }
  }, [initialData, categories]);

  // FIX: Removed the useEffect that auto-cleared promo data. 
  // We now handle cleanup in handleSubmit.

  const addVariant = () => {
    setVariants([...variants, { name: '', type: 'pack', price: 0, stock_deduction: 6 }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: string, value: any) => {
    const newVariants = [...variants];
    // @ts-ignore
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return alert("Please upload an image");

    setLoading(true);

    // Prepare Data payload
    const productData = {
      title,
      description,
      category_id: categoryId,
      base_image_url: image,
      brand,
      is_featured: isFeatured,
      discount_percent: isFeatured ? discountPercent : 0,
      discount_start_at: isFeatured ? (startDate || null) : null,
      discount_end_at: isFeatured ? (endDate || null) : null,
      variants: variants
    };

    let res;
    if (isEditMode) {
      // FIX: Added 'as any' to bypass strict string literal check
      res = await updateProduct(initialData.id, productData as any);
    } else {
      // FIX: Added 'as any' to bypass strict string literal check
      res = await createProduct({
        ...productData,
        initial_stock: initialStock,
        threshold: threshold,
      } as any);
    }

    setLoading(false);

    if (res.error) {
      alert(res.error);
    } else {
      alert(isEditMode ? "Product Updated!" : "Product Created!");
      router.push('/admin/products');
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* ... Header ... */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-secondary-900">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h1>
        </div>
        <Button type="submit" isLoading={loading} leftIcon={<Save size={18} />}>
          {isEditMode ? 'Update Product' : 'Save Product'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-secondary-200 shadow-sm space-y-4">
            <h3 className="font-bold text-secondary-900">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Product Title</label>
                <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full p-2 border rounded-lg bg-white">
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Brand (Optional)</label>
                <input value={brand} onChange={e => setBrand(e.target.value)} className="w-full p-2 border rounded-lg" placeholder="General" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border rounded-lg" />
              </div>
            </div>
          </div>

          {/* PROMO */}
          <div className="bg-white p-6 rounded-xl border border-secondary-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-secondary-100 pb-3">
              <input
                type="checkbox"
                id="isFeatured"
                checked={isFeatured}
                onChange={e => setIsFeatured(e.target.checked)}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
              <label htmlFor="isFeatured" className="font-bold text-secondary-900 cursor-pointer select-none">
                Mark as Featured / Promotion
              </label>
            </div>

            {isFeatured && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in bg-amber-50 p-4 rounded-lg border border-amber-100">
                <div>
                  <label className="block text-xs font-bold uppercase text-amber-800 mb-1 flex items-center gap-1">
                    <Percent size={12} /> Discount
                  </label>
                  <input
                    type="number"
                    value={discountPercent}
                    onChange={e => setDiscountPercent(parseFloat(e.target.value))}
                    className="w-full p-2 border border-amber-200 rounded text-amber-900 font-bold"
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-amber-800 mb-1 flex items-center gap-1">
                    <Calendar size={12} /> Start Date
                  </label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full p-2 border border-amber-200 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-amber-800 mb-1 flex items-center gap-1">
                    <Calendar size={12} /> End Date
                  </label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full p-2 border border-amber-200 rounded text-xs"
                  />
                </div>
                <p className="col-span-3 text-[10px] text-amber-700 italic">
                  * Leave dates empty for immediate and indefinite promotion.
                </p>
              </div>
            )}
          </div>

          {/* VARIANTS */}
          <div className="bg-white p-6 rounded-xl border border-secondary-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-secondary-900">Pricing & Variants</h3>
              <Button type="button" size="sm" variant="outline" onClick={addVariant} leftIcon={<Plus size={14} />}>Add Variant</Button>
            </div>
            <div className="space-y-4">
              {variants.map((variant: any, index) => (
                <div key={index} className="flex gap-3 items-end bg-secondary-50 p-3 rounded-lg">
                  <div className="flex-1">
                    <label className="text-xs text-secondary-500">Name</label>
                    <input type="text" value={variant.name} onChange={e => updateVariant(index, 'name', e.target.value)} className="w-full p-2 border rounded text-sm" />
                  </div>
                  <div className="w-24">
                    <label className="text-xs text-secondary-500">Type</label>
                    {/* FIX: Reverted to Select Dropdown */}
                    <select value={variant.type} onChange={e => updateVariant(index, 'type', e.target.value)} className="w-full p-2 border rounded text-sm bg-white">
                      <option value="single">Single</option>
                      <option value="pack">Pack</option>
                      <option value="crate">Crate</option>
                    </select>
                  </div>
                  <div className="w-24">
                    <label className="text-xs text-secondary-500">Price (GH₵)</label>
                    <input type="number" value={variant.price} onChange={e => updateVariant(index, 'price', parseFloat(e.target.value))} className="w-full p-2 border rounded text-sm" />
                  </div>
                  <div className="w-20">
                    <label className="text-xs text-secondary-500">Deducts</label>
                    <input type="number" value={variant.stock_deduction} onChange={e => updateVariant(index, 'stock_deduction', parseInt(e.target.value))} className="w-full p-2 border rounded text-sm" />
                  </div>
                  {variants.length > 1 && (
                    <button type="button" onClick={() => removeVariant(index)} className="p-2 text-red-500 hover:bg-red-100 rounded">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-secondary-200 shadow-sm">
            <h3 className="font-bold text-secondary-900 mb-4">Product Image</h3>
            <ImageUpload value={image} onChange={setImage} onRemove={() => setImage('')} />
          </div>

          {!isEditMode && (
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-sm space-y-4">
              <h3 className="font-bold text-blue-900">Inventory</h3>
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">Initial Stock</label>
                <input type="number" value={initialStock} onChange={e => setInitialStock(parseInt(e.target.value))} className="w-full p-2 border border-blue-200 rounded-lg text-lg font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">Low Stock Alert</label>
                <input type="number" value={threshold} onChange={e => setThreshold(parseInt(e.target.value))} className="w-full p-2 border border-blue-200 rounded-lg" />
              </div>
            </div>
          )}
        </div>

      </div>
    </form>
  );
};

export default ProductForm;