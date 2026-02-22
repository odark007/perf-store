import React from 'react';
import { createClient } from '@/lib/supabase/server';
import BlogCard from '@/components/blog/BlogCard';
import BlogToolbar from '@/components/blog/BlogToolbar';
import Pagination from '@/components/ui/Pagination';
import { SearchX } from 'lucide-react';

export const metadata = {
  title: 'Blog | LiquorShop Ghana',
  description: 'Latest news, cocktail recipes, and events from LiquorShop.',
};

export const dynamic = 'force-dynamic'; // Ensure fresh search results

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BlogListingPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  // 1. Parse Params
  const page = Number(params?.page) || 1;
  const searchTerm = (params?.q as string) || '';
  const LIMIT = 9; // 3x3 Grid

  const from = (page - 1) * LIMIT;
  const to = from + LIMIT - 1;

  // 2. Build Query
  let query = supabase
    .from('posts')
    .select('*', { count: 'exact' })
    .eq('is_published', true);

  // Search Logic (Title OR Excerpt)
  if (searchTerm) {
    query = query.or(`title.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%`);
  }

  // 3. Fetch Data with Pagination
  const { data: posts, count, error } = await query
    .order('published_at', { ascending: false })
    .range(from, to);

  const totalPages = count ? Math.ceil(count / LIMIT) : 1;

  if (error) {
    console.error("Blog Error:", error);
    return <div className="py-20 text-center">Error loading posts.</div>;
  }

  return (
    <div className="container-custom py-12 md:py-20">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-4xl font-display font-bold text-secondary-900 mb-4">The Cellar Blog</h1>
        <p className="text-lg text-secondary-600">
          Discover cocktail recipes, wine guides, and the latest stories.
        </p>
      </div>

      {/* Search Toolbar */}
      <BlogToolbar />

      {/* Content */}
      {posts && posts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {posts.map((post: any) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
          
          {/* Pagination */}
          <Pagination totalPages={totalPages} />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-secondary-50 rounded-2xl border border-dashed border-secondary-200">
          <div className="bg-white p-4 rounded-full mb-4 shadow-sm">
            <SearchX size={32} className="text-secondary-400" />
          </div>
          <h3 className="text-xl font-bold text-secondary-900 mb-2">No articles found</h3>
          <p className="text-secondary-500 max-w-md text-center">
            We couldn't find any posts matching "{searchTerm}". Try checking for typos or using different keywords.
          </p>
        </div>
      )}
    </div>
  );
}