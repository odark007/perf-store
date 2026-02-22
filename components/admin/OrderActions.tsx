'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save } from 'lucide-react';
import Button from '@/components/ui/Button';

interface OrderActionsProps {
  order: any;
}

const OrderActions: React.FC<OrderActionsProps> = ({ order }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(order.payment_status);
  const [deliveryStatus, setDeliveryStatus] = useState(order.delivery_status);

  const handleUpdate = async (field: string, value: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          orderNumber: order.order_number,
          phone: order.user_phone,
          field,
          value
        }),
      });

      if (!res.ok) throw new Error('Failed to update');
      
      router.refresh(); // Reload page data
      alert('Status updated successfully!');
    } catch (error) {
      alert('Error updating status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-secondary-200 shadow-sm space-y-6">
      <h3 className="font-bold text-secondary-900 border-b border-secondary-100 pb-2">Order Actions</h3>

      {/* Payment Status */}
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">Payment Status</label>
        <div className="flex gap-2">
          <select 
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="flex-1 p-2 bg-secondary-50 border border-secondary-200 rounded-lg text-sm"
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>
          <Button 
            size="sm" 
            isLoading={loading}
            onClick={() => handleUpdate('payment_status', paymentStatus)}
            disabled={paymentStatus === order.payment_status}
          >
            <Save size={16} />
          </Button>
        </div>
      </div>

      {/* Delivery Status */}
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">Delivery Status</label>
        <div className="flex gap-2">
          <select 
            value={deliveryStatus}
            onChange={(e) => setDeliveryStatus(e.target.value)}
            className="flex-1 p-2 bg-secondary-50 border border-secondary-200 rounded-lg text-sm"
          >
            <option value="processing">Processing</option>
            <option value="ready">Ready for Pickup</option>
            <option value="dispatched">Dispatched</option>
            <option value="delivered">Delivered</option>
          </select>
          <Button 
            size="sm" 
            isLoading={loading}
            onClick={() => handleUpdate('delivery_status', deliveryStatus)}
            disabled={deliveryStatus === order.delivery_status}
          >
            <Save size={16} />
          </Button>
        </div>
        <p className="text-xs text-secondary-500 mt-2">
          *Updating delivery status will trigger an SMS to the customer.
        </p>
      </div>
    </div>
  );
};

export default OrderActions;