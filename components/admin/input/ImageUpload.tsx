'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove: () => void;
  folder?: string;
  bucket?: string; // <-- New Prop
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  value, 
  onChange, 
  onRemove,
  folder = 'uploads',
  bucket = 'product-images' // Default to product bucket
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processUpload = async (file: File) => {
    setIsUploading(true);
    try {
      // 1. Compress
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);
      
      // 2. Upload
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Use dynamic bucket name
      const { error: uploadError } = await supabase.storage
        .from(bucket) 
        .upload(fileName, compressedFile);

      if (uploadError) throw uploadError;

      // 3. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      // 4. Ghost File Cleanup (Client-side attempt during replacement)
      if (value && value.includes(bucket)) {
        try {
          const oldPath = value.split(`/${bucket}/`)[1];
          if (oldPath) await supabase.storage.from(bucket).remove([oldPath]);
        } catch (err) {
          console.warn("Could not auto-cleanup old image", err);
        }
      }

      onChange(publicUrl);

    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      processUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {value ? (
        <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden border border-secondary-200 group bg-secondary-50">
          <Image 
            src={value} 
            alt="Uploaded image" 
            fill 
            className="object-contain md:object-cover" 
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={onRemove}
              className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
              title="Remove Image"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`
            w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors
            ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-secondary-300 hover:bg-secondary-50'}
          `}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && processUpload(e.target.files[0])}
          />
          
          {isUploading ? (
            <div className="flex flex-col items-center text-primary-600">
              <Loader2 size={32} className="animate-spin mb-2" />
              <span className="text-sm font-medium">Compressing & Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-secondary-500 px-4 text-center">
              <div className="p-4 bg-secondary-100 rounded-full mb-3">
                <Upload size={24} />
              </div>
              <p className="text-base font-medium text-secondary-900">Click to upload or drag and drop</p>
              <p className="text-sm mt-1">SVG, PNG, JPG or GIF (max. 50MB)</p>
            </div>
          )}
        </div>
      )}

      {/* URL Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <ImageIcon className="absolute left-3 top-2.5 text-secondary-400" size={16} />
          <input 
            type="text" 
            placeholder="Or paste image URL..." 
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-secondary-50 border border-secondary-200 rounded-lg focus:border-primary-500 outline-none"
          />
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;