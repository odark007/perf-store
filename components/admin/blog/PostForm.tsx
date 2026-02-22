'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import ImageUpload from '@/components/admin/input/ImageUpload';
import RichTextEditor from './RichTextEditor';
import { createPost, updatePost } from '@/app/actions/blog';

interface Props {
  initialData?: any;
}

const PostForm: React.FC<Props> = ({ initialData }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEditMode = !!initialData;

  const [title, setTitle] = useState(initialData?.title || '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [image, setImage] = useState(initialData?.cover_image_url || '');
  const [isPublished, setIsPublished] = useState(initialData?.is_published || false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return alert("Please upload a cover image");
    if (!content) return alert("Please write some content");

    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('excerpt', excerpt);
    formData.append('content', content);
    formData.append('cover_image_url', image);
    formData.append('is_published', String(isPublished));

    let res;
    if (isEditMode) {
      res = await updatePost(initialData.id, formData);
    } else {
      res = await createPost(formData);
    }

    setLoading(false);

    if (res.error) {
      alert(res.error);
    } else {
      alert(isEditMode ? "Post Updated" : "Post Created");
      router.push('/admin/blog');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-secondary-900">
            {isEditMode ? 'Edit Post' : 'New Blog Post'}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={isPublished} 
              onChange={e => setIsPublished(e.target.checked)}
              className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
            />
            <span className="font-medium text-secondary-900">Publish Immediately</span>
          </label>
          <Button type="submit" isLoading={loading} leftIcon={<Save size={18} />}>
            Save Post
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-secondary-200 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-bold text-secondary-900 mb-1">Article Title</label>
              <input 
                required 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                className="w-full p-2 border rounded-lg text-lg font-medium"
                placeholder="e.g. The 5 Best Wines for Christmas" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-secondary-900 mb-1">Short Excerpt (SEO)</label>
              <textarea 
                required 
                rows={3} 
                value={excerpt} 
                onChange={e => setExcerpt(e.target.value)} 
                className="w-full p-2 border rounded-lg text-sm text-secondary-600"
                placeholder="A brief summary shown on the blog list page..." 
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-secondary-900 mb-2">Content</label>
              <RichTextEditor content={content} onChange={setContent} />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-secondary-200 shadow-sm">
            <h3 className="font-bold text-secondary-900 mb-4">Cover Image</h3>
            <ImageUpload 
              value={image} 
              onChange={setImage} 
              onRemove={() => setImage('')} 
              folder="blog"
              bucket="blog-images"
            />
          </div>
        </div>

      </div>
    </form>
  );
};

export default PostForm;