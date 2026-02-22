import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase.from('posts').select('*').eq('slug', slug).single();

  if (!post) return { title: 'Not Found' };

  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt,
    openGraph: {
      images: [post.cover_image_url],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!post) notFound();

  return (
    <div className="bg-white pb-20">
      
      {/* 1. Hero Image */}
      <div className="relative h-[400px] md:h-[500px] w-full">
        <Image 
          src={post.cover_image_url || '/placeholder.jpg'} 
          alt={post.title} 
          fill 
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 text-white container-custom">
           <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-secondary-200 hover:text-white mb-6 transition-colors">
             <ArrowLeft size={16} /> Back to Blog
           </Link>
           <h1 className="text-3xl md:text-5xl font-display font-bold max-w-4xl leading-tight mb-4">
             {post.title}
           </h1>
           <div className="flex items-center gap-2 text-secondary-300 text-sm">
             <Calendar size={16} />
             {new Date(post.published_at).toLocaleDateString('en-GB', { dateStyle: 'long' })}
           </div>
        </div>
      </div>

      {/* 2. Content */}
      <div className="container-custom mt-12 max-w-4xl">
        <div className="prose prose-lg prose-slate max-w-none 
          prose-headings:font-display prose-headings:font-bold prose-headings:text-secondary-900 
          prose-p:text-secondary-700 prose-p:leading-relaxed
          prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline
          prose-img:rounded-xl prose-img:shadow-lg
          prose-blockquote:border-l-primary-500 prose-blockquote:bg-secondary-50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg
        ">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
      </div>

    </div>
  );
}