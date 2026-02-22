import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Tag } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import ProductsToolbar from '@/components/admin/products/ProductsToolbar';
import DeleteProductButton from '@/components/admin/products/DeleteProductButton';
import { Edit2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  // 1. Parse Params
  const page = Number(params?.page) || 1;
  const limit = Number(params?.limit) || 10;
  const searchTerm = (params?.q as string) || '';
  const categoryFilter = (params?.category as string) || 'all';

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // 2. Fetch Categories (For Toolbar)
  const { data: categories } = await supabase.from('categories').select('id, name').order('name');

  // 3. Build Query
  let query = supabase
    .from('products')
    .select('*, categories(name)', { count: 'exact' });

  if (searchTerm) {
    query = query.ilike('title', `%${searchTerm}%`);
  }

  if (categoryFilter !== 'all') {
    query = query.eq('category_id', categoryFilter);
  }

  const { data: products, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  const totalPages = count ? Math.ceil(count / limit) : 1;

  if (error) return <div className="p-8 text-red-600">Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-secondary-900">Products</h1>
        <Link href="/admin/products/create">
          <Button leftIcon={<Plus size={18} />}>
            Add Product
          </Button>
        </Link>
      </div>

      <ProductsToolbar categories={categories || []} />

      <div className="bg-white border border-secondary-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary-50 border-b border-secondary-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-secondary-900">Image</th>
              <th className="px-6 py-4 font-semibold text-secondary-900">Name</th>
              <th className="px-6 py-4 font-semibold text-secondary-900">Category</th>
              <th className="px-6 py-4 font-semibold text-secondary-900">Status</th>
              <th className="px-6 py-4 font-semibold text-secondary-900 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-100">
            {products?.map((product: any) => (
              <tr key={product.id} className="hover:bg-secondary-50">
                <td className="px-6 py-4">
                  <div className="w-12 h-12 relative bg-secondary-100 rounded-lg overflow-hidden border border-secondary-200">
                    <Image src={product.base_image_url || 'https://placehold.co/100?text=No+Image'} alt={product.title} fill className="object-cover" />
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-secondary-900">
                  {product.title}
                </td>
                <td className="px-6 py-4 text-secondary-500">
                  <span className="inline-flex items-center gap-1 bg-secondary-100 px-2 py-1 rounded text-xs">
                    <Tag size={12} />
                    {product.categories?.name || 'Uncategorized'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={product.is_active ? 'success' : 'secondary'}>
                    {product.is_active ? 'Active' : 'Draft'}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {/* Edit Link */}
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                    </Link>
                    {/* Delete Button */}
                    <DeleteProductButton id={product.id} />
                  </div>
                </td>
              </tr>
            ))}
            {products?.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-secondary-500">No products found.</td>
              </tr>
            )}
          </tbody>
        </table>

        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}