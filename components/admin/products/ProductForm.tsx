'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Plus, Trash2, ArrowLeft, Calendar, Percent, Droplets, Wind, Star, Info } from 'lucide-react';
import Button from '@/components/ui/Button';
import ImageUpload from '@/components/admin/input/ImageUpload';
import { createProduct, updateProduct } from '@/app/actions/product';

interface ProductFormProps {
  categories: { id: string; name: string }[];
  initialData?: any;
}

const CONCENTRATIONS = ['EDT', 'EDP', 'Parfum', 'Cologne', 'Body Mist'];
const SCENT_FAMILIES = ['Floral', 'Woody', 'Oriental', 'Fresh', 'Citrus', 'Aquatic', 'Gourmand', 'Chypre', 'Fougère'];
const LONGEVITY_OPTS = ['2-4hrs', '4-6hrs', '6-8hrs', '8+hrs'];
const SILLAGE_OPTS = ['Intimate', 'Moderate', 'Strong', 'Massive'];
const GENDER_OPTS = [
  { value: 'mens', label: "Men's" },
  { value: 'womens', label: "Women's" },
  { value: 'unisex', label: 'Unisex' }
];

const ProductForm: React.FC<ProductFormProps> = ({ categories, initialData }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEditMode = !!initialData;

  // Basic State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [image, setImage] = useState('');
  const [brand, setBrand] = useState('');
  const [brandLoading, setBrandLoading] = useState(false);

  // Perfume Attributes
  const [concentration, setConcentration] = useState('EDP');
  const [scentFamily, setScentFamily] = useState('Floral');
  const [gender, setGender] = useState('unisex');
  const [longevity, setLongevity] = useState('6-8hrs');
  const [sillage, setSillage] = useState('Moderate');

  // Scent Notes
  const [topNotes, setTopNotes] = useState('');
  const [heartNotes, setHeartNotes] = useState('');
  const [baseNotes, setBaseNotes] = useState('');

  // Promotion State
  const [isFeatured, setIsFeatured] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Variants & Inventory
  const [variants, setVariants] = useState([
    { name: '100ml', type: 'single', price: 0, stock_deduction: 1 },
  ]);
  const [initialStock, setInitialStock] = useState(0);
  const [threshold, setThreshold] = useState(10);

  // Load Initial Data
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setCategoryId(initialData.category_id);
      setImage(initialData.base_image_url);
      setBrand(initialData.brand || '');
      setIsFeatured(initialData.is_featured || false);
      setDiscountPercent(initialData.discount_percent || 0);

      // Perfume Fields
      setConcentration(initialData.concentration || 'EDP');
      setScentFamily(initialData.scent_family || 'Floral');
      setGender(initialData.gender || 'unisex');
      setLongevity(initialData.longevity || '6-8hrs');
      setSillage(initialData.sillage || 'Moderate');

      if (initialData.scent_notes) {
        setTopNotes(initialData.scent_notes.top?.join(', ') || '');
        setHeartNotes(initialData.scent_notes.heart?.join(', ') || '');
        setBaseNotes(initialData.scent_notes.base?.join(', ') || '');
      }

      if (initialData.discount_start_at) setStartDate(initialData.discount_start_at.slice(0, 16));
      if (initialData.discount_end_at) setEndDate(initialData.discount_end_at.slice(0, 16));

      setVariants(initialData.variants || []);
    } else if (categories.length > 0) {
      setCategoryId(categories[0].id);
    }
  }, [initialData, categories]);

  const addVariant = () => {
    setVariants([...variants, { name: '', type: 'single', price: 0, stock_deduction: 1 }]);
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
    if (!image) return alert("Please upload a product image");

    setLoading(true);

    const productData = {
      title,
      description,
      category_id: categoryId,
      base_image_url: image,
      brand,
      is_featured: isFeatured,
      discount_percent: isFeatured ? (discountPercent || 0) : 0,
      discount_start_at: isFeatured ? (startDate || null) : null,
      discount_end_at: isFeatured ? (endDate || null) : null,

      // Fragrance Fields
      concentration,
      scent_family: scentFamily,
      gender,
      longevity,
      sillage,
      scent_notes: {
        top: topNotes.split(',').map(s => s.trim()).filter(Boolean),
        heart: heartNotes.split(',').map(s => s.trim()).filter(Boolean),
        base: baseNotes.split(',').map(s => s.trim()).filter(Boolean),
      },

      variants: variants.map(v => ({
        ...v,
        price: v.price || 0,
        stock_deduction: v.stock_deduction || 1
      }))
    };

    let res;
    if (isEditMode) {
      res = await updateProduct(initialData.id, productData as any);
    } else {
      res = await createProduct({
        ...productData,
        initial_stock: initialStock || 0,
        threshold: threshold || 0,
      } as any);
    }

    setLoading(false);

    if (res.error) {
      alert(res.error);
    } else {
      alert(isEditMode ? "Fragrance Updated!" : "Fragrance Created!");
      router.push('/admin/products');
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-10 pb-24">

      {/* HEADER ACTION BAR */}
      <div className="flex items-center justify-between sticky top-0 z-30 bg-secondary-50 py-4 border-b border-secondary-200 -mx-4 px-4 bg-opacity-90 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-full w-10 h-10 p-0 flex items-center justify-center">
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-secondary-900 leading-tight">
              {isEditMode ? 'Modify Scent' : 'Curate New Fragrance'}
            </h1>
            <p className="text-xs text-secondary-500 font-medium">Capture the essence of the boutique</p>
          </div>
        </div>
        <Button type="submit" isLoading={loading} leftIcon={<Save size={18} />} className="shadow-lg shadow-primary-600/20 px-8">
          {isEditMode ? 'Update Maison' : 'Launch Masterpiece'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* LEFT: MAIN FORM CONTENT */}
        <div className="lg:col-span-3 space-y-8">

          {/* SECTION 1: IDENTITY */}
          <div className="bg-white p-8 rounded-3xl border border-secondary-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Info size={16} className="text-primary-600" />
              <h3 className="font-bold text-secondary-900 uppercase tracking-widest text-[10px]">Registry & Identity</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-secondary-600">Masterpiece Title</label>
                <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full p-3 bg-secondary-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-medium" placeholder="e.g., Midnight Oud" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-secondary-600">The Maison (Brand)</label>
                <input value={brand} onChange={e => setBrand(e.target.value)} className="w-full p-3 bg-secondary-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-medium" placeholder="e.g., Tom Ford" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-secondary-600">Collection (Category)</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full p-3 bg-secondary-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-medium outline-none">
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-secondary-600">The Olfactive Narrative (Description)</label>
                <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} className="w-full p-4 bg-secondary-50 border-none rounded-3xl focus:ring-2 focus:ring-primary-500 transition-all font-medium leading-relaxed" placeholder="Describe the journey, notes, and emotions..." />
              </div>
            </div>
          </div>

          {/* SECTION 2: OLFACTORY PYRAMID */}
          <div className="bg-white p-8 rounded-3xl border border-secondary-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Droplets size={16} className="text-primary-600" />
              <h3 className="font-bold text-secondary-900 uppercase tracking-widest text-[10px]">Olfactory Pyramid</h3>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-primary-600 ml-1">Top Notes (Sparkling Initials)</label>
                <input value={topNotes} onChange={e => setTopNotes(e.target.value)} className="w-full p-3 bg-secondary-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-medium" placeholder="Bergamot, Lemon, Mint..." />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-primary-600 ml-1">Heart Notes (The Central Echo)</label>
                <input value={heartNotes} onChange={e => setHeartNotes(e.target.value)} className="w-full p-3 bg-secondary-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-medium" placeholder="Lavender, Rose, Cinnamon..." />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-primary-600 ml-1">Base Notes (Enduring Legacy)</label>
                <input value={baseNotes} onChange={e => setBaseNotes(e.target.value)} className="w-full p-3 bg-secondary-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-medium" placeholder="Sandalwood, Musk, Amber..." />
              </div>
            </div>
          </div>

          {/* SECTION 3: TECHNICAL PERFORMANCE */}
          <div className="bg-white p-8 rounded-3xl border border-secondary-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Wind size={16} className="text-primary-600" />
              <h3 className="font-bold text-secondary-900 uppercase tracking-widest text-[10px]">Technical Performance</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-secondary-600">Concentration</label>
                <select value={concentration} onChange={e => setConcentration(e.target.value)} className="w-full p-3 bg-secondary-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-medium outline-none">
                  {CONCENTRATIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-secondary-600">Scent Family</label>
                <select value={scentFamily} onChange={e => setScentFamily(e.target.value)} className="w-full p-3 bg-secondary-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-medium outline-none">
                  {SCENT_FAMILIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-secondary-600">Longevity</label>
                <select value={longevity} onChange={e => setLongevity(e.target.value)} className="w-full p-3 bg-secondary-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-medium outline-none">
                  {LONGEVITY_OPTS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-secondary-600">Sillage</label>
                <select value={sillage} onChange={e => setSillage(e.target.value)} className="w-full p-3 bg-secondary-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-medium outline-none">
                  {SILLAGE_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-secondary-600">Character (Gender)</label>
                <select value={gender} onChange={e => setGender(e.target.value)} className="w-full p-3 bg-secondary-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-medium outline-none">
                  {GENDER_OPTS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 4: PRESENTATION (VARIANTS) */}
          <div className="bg-white p-8 rounded-3xl border border-secondary-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Droplets size={16} className="text-primary-600" />
                <h3 className="font-bold text-secondary-900 uppercase tracking-widest text-[10px]">Pricing & Presentation</h3>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={addVariant} leftIcon={<Plus size={14} />} className="rounded-full px-4 border-dashed border-2 hover:border-primary-500">Add Volume</Button>
            </div>

            <div className="space-y-4">
              {variants.map((variant: any, index) => (
                <div key={index} className="flex gap-4 items-end bg-secondary-50 p-4 rounded-2xl group transition-all hover:bg-white hover:ring-1 hover:ring-primary-500 hover:shadow-md">
                  <div className="flex-[2]">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-secondary-400 mb-1 block ml-1">Volume (e.g., 100ml)</label>
                    <input type="text" value={variant.name} onChange={e => updateVariant(index, 'name', e.target.value)} className="w-full p-2.5 bg-white border border-secondary-100 rounded-xl text-sm font-bold placeholder:font-normal" placeholder="100ml" />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-secondary-400 mb-1 block ml-1">Price (GHS)</label>
                    <input
                      type="number"
                      value={Number.isNaN(variant.price) ? '' : variant.price}
                      onChange={e => {
                        const val = e.target.value;
                        updateVariant(index, 'price', val === '' ? NaN : parseFloat(val));
                      }}
                      className="w-full p-2.5 bg-white border border-secondary-100 rounded-xl text-sm font-bold"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-secondary-400 mb-1 block ml-1">Deducts</label>
                    <input
                      type="number"
                      value={Number.isNaN(variant.stock_deduction) ? '' : variant.stock_deduction}
                      onChange={e => {
                        const val = e.target.value;
                        updateVariant(index, 'stock_deduction', val === '' ? NaN : parseInt(val));
                      }}
                      className="w-full p-2.5 bg-white border border-secondary-100 rounded-xl text-sm font-bold"
                    />
                  </div>
                  {variants.length > 1 && (
                    <button type="button" onClick={() => removeVariant(index)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: SIDEBAR ASSETS */}
        <div className="lg:col-span-1 space-y-8">

          {/* IMAGE BOX */}
          <div className="bg-white p-6 rounded-3xl border border-secondary-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Star size={16} className="text-primary-600" />
              <h3 className="font-bold text-secondary-900 uppercase tracking-widest text-[10px]">Aesthetic</h3>
            </div>
            <ImageUpload value={image} onChange={setImage} onRemove={() => setImage('')} />
            <p className="text-[10px] text-secondary-400 italic text-center px-4 leading-relaxed">Ensure photography mirrors the luxury of the essence.</p>
          </div>

          {/* PROMOTION BOX */}
          <div className="bg-white p-6 rounded-3xl border border-secondary-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-secondary-50 pb-4">
              <input
                type="checkbox"
                id="isFeatured"
                checked={isFeatured}
                onChange={e => setIsFeatured(e.target.checked)}
                className="w-5 h-5 text-primary-600 rounded-lg focus:ring-primary-500 border-secondary-300"
              />
              <label htmlFor="isFeatured" className="font-bold text-secondary-900 cursor-pointer select-none text-xs uppercase tracking-wider">
                Feature in Salon
              </label>
            </div>

            {isFeatured && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-amber-800 mb-2 flex items-center gap-1">
                      <Percent size={12} /> Discount (%)
                    </label>
                    <input
                      type="number"
                      value={Number.isNaN(discountPercent) ? '' : discountPercent}
                      onChange={e => {
                        const val = e.target.value;
                        setDiscountPercent(val === '' ? NaN : parseFloat(val));
                      }}
                      className="w-full p-2.5 bg-white border border-amber-200 rounded-xl text-amber-900 font-bold outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="0"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-amber-800 mb-2 flex items-center gap-1">
                      <Calendar size={12} /> Expiry
                    </label>
                    <input
                      type="datetime-local"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="w-full p-2.5 bg-white border border-amber-200 rounded-xl text-[10px] font-bold text-amber-900 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* INVENTORY BOX (CREATE MODE ONLY) */}
          {!isEditMode && (
            <div className="bg-blue-50 p-6 rounded-3xl border border-blue-200 shadow-sm space-y-6">
              <h3 className="font-bold text-blue-900 uppercase tracking-widest text-[10px]">Vault Control (Inventory)</h3>
              <div>
                <label className="block text-[10px] font-bold uppercase text-blue-700 mb-2 ml-1">Current Flacons</label>
                <input
                  type="number"
                  value={Number.isNaN(initialStock) ? '' : initialStock}
                  onChange={e => {
                    const val = e.target.value;
                    setInitialStock(val === '' ? NaN : parseInt(val));
                  }}
                  className="w-full p-3 bg-white border border-blue-100 rounded-2xl text-xl font-mono font-bold text-blue-900"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-blue-700 mb-2 ml-1">Low Essence Alert</label>
                <input
                  type="number"
                  value={Number.isNaN(threshold) ? '' : threshold}
                  onChange={e => {
                    const val = e.target.value;
                    setThreshold(val === '' ? NaN : parseInt(val));
                  }}
                  className="w-full p-3 bg-white border border-blue-100 rounded-2xl font-bold text-blue-900"
                  placeholder="10"
                />
              </div>
            </div>
          )}
        </div>

      </div>
    </form>
  );
};

export default ProductForm;
