import React from 'react';
import Link from 'next/link';
import { ArrowLeft, User, MapPin, Phone, Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import OrderActions from '@/components/admin/OrderActions';
import Badge from '@/components/ui/Badge';
import CopyableText from '@/components/ui/CopyableText';

// Next.js 15 Params
interface PageProps {
    params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export default async function OrderDetailPage({ params }: PageProps) {
    const { id } = await params;
    const supabase = createClient();

    // 1. Fetch Order + Items
    const { data: order, error } = await supabase
        .from('orders')
        .select(`
      *,
      items:order_items(*)
    `)
        .eq('id', id)
        .single();

    if (error || !order) {
        return <div className="p-8">Order not found</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/orders" className="p-2 hover:bg-white rounded-lg transition-colors">
                    <ArrowLeft size={20} className="text-secondary-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-display font-bold text-secondary-900">
                        Order #{order.order_number}
                    </h1>
                    <p className="text-sm text-secondary-500">
                        Placed on {new Date(order.created_at).toLocaleString()}
                    </p>
                </div>
                <div className="ml-auto flex gap-2">
                    <Badge variant={order.payment_status === 'paid' ? 'success' : 'warning'}>
                        Payment: {order.payment_status}
                    </Badge>
                    <Badge variant="info">
                        Delivery: {order.delivery_status}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT COLUMN: Details (Span 2) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Items Card */}
                    <div className="bg-white rounded-xl border border-secondary-200 overflow-hidden shadow-sm">
                        <div className="p-4 bg-secondary-50 border-b border-secondary-200 font-medium">
                            Items Ordered
                        </div>
                        <div className="divide-y divide-secondary-100">
                            {order.items.map((item: any) => (
                                <div key={item.id} className="p-4 flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-secondary-900">{item.product_title}</p>
                                        <p className="text-sm text-secondary-500">{item.variant_name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-secondary-600">
                                            {item.quantity} x GH₵{item.price_at_purchase}
                                        </p>
                                        <p className="font-bold text-secondary-900">
                                            GH₵{item.subtotal.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div className="p-4 bg-secondary-50 flex justify-between items-center border-t border-secondary-200">
                                <span className="font-bold text-secondary-700">Total Amount</span>
                                <span className="text-xl font-bold text-secondary-900">
                                    GH₵{order.total_amount.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Customer Info Card */}
                    <div className="bg-white rounded-xl border border-secondary-200 shadow-sm p-6">
                        <h3 className="font-bold mb-4 border-b border-secondary-100 pb-2">Customer Details</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Customer Name/Notes */}
                            <div className="flex gap-3">
                                <User className="text-secondary-400 mt-1 flex-shrink-0" size={18} />
                                <div>
                                    <p className="text-xs text-secondary-500 uppercase font-semibold">Customer</p>
                                    <p className="text-secondary-900 font-medium">{order.notes || 'Guest User'}</p>
                                </div>
                            </div>

                            {/* Phone (Clickable) */}
                            <div className="flex gap-3">
                                <Phone className="text-secondary-400 mt-1 flex-shrink-0" size={18} />
                                <div>
                                    <p className="text-xs text-secondary-500 uppercase font-semibold">Phone</p>
                                    <a
                                        href={`tel:${order.user_phone}`}
                                        className="text-primary-600 hover:text-primary-700 hover:underline font-bold text-lg"
                                        title="Call Customer"
                                    >
                                        {order.user_phone}
                                    </a>
                                </div>
                            </div>

                            {/* Email (Copyable) */}
                            <div className="flex gap-3">
                                <Mail className="text-secondary-400 mt-1 flex-shrink-0" size={18} />
                                <div>
                                    <p className="text-xs text-secondary-500 uppercase font-semibold">Email</p>
                                    <CopyableText text={order.user_email} />
                                </div>
                            </div>

                            {/* Address */}
                            <div className="flex gap-3 md:col-span-2">
                                <MapPin className="text-secondary-400 mt-1 flex-shrink-0" size={18} />
                                <div>
                                    <p className="text-xs text-secondary-500 uppercase font-semibold">Delivery Address</p>
                                    <p className="text-secondary-900 leading-relaxed">{order.delivery_address}</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Actions (Span 1) */}
                <div className="space-y-6">
                    <OrderActions order={order} />
                </div>

            </div>
        </div>
    );
}