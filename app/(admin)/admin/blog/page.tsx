import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Edit2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import BlogToolbar from '@/components/admin/blog/BlogToolbar';
import DeletePostButton from '@/components/admin/blog/DeletePostButton';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminBlogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  // 1. Parse Params
  const page = Number(params?.page) || 1;
  const limit = Number(params?.limit) || 10;
  const searchTerm = (params?.q as string) || '';
  const statusFilter = (params?.status as string) || 'all';

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // 2. Build Query
  let query = supabase
    .from('posts')
    .select('*', { count: 'exact' });

  if (searchTerm) {
    query = query.ilike('title', `%${searchTerm}%`);
  }

  if (statusFilter !== 'all') {
    const isPublished = statusFilter === 'published';
    query = query.eq('is_published', isPublished);
  }

  // 3. Fetch Data
  const { data: posts, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  const totalPages = count ? Math.ceil(count / limit) : 1;

  if (error) return <div className="p-8 text-red-600">Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-secondary-900">Blog Posts</h1>
        <Link href="/admin/blog/create">
          <Button leftIcon={<Plus size={18} />}>New Post</Button>
        </Link>
      </div>

      <BlogToolbar />

      <div className="bg-white border border-secondary-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary-50 border-b border-secondary-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-secondary-900">Cover</th>
              <th className="px-6 py-4 font-semibold text-secondary-900">Title</th>
              <th className="px-6 py-4 font-semibold text-secondary-900">Status</th>
              <th className="px-6 py-4 font-semibold text-secondary-900">Date</th>
              <th className="px-6 py-4 font-semibold text-secondary-900 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-100">
            {posts?.map((post) => (
              <tr key={post.id} className="hover:bg-secondary-50">
                <td className="px-6 py-4">
                  <div className="w-16 h-10 relative bg-secondary-100 rounded overflow-hidden border border-secondary-200">
                    <Image 
                      src={post.cover_image_url || 'https://placehold.co/100?text=No+Img'} 
                      alt={post.title} 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-secondary-900 max-w-xs truncate">
                  {post.title}
                </td>
                <td className="px-6 py-4">
                  <Badge variant={post.is_published ? 'success' : 'secondary'}>
                    {post.is_published ? 'Published' : 'Draft'}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-secondary-500">
                  {new Date(post.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link 
                      href={`/admin/blog/${post.id}/edit`} 
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Post"
                    >
                      <Edit2 size={18} />
                    </Link>
                    
                    {/* Delete Button */}
                    <DeletePostButton id={post.id} />
                  </div>
                </td>
              </tr>
            ))}
            {posts?.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-secondary-500">
                  No posts found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}