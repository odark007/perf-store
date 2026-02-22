'use client';

import React from 'react';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { Order } from '@/lib/types';

interface OrdersTableProps {
  orders: Order[];
}

const OrdersTable: React.FC<OrdersTableProps> = ({ orders }) => {
  
  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge variant="success">Paid</Badge>;
      case 'pending': return <Badge variant="warning">Pending</Badge>;
      case 'failed': return <Badge variant="danger">Failed</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDeliveryBadge = (status: string) => {
    switch (status) {
      case 'delivered': return <Badge variant="success">Delivered</Badge>;
      case 'dispatched': return <Badge variant="info">Dispatched</Badge>;
      case 'ready': return <Badge variant="primary">Ready</Badge>;
      default: return <Badge variant="secondary">Processing</Badge>;
    }
  };

  return (
    <div className="bg-white border border-secondary-200 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary-50 border-b border-secondary-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-secondary-900">Order #</th>
              <th className="px-6 py-4 font-semibold text-secondary-900">Date</th>
              <th className="px-6 py-4 font-semibold text-secondary-900">Customer</th>
              <th className="px-6 py-4 font-semibold text-secondary-900">Amount</th>
              <th className="px-6 py-4 font-semibold text-secondary-900">Payment</th>
              <th className="px-6 py-4 font-semibold text-secondary-900">Delivery</th>
              <th className="px-6 py-4 font-semibold text-secondary-900 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-100">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-secondary-500">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-secondary-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-secondary-900">
                    #{order.order_number}
                  </td>
                  <td className="px-6 py-4 text-secondary-600">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-secondary-900">
                    {order.user_phone}
                  </td>
                  <td className="px-6 py-4 font-semibold text-secondary-900">
                    GH₵{order.total_amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    {getPaymentBadge(order.payment_status)}
                    <span className="text-xs text-secondary-400 block mt-1 capitalize">
                      {order.payment_method.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {getDeliveryBadge(order.delivery_status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-xs uppercase tracking-wide"
                    >
                      <Eye size={16} />
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersTable;