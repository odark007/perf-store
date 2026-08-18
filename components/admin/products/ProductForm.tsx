'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Save,
  Plus,
  Trash2,
  ArrowLeft,
  Calendar,
  Percent,
  Droplets,
  Wind,
  Star,
  Info,
  Package,
  Cpu,
  Truck,
  Tag
} from 'lucide-react';
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

const AGE_RATINGS = ['3+', '5+', '6+', '8+', '10+', '12+', '14+'];

const TOY_FEATURE_TAGS = [
  { value: 'camera', label: 'Camera' },
  { value: 'vr', label: 'VR Ready' },
  { value: 'app', label: 'App-Controlled' },
  { value: 'ai', label: 'AI-Powered' },
  { value: 'voice', label: 'Voice Control' },
  { value: 'rechargeable', label: 'Rechargeable' },
];

const ProductForm: React.FC<ProductFormProps> = ({ categories, initialData }) => {
  const router = useRouter();
  const params = useParams();
  const storeSlug = (params?.store as string) || 'derme';
  const isToyShop = storeSlug === 'play-time';
  const [loading, setLoading] = useState(false);
  const isEditMode = !!initialData;

  // Basic State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [image, setImage] = useState('');
  const [brand, setBrand] = useState(isToyShop ? "Tomorrow's Playground" : '');

  // Perfume Attributes
  const [concentration, setConcentration] = useState('EDP');
  const [scentFamily, setScentFamily] = useState('Floral');
  const [gender, setGender] = useState('unisex');
  const [longevity, setLongevity] = useState('6-8hrs');
  const [sillage, setSillage] = useState('Moderate');
  const [topNotes, setTopNotes] = useState('');
  const [heartNotes, setHeartNotes] = useState('');
  const [baseNotes, setBaseNotes] = useState('');

  // Toy Attributes
  const [ageRating, setAgeRating] = useState('6+');
  const [mfrPart, setMfrPart] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState<number | ''>('');
  const [cogs, setCogs] = useState<number | ''>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Toy Specs
  const [connectivity, setConnectivity] = useState('');
  const [companionApp, setCompanionApp] = useState('');
  const [batteryLife, setBatteryLife] = useState('');
  const [cameraSpec, setCameraSpec] = useState('');
  const [topSpeed, setTopSpeed] = useState('');
  const [materials, setMaterials] = useState('');

  // Toy Shipping & Box
  const [unitLength, setUnitLength] = useState<number | ''>('');
  const [unitWidth, setUnitWidth] = useState<number | ''>('');
  const [unitHeight, setUnitHeight] = useState<number | ''>('');
  const [netWeightKg, setNetWeightKg] = useState<number | ''>('');
  const [cartonQty, setCartonQty] = useState<number | ''>(2);
  const [cartonLength, setCartonLength] = useState<number | ''>('');
  const [cartonWidth, setCartonWidth] = useState<number | ''>('');
  const [cartonHeight, setCartonHeight] = useState<number | ''>('');
  const [grossWeightKg, setGrossWeightKg] = useState<number | ''>('');
  const [packagingType, setPackagingType] = useState('Sealed Box');

  // Promotion State
  const [isFeatured, setIsFeatured] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Variants & Inventory
  const [variants, setVariants] = useState([
    { name: isToyShop ? 'Single Unit' : '100ml', type: 'single', price: 0, stock_deduction: 1 },
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

      // Toy Fields
      setAgeRating(initialData.age_rating || '6+');
      setMfrPart(initialData.mfr_part || '');
      setCompareAtPrice(initialData.compare_at_price ?? '');
      setCogs(initialData.cogs ?? '');
      setSelectedTags(initialData.tags || []);

      if (initialData.specs) {
        setConnectivity(initialData.specs['Connectivity'] || '');
        setCompanionApp(initialData.specs['Companion App'] || '');
        setBatteryLife(initialData.specs['Battery Life'] || '');
        setCameraSpec(initialData.specs['Camera'] || '');
        setTopSpeed(initialData.specs['Top Speed'] || '');
        setMaterials(initialData.specs['Materials'] || '');
      }

      if (initialData.shipping_info) {
        const s = initialData.shipping_info;
        setUnitLength(s.unitDimensionsCm?.l ?? '');
        setUnitWidth(s.unitDimensionsCm?.w ?? '');
        setUnitHeight(s.unitDimensionsCm?.h ?? '');
        setNetWeightKg(s.netWeightKg ?? '');
        setCartonQty(s.cartonQty ?? 2);
        setCartonLength(s.cartonDimensionsCm?.l ?? '');
        setCartonWidth(s.cartonDimensionsCm?.w ?? '');
        setCartonHeight(s.cartonDimensionsCm?.h ?? '');
        setGrossWeightKg(s.grossWeightKg ?? '');
        setPackagingType(s.packaging ?? 'Sealed Box');
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

  const handleTagToggle = (tagVal: string) => {
    setSelectedTags(prev =>
      prev.includes(tagVal) ? prev.filter(t => t !== tagVal) : [...prev, tagVal]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return alert("Please upload a product image");

    setLoading(true);

    // Build specs object for toys
    const specsObj: Record<string, string> = {};
    if (connectivity) specsObj['Connectivity'] = connectivity;
    if (companionApp) specsObj['Companion App'] = companionApp;
    if (batteryLife) specsObj['Battery Life'] = batteryLife;
    if (cameraSpec) specsObj['Camera'] = cameraSpec;
    if (topSpeed) specsObj['Top Speed'] = topSpeed;
    if (materials) specsObj['Materials'] = materials;

    // Build shipping object for toys
    const shippingObj = {
      unitDimensionsCm: {
        l: Number(unitLength) || 0,
        w: Number(unitWidth) || 0,
        h: Number(unitHeight) || 0
      },
      netWeightKg: Number(netWeightKg) || 0,
      cartonQty: Number(cartonQty) || 2,
      cartonDimensionsCm: {
        l: Number(cartonLength) || 0,
        w: Number(cartonWidth) || 0,
        h: Number(cartonHeight) || 0
      },
      grossWeightKg: Number(grossWeightKg) || 0,
      packaging: packagingType
    };

    const productData = {
      title,
      description,
      category_id: categoryId,
      base_image_url: image,
      brand: brand || (isToyShop ? "Tomorrow's Playground" : 'Luxury Fragrance'),
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

      // Toy Fields
      age_rating: ageRating,
      mfr_part: mfrPart,
      tags: selectedTags,
      specs: specsObj,
      shipping_info: shippingObj,
      compare_at_price: compareAtPrice === '' ? null : Number(compareAtPrice),
      cogs: cogs === '' ? null : Number(cogs),

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
      alert(isEditMode ? "Product Updated Successfully!" : "Product Created Successfully!");
      router.push(`/admin/${storeSlug}/products`);
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
              {isEditMode ? `Edit ${isToyShop ? 'Toy' : 'Fragrance'}` : `Add New ${isToyShop ? 'Toy' : 'Fragrance'}`}
            </h1>
            <p className="text-xs text-secondary-500 font-medium font-mono">
              Store: <strong>{storeSlug}</strong>
            </p>
          </div>
        </div>
        <Button type="submit" isLoading={loading} leftIcon={<Save size={18} />} className="shadow-lg shadow-primary-600/20 px-8">
          {isEditMode ? 'Save Changes' : 'Publish Product'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* LEFT: MAIN FORM CONTENT */}
        <div className="lg:col-span-3 space-y-8">
          {/* SECTION 1: IDENTITY */}
          <div className="bg-white p-8 rounded-3xl border border-secondary-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Info size={16} className="text-primary-600" />
              <h3 className="font-bold text-secondary-900 uppercase tracking-widest text-[10px]">Product Identity</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-secondary-600">Product Title</label>
                <input
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full p-3 bg-secondary-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                  placeholder={isToyShop ? 'e.g., VR Alloy Crawler RC Car with Camera' : 'e.g., Midnight Oud'}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-secondary-600">Brand / Maker</label>
                <input
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  className="w-full p-3 bg-secondary-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                  placeholder={isToyShop ? "Tomorrow's Playground" : 'e.g., Tom Ford'}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-secondary-600">Category</label>
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="w-full p-3 bg-secondary-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-medium outline-none"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {isToyShop && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-secondary-600">Age Rating</label>
                    <select
                      value={ageRating}
                      onChange={e => setAgeRating(e.target.value)}
                      className="w-full p-3 bg-secondary-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-medium outline-none"
                    >
                      {AGE_RATINGS.map(a => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-secondary-600">Manufacturer Part # (MfrPart)</label>
                    <input
                      value={mfrPart}
                      onChange={e => setMfrPart(e.target.value)}
                      className="w-full p-3 bg-secondary-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-medium font-mono"
                      placeholder="e.g., TY5, TY8"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-secondary-600">Feature Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {TOY_FEATURE_TAGS.map(t => {
                        const checked = selectedTags.includes(t.value);
                        return (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => handleTagToggle(t.value)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold transition-all ${
                              checked
                                ? 'bg-primary-600 text-white shadow-sm'
                                : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                            }`}
                          >
                            {checked ? '✓ ' : '+ '}{t.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-secondary-600">Description</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full p-4 bg-secondary-50 border-none rounded-3xl focus:ring-2 focus:ring-primary-500 transition-all font-medium leading-relaxed"
                  placeholder="Detailed product features, capabilities, and highlights..."
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: TOY SPECS OR PERFUME PYRAMID */}
          {isToyShop ? (
            <div className="bg-white p-8 rounded-3xl border border-secondary-200 shadow-sm space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Cpu size={16} className="text-primary-600" />
                <h3 className="font-bold text-secondary-900 uppercase tracking-widest text-[10px]">Technical Specifications</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-secondary-600">Connectivity</label>
                  <input
                    value={connectivity}
                    onChange={e => setConnectivity(e.target.value)}
                    className="w-full p-3 bg-secondary-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                    placeholder="e.g., Wi-Fi (App), 2.4GHz Remote"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-secondary-600">Companion App</label>
                  <input
                    value={companionApp}
                    onChange={e => setCompanionApp(e.target.value)}
                    className="w-full p-3 bg-secondary-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                    placeholder="e.g., Required for camera + VR mode / Not required"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-secondary-600">Battery Life</label>
                  <input
                    value={batteryLife}
                    onChange={e => setBatteryLife(e.target.value)}
                    className="w-full p-3 bg-secondary-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                    placeholder="e.g., ~25 min drive / 90 min charge"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-secondary-600">Camera Spec</label>
                  <input
                    value={cameraSpec}
                    onChange={e => setCameraSpec(e.target.value)}
                    className="w-full p-3 bg-secondary-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                    placeholder="e.g., 720p live FPV"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-secondary-600">Top Speed</label>
                  <input
                    value={topSpeed}
                    onChange={e => setTopSpeed(e.target.value)}
                    className="w-full p-3 bg-secondary-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                    placeholder="e.g., 12 km/h or 45 km/h"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-secondary-600">Materials</label>
                  <input
                    value={materials}
                    onChange={e => setMaterials(e.target.value)}
                    className="w-full p-3 bg-secondary-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                    placeholder="e.g., Alloy chassis, rubber tires, ABS shell"
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* PERFUME PYRAMID */}
              <div className="bg-white p-8 rounded-3xl border border-secondary-200 shadow-sm space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets size={16} className="text-primary-600" />
                  <h3 className="font-bold text-secondary-900 uppercase tracking-widest text-[10px]">Olfactory Pyramid</h3>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-primary-600 ml-1">Top Notes</label>
                    <input value={topNotes} onChange={e => setTopNotes(e.target.value)} className="w-full p-3 bg-secondary-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 font-medium" placeholder="Bergamot, Lemon, Mint..." />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-primary-600 ml-1">Heart Notes</label>
                    <input value={heartNotes} onChange={e => setHeartNotes(e.target.value)} className="w-full p-3 bg-secondary-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 font-medium" placeholder="Lavender, Rose, Cinnamon..." />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-primary-600 ml-1">Base Notes</label>
                    <input value={baseNotes} onChange={e => setBaseNotes(e.target.value)} className="w-full p-3 bg-secondary-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 font-medium" placeholder="Sandalwood, Musk, Amber..." />
                  </div>
                </div>
              </div>

              {/* PERFUME PERFORMANCE */}
              <div className="bg-white p-8 rounded-3xl border border-secondary-200 shadow-sm space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <Wind size={16} className="text-primary-600" />
                  <h3 className="font-bold text-secondary-900 uppercase tracking-widest text-[10px]">Technical Performance</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-secondary-600">Concentration</label>
                    <select value={concentration} onChange={e => setConcentration(e.target.value)} className="w-full p-3 bg-secondary-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 font-medium outline-none">
                      {CONCENTRATIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-secondary-600">Scent Family</label>
                    <select value={scentFamily} onChange={e => setScentFamily(e.target.value)} className="w-full p-3 bg-secondary-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 font-medium outline-none">
                      {SCENT_FAMILIES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-secondary-600">Longevity</label>
                    <select value={longevity} onChange={e => setLongevity(e.target.value)} className="w-full p-3 bg-secondary-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 font-medium outline-none">
                      {LONGEVITY_OPTS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-secondary-600">Sillage</label>
                    <select value={sillage} onChange={e => setSillage(e.target.value)} className="w-full p-3 bg-secondary-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 font-medium outline-none">
                      {SILLAGE_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-secondary-600">Gender</label>
                    <select value={gender} onChange={e => setGender(e.target.value)} className="w-full p-3 bg-secondary-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 font-medium outline-none">
                      {GENDER_OPTS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* SECTION 3: SHIPPING & PHYSICALS (TOY SHOP ONLY) */}
          {isToyShop && (
            <div className="bg-white p-8 rounded-3xl border border-secondary-200 shadow-sm space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Truck size={16} className="text-primary-600" />
                <h3 className="font-bold text-secondary-900 uppercase tracking-widest text-[10px]">Shipping & Physicals (Spec Sheet)</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-secondary-600">Unit Dimensions (L × W × H cm)</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="number" placeholder="L" value={unitLength} onChange={e => setUnitLength(e.target.value === '' ? '' : parseFloat(e.target.value))} className="p-2.5 bg-secondary-50 rounded-xl text-xs font-bold" />
                    <input type="number" placeholder="W" value={unitWidth} onChange={e => setUnitWidth(e.target.value === '' ? '' : parseFloat(e.target.value))} className="p-2.5 bg-secondary-50 rounded-xl text-xs font-bold" />
                    <input type="number" placeholder="H" value={unitHeight} onChange={e => setUnitHeight(e.target.value === '' ? '' : parseFloat(e.target.value))} className="p-2.5 bg-secondary-50 rounded-xl text-xs font-bold" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-secondary-600">Net Weight (N.W. kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g., 1.25"
                    value={netWeightKg}
                    onChange={e => setNetWeightKg(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full p-2.5 bg-secondary-50 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-secondary-600">Carton Qty (pcs)</label>
                  <input
                    type="number"
                    placeholder="e.g., 2"
                    value={cartonQty}
                    onChange={e => setCartonQty(e.target.value === '' ? '' : parseInt(e.target.value))}
                    className="w-full p-2.5 bg-secondary-50 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-secondary-600">Carton Dimensions (L × W × H cm)</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="number" placeholder="L" value={cartonLength} onChange={e => setCartonLength(e.target.value === '' ? '' : parseFloat(e.target.value))} className="p-2.5 bg-secondary-50 rounded-xl text-xs font-bold" />
                    <input type="number" placeholder="W" value={cartonWidth} onChange={e => setCartonWidth(e.target.value === '' ? '' : parseFloat(e.target.value))} className="p-2.5 bg-secondary-50 rounded-xl text-xs font-bold" />
                    <input type="number" placeholder="H" value={cartonHeight} onChange={e => setCartonHeight(e.target.value === '' ? '' : parseFloat(e.target.value))} className="p-2.5 bg-secondary-50 rounded-xl text-xs font-bold" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-secondary-600">Carton Gross Weight (G.W. kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g., 3.1"
                    value={grossWeightKg}
                    onChange={e => setGrossWeightKg(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full p-2.5 bg-secondary-50 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-secondary-600">Packaging Type</label>
                  <input
                    placeholder="Sealed Box / Display Box"
                    value={packagingType}
                    onChange={e => setPackagingType(e.target.value)}
                    className="w-full p-2.5 bg-secondary-50 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: VARIANTS */}
          <div className="bg-white p-8 rounded-3xl border border-secondary-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Package size={16} className="text-primary-600" />
                <h3 className="font-bold text-secondary-900 uppercase tracking-widest text-[10px]">Pricing & Variants</h3>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={addVariant} leftIcon={<Plus size={14} />} className="rounded-full px-4 border-dashed border-2 hover:border-primary-500">
                Add Variant
              </Button>
            </div>

            <div className="space-y-4">
              {variants.map((variant: any, index) => (
                <div key={index} className="flex gap-4 items-end bg-secondary-50 p-4 rounded-2xl group transition-all hover:bg-white hover:ring-1 hover:ring-primary-500 hover:shadow-md">
                  <div className="flex-[2]">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-secondary-400 mb-1 block ml-1">
                      {isToyShop ? 'Option / Edition Name' : 'Volume (e.g., 100ml)'}
                    </label>
                    <input
                      type="text"
                      value={variant.name}
                      onChange={e => updateVariant(index, 'name', e.target.value)}
                      className="w-full p-2.5 bg-white border border-secondary-100 rounded-xl text-sm font-bold placeholder:font-normal"
                      placeholder={isToyShop ? 'Single Unit (Standard)' : '100ml'}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-secondary-400 mb-1 block ml-1">Price (GHS)</label>
                    <input
                      type="number"
                      step="0.01"
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
              <h3 className="font-bold text-secondary-900 uppercase tracking-widest text-[10px]">Product Photo</h3>
            </div>
            <ImageUpload value={image} onChange={setImage} onRemove={() => setImage('')} />
            <p className="text-[10px] text-secondary-400 italic text-center px-4 leading-relaxed">
              Upload clear, high-resolution photography.
            </p>
          </div>

          {/* FINANCIALS (MSRP / COGS) */}
          {isToyShop && (
            <div className="bg-white p-6 rounded-3xl border border-secondary-200 shadow-sm space-y-4">
              <h3 className="font-bold text-secondary-900 uppercase tracking-widest text-[10px]">Pricing & Margins</h3>
              <div>
                <label className="block text-[10px] font-bold uppercase text-secondary-600 mb-1">Compare-At Price (GH₵)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 99.99"
                  value={compareAtPrice}
                  onChange={e => setCompareAtPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full p-2.5 bg-secondary-50 rounded-xl text-sm font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-secondary-600 mb-1">Cost per Item (COGS GH₵)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 34.00"
                  value={cogs}
                  onChange={e => setCogs(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full p-2.5 bg-secondary-50 rounded-xl text-sm font-bold"
                />
              </div>
            </div>
          )}

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
                Feature On Homepage
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
              <h3 className="font-bold text-blue-900 uppercase tracking-widest text-[10px]">Inventory & Stock</h3>
              <div>
                <label className="block text-[10px] font-bold uppercase text-blue-700 mb-2 ml-1">Initial Stock Level</label>
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
                <label className="block text-[10px] font-bold uppercase text-blue-700 mb-2 ml-1">Low Stock Alert Threshold</label>
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
