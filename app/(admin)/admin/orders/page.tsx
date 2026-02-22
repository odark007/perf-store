import React from 'react';
import { createClient } from '@/lib/supabase/client';
import OrdersTable from '@/components/admin/OrdersTable';
import OrdersToolbar from '@/components/admin/OrdersToolbar';
import Pagination from '@/components/ui/Pagination';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface OrdersPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams;
  const supabase = createClient();

  // 1. Parse Params
  const page = Number(params?.page) || 1;
  const searchTerm = (params?.q as string) || '';
  const statusFilter = (params?.status as string) || 'all';
  const ITEMS_PER_PAGE = 10;

  // 2. Calculate Range for Pagination
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  // 3. Build Query
  let query = supabase
    .from('orders')
    .select('*', { count: 'exact' });

  // Apply Search (Search by Phone Number)
  if (searchTerm) {
    query = query.ilike('user_phone', `%${searchTerm}%`);
  }

  // Apply Status Filter
  if (statusFilter !== 'all') {
    query = query.eq('payment_status', statusFilter);
  }

  // Apply Sort and Pagination
  const { data: orders, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    return <div className="p-8 text-red-600">Error loading orders: {error.message}</div>;
  }

  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-secondary-900">Orders</h1>
        <span className="text-sm text-secondary-500">
          Total Results: {count || 0}
        </span>
      </div>

      {/* Toolbar (Search & Filter) */}
      <OrdersToolbar />

      {/* Table Wrapper with Pagination Footer */}
      <div className="bg-white border border-secondary-200 rounded-xl overflow-hidden shadow-sm">
        <OrdersTable orders={orders || []} />
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}