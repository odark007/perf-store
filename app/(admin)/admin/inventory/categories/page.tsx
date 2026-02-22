import React from 'react';
import Link from 'next/link'; // Not strictly needed if using client modal, but good for structure
import { createClient } from '@/lib/supabase/server';
import CategoryList from '@/components/admin/inventory/CategoryList';
import CategoriesToolbar from '@/components/admin/inventory/CategoriesToolbar';
import Pagination from '@/components/ui/Pagination';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CategoriesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  // 1. Parse Params
  const page = Number(params?.page) || 1;
  const limit = Number(params?.limit) || 10;
  const searchTerm = (params?.q as string) || '';

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // 2. Build Query
  let query = supabase
    .from('categories')
    .select('*', { count: 'exact' });

  if (searchTerm) {
    query = query.ilike('name', `%${searchTerm}%`);
  }

  // 3. Fetch Data
  const { data: categories, count, error } = await query
    .order('name', { ascending: true })
    .range(from, to);

  if (error) return <div className="p-8 text-red-600">Error loading categories: {error.message}</div>;

  const totalPages = count ? Math.ceil(count / limit) : 1;

  return (
    <div className="space-y-6">
      {/* Header with Client-Side Modal Trigger */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-secondary-900">Categories</h1>
      </div>

      <CategoriesToolbar />

      <div>
        <CategoryList categories={categories || []} />
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}