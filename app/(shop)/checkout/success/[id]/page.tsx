import React from 'react';
import Link from 'next/link';
import { CheckCircle, MessageCircle, Home } from 'lucide-react';
import Button from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import PurchaseTracker from '@/components/checkout/PurchaseTracker';

// Next.js 15: Params are a Promise
interface SuccessPageProps {
  params: Promise<{ id: string }>;
}

export default async function SuccessPage({ params }: SuccessPageProps) {
  // Await the params before accessing properties
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const supabase = createClient();

  // Fetch minimal order details
  const { data: order, error } = await supabase
    .from('orders')
    .select('id, order_number, total_amount, payment_method, tax_amount, delivery_fee, items:order_items(*)')
    .eq('id', id)
    .single();

  if (error || !order) {
    return (
      <div className="container-custom py-24 text-center">
        <h2 className="text-xl font-bold text-red-600">Order not found</h2>
        <p className="text-secondary-500 mb-6">The order ID might be invalid or there was a system error.</p>
        <Link href="/shop">
          <Button variant="outline">Return to Shop</Button>
        </Link>
      </div>
    );
  }

  // WhatsApp Logic
  const phoneNumber = "233244000000";
  const message = `Hello! I just placed Order #${order.order_number} (Amount: GH₵${order.total_amount}). I have made payment via MoMo. Please confirm.`;
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="container-custom py-16 md:py-24 text-center">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl border border-secondary-200 shadow-xl">

        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-green-600" size={40} />
        </div>

        <h1 className="text-3xl font-display font-bold text-secondary-900 mb-2">
          Order Placed Successfully!
        </h1>
        <p className="text-secondary-500 mb-8">
          Order #{order.order_number} has been received.
        </p>

        {/* Conditional Content based on Payment Method */}
        {order.payment_method === 'manual_momo' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8 text-left">
            <h3 className="font-bold text-yellow-900 mb-2">Next Step: Complete Payment</h3>
            <p className="text-sm text-yellow-800 mb-4">
              Please send <strong>GH₵{order.total_amount.toFixed(2)}</strong> to:
            </p>
            <div className="bg-white p-3 rounded border border-yellow-200 mb-4 font-mono text-center">
              MTN MoMo: 024 XXX XXXX <br />
              (LiquorShop Ghana)
            </div>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button fullWidth size="lg" className="bg-[#25D366] hover:bg-[#20BA5A] border-none text-white">
                <MessageCircle size={20} className="mr-2" />
                I Have Paid - Verify on WhatsApp
              </Button>
            </a>
          </div>
        )}

        {order.payment_method === 'pay_later' && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 text-left">
            <h3 className="font-bold text-blue-900 mb-2">Order Received</h3>
            <p className="text-sm text-blue-800">
              An admin will contact you shortly to confirm delivery fees and arrange dispatch.
            </p>
          </div>
        )}

        <div className="flex justify-center">
          <Link href="/shop">
            <Button variant="outline" leftIcon={<Home size={18} />}>
              Continue Shopping
            </Button>
          </Link>
        </div>
        {/* GA4 Purchase Tracking */}
        <PurchaseTracker order={order} items={order.items || []} />
      </div>
    </div>
  );
}