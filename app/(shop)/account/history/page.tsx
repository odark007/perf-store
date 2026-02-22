import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Package, Clock, ChevronRight, Calendar } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';

export const metadata = {
  title: 'My Orders | LiquorShop',
};

export default async function OrderHistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?next=/account/history');
  }

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-secondary-50 py-12 md:py-20">
      <div className="container-custom max-w-4xl">
        
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-secondary-900">Order History</h1>
          <p className="text-secondary-500">View your past purchases and their status.</p>
        </div>

        {orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl border border-secondary-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4 border-b border-secondary-100 pb-4">
                  <div>
                    <p className="text-xs font-bold text-secondary-500 uppercase tracking-wider mb-1">
                      Order #{order.order_number}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-secondary-600">
                      <Calendar size={14} />
                      {new Date(order.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                      <span className="text-secondary-300">•</span>
                      <span className="font-mono">{new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={
                      order.payment_status === 'paid' ? 'success' : 
                      order.payment_status === 'failed' ? 'danger' : 'warning'
                    }>
                      Payment: {order.payment_status}
                    </Badge>
                    <Badge variant={
                      order.delivery_status === 'delivered' ? 'success' : 
                      order.delivery_status === 'dispatched' ? 'info' : 'secondary'
                    }>
                      {order.delivery_status}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                  {/* Items Preview */}
                  <div className="space-y-1 flex-1">
                    {order.items.slice(0, 3).map((item: any) => (
                      <div key={item.id} className="text-sm text-secondary-700 flex items-center gap-2">
                        <span className="font-bold text-secondary-900">{item.quantity}x</span> 
                        {item.product_title} 
                        <span className="text-secondary-400 text-xs">({item.variant_name})</span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-xs text-secondary-400 italic">
                        + {order.items.length - 3} more items...
                      </p>
                    )}
                  </div>

                  {/* Total & Action */}
                  <div className="text-left md:text-right">
                    <p className="text-xs text-secondary-500 mb-1">Total Amount</p>
                    <p className="text-xl font-bold text-secondary-900 mb-4">
                      {formatCurrency(order.total_amount)}
                    </p>
                    <Link href={`/checkout/success/${order.id}`}>
                      <Button variant="outline" size="sm" rightIcon={<ChevronRight size={16} />}>
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-secondary-200">
            <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-secondary-400">
              <Package size={32} />
            </div>
            <h3 className="text-lg font-bold text-secondary-900 mb-2">No orders yet</h3>
            <p className="text-secondary-500 mb-6">Looks like you haven't placed an order yet.</p>
            <Link href="/shop">
              <Button>Start Shopping</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}