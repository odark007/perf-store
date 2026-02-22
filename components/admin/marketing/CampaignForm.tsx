'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Image as ImageIcon, Youtube, Link as LinkIcon } from 'lucide-react';
import Button from '@/components/ui/Button';
import ImageUpload from '@/components/admin/input/ImageUpload';
import { createCampaign, updateCampaign } from '@/app/actions/marketing';

interface Props {
  initialData?: any;
  featuredProducts: any[];
  categories: any[];
}

const CampaignForm: React.FC<Props> = ({ initialData, featuredProducts, categories }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEditMode = !!initialData;
  
  // State
  const [mediaType, setMediaType] = useState<'image' | 'youtube'>('image');
  const [mediaUrl, setMediaUrl] = useState('');
  const [ctaLink, setCtaLink] = useState('');
  const [isActive, setIsActive] = useState(true);
  
  // Link Builder State
  const [linkType, setLinkType] = useState('custom'); // custom | product | category

  // Initial Load
  useEffect(() => {
    if (initialData) {
      setMediaType(initialData.media_type);
      setMediaUrl(initialData.media_url);
      setCtaLink(initialData.cta_link);
      setIsActive(initialData.is_active);
    }
  }, [initialData]);

  // Handle Smart Link Selection
  const handleSmartLinkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value) return;
    setCtaLink(value);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!mediaUrl) return alert("Please provide an image or YouTube link");

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set('media_type', mediaType);
    formData.set('media_url', mediaUrl);
    formData.set('cta_link', ctaLink); // Use controlled state
    formData.set('is_active', String(isActive));

    let res;
    if (isEditMode) {
      res = await updateCampaign(initialData.id, formData);
    } else {
      res = await createCampaign(formData);
    }

    setLoading(false);

    if (res.error) {
      alert(res.error);
    } else {
      alert(isEditMode ? "Campaign Updated!" : "Campaign Created!");
      router.push('/admin/marketing');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-secondary-900">
            {isEditMode ? 'Edit Campaign' : 'New Campaign'}
          </h1>
        </div>
        <Button type="submit" isLoading={loading} leftIcon={<Save size={18} />}>
          {isEditMode ? 'Update' : 'Launch'}
        </Button>
      </div>

      <div className="bg-white p-6 rounded-xl border border-secondary-200 shadow-sm space-y-6">
        
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-secondary-900 mb-1">Headline</label>
            <input 
              name="title" 
              required 
              defaultValue={initialData?.title}
              className="w-full p-2 border rounded-lg text-lg font-medium" 
              placeholder="e.g. Valentine's Special" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-secondary-900 mb-1">Copy</label>
            <textarea 
              name="description" 
              rows={3} 
              defaultValue={initialData?.description}
              className="w-full p-2 border rounded-lg" 
              placeholder="Short persuasive text..." 
            />
          </div>
        </div>

        {/* Media Selector */}
        <div>
          <label className="block text-sm font-bold text-secondary-900 mb-3">Media</label>
          <div className="flex gap-4 mb-4">
            <button 
              type="button"
              onClick={() => setMediaType('image')}
              className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${mediaType === 'image' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-secondary-200 hover:bg-secondary-50'}`}
            >
              <ImageIcon size={24} />
              <span className="font-bold">Image</span>
            </button>
            <button 
              type="button"
              onClick={() => setMediaType('youtube')}
              className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${mediaType === 'youtube' ? 'border-red-500 bg-red-50 text-red-700' : 'border-secondary-200 hover:bg-secondary-50'}`}
            >
              <Youtube size={24} />
              <span className="font-bold">YouTube</span>
            </button>
          </div>

          <div className="p-4 bg-secondary-50 rounded-xl border border-secondary-200">
            {mediaType === 'image' ? (
              <ImageUpload 
                value={mediaUrl} 
                onChange={setMediaUrl} 
                onRemove={() => setMediaUrl('')} 
                bucket="marketing-assets"
                folder="banners"
              />
            ) : (
              <input 
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full p-3 border rounded-lg"
              />
            )}
          </div>
        </div>

        {/* Smart Link Builder */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-secondary-900 mb-1">Button Text</label>
            <input 
              name="cta_text" 
              required 
              defaultValue={initialData?.cta_text}
              placeholder="e.g. Shop Now" 
              className="w-full p-2 border rounded-lg" 
            />
          </div>
          
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 md:col-span-2">
            <h4 className="flex items-center gap-2 text-sm font-bold text-blue-800 mb-3">
              <LinkIcon size={16} /> Button Destination
            </h4>
            
            <div className="flex gap-4 mb-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="linkType" checked={linkType === 'custom'} onChange={() => setLinkType('custom')} />
                Custom URL
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="linkType" checked={linkType === 'product'} onChange={() => setLinkType('product')} />
                Featured Product
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="linkType" checked={linkType === 'category'} onChange={() => setLinkType('category')} />
                Category
              </label>
            </div>

            {linkType === 'custom' && (
              <input 
                value={ctaLink} 
                onChange={(e) => setCtaLink(e.target.value)} 
                placeholder="/shop" 
                className="w-full p-2 border rounded-lg"
              />
            )}

            {linkType === 'product' && (
              <select onChange={handleSmartLinkChange} className="w-full p-2 border rounded-lg bg-white">
                <option value="">Select a Featured Product...</option>
                {featuredProducts.map(p => (
                  <option key={p.id} value={`/products/${p.slug}`}>
                    {p.title}
                  </option>
                ))}
              </select>
            )}

            {linkType === 'category' && (
              <select onChange={handleSmartLinkChange} className="w-full p-2 border rounded-lg bg-white">
                <option value="">Select a Category...</option>
                {categories.map(c => (
                  <option key={c.id} value={`/shop?category=${c.slug}`}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
            
            <p className="text-xs text-blue-600 mt-2 font-mono">Preview: {ctaLink}</p>
          </div>
        </div>

        {/* Scheduling */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-secondary-100">
           <div className="flex items-center">
             <label className="flex items-center gap-2 cursor-pointer">
               <input 
                 type="checkbox" 
                 checked={isActive} 
                 onChange={(e) => setIsActive(e.target.checked)} 
                 className="w-5 h-5 text-primary-600 rounded" 
               />
               <span className="font-bold text-secondary-900">Active</span>
             </label>
           </div>
           <div>
             <label className="block text-xs font-bold text-secondary-500 mb-1">Start (Optional)</label>
             <input 
               type="datetime-local" 
               name="start_at" 
               defaultValue={initialData?.start_at ? new Date(initialData.start_at).toISOString().slice(0, 16) : ''}
               className="w-full p-2 border rounded-lg text-sm" 
             />
           </div>
           <div>
             <label className="block text-xs font-bold text-secondary-500 mb-1">End (Optional)</label>
             <input 
               type="datetime-local" 
               name="end_at" 
               defaultValue={initialData?.end_at ? new Date(initialData.end_at).toISOString().slice(0, 16) : ''}
               className="w-full p-2 border rounded-lg text-sm" 
             />
           </div>
        </div>

      </div>
    </form>
  );
};

export default CampaignForm;