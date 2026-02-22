import React from 'react';
import { createClient } from '@/lib/supabase/server';
import InventoryTable from '@/components/admin/inventory/InventoryTable';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Tag, PlusCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  const supabase = await createClient();

  // Fetch Inventory Master
  const { data: inventory, error } = await supabase
    .from('inventory_master')
    .select('*')
    .order('product_name');

  if (error) {
    return <div className="p-8 text-red-600">Error loading inventory.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-secondary-900">Inventory Management</h1>
        <div className="flex gap-3">
          {/* We will build the Product Creation flow next */}
          <Link href="/admin/products">
            <Button leftIcon={<PlusCircle size={18} />}>
              Manage Products
            </Button>
          </Link>
        </div>
      </div>

      <InventoryTable inventory={inventory || []} />
    </div>
  );
}