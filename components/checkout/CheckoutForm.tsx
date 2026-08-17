'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Smartphone, Truck, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useCartStore } from '@/lib/store';
import Button from '@/components/ui/Button';
import { placeOrder } from '@/app/actions/checkout';
// Ensure you have this import for notifications if you need to call it client side, 
// though we moved it to server action in previous steps.

interface Props {
  zones: any[];
  selectedZoneId: string;
  setSelectedZoneId: (id: string) => void;
  wantsDelivery: boolean;
  setWantsDelivery: (value: boolean) => void;
  storeSlug?: string;
}

const CheckoutForm: React.FC<Props> = ({ zones, selectedZoneId, setSelectedZoneId, wantsDelivery, setWantsDelivery, storeSlug = 'derme' }) => {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'manual_momo' | 'pay_later'>('paystack');
  const [user, setUser] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user?.email) {
        setFormData(prev => ({ ...prev, email: data.user!.email! }));
      }
    });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Logic: Zone is required ONLY IF the customer wants delivery
  const isZoneRequired = wantsDelivery;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Custom Validation
    if (isZoneRequired && !selectedZoneId) {
      return alert("Please select a Delivery Zone for this payment method.");
    }
    
    setIsSubmitting(true);

    try {
      // 1. Call Secure Server Action
      const result = await placeOrder({
        items: items,
        userPhone: formData.phone,
        userEmail: formData.email || null,
        // If delivery not wanted, send null zone and no address.
        deliveryZoneId: wantsDelivery ? (selectedZoneId || null) : null,
        deliveryAddress: wantsDelivery ? formData.address : '',
        paymentMethod: paymentMethod,
        notes: `${formData.firstName} ${formData.lastName || ''} - ${formData.notes}`,
        storeSlug: storeSlug,
      });

      if (result.error) {
        alert(`Order Failed: ${result.error}`);
        setIsSubmitting(false);
        return;
      }

      // 2. Redirect/Payment logic
      if (paymentMethod === 'paystack') {
        const response = await fetch('/api/paystack/initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email || 'guest@liquorshop.gh',
            amount: result.finalTotal, 
            orderId: result.orderId,
            phone: formData.phone,
            storeSlug: storeSlug
          }),
        });

        const paystackData = await response.json();
        if (!response.ok) throw new Error(paystackData.error);

        clearCart();
        window.location.href = paystackData.url;
      } else {
        // Manual MoMo or Pay Later
        clearCart();
        router.push(`/${storeSlug}/checkout/success/${result.orderId}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
      setIsSubmitting(false);
    }
  };

  // Group zones
  const accraZones = zones.filter(z => z.region_category === 'accra_subzone');
  const regionalZones = zones.filter(z => z.region_category === 'regional');
  const intlZones = zones.filter(z => z.region_category === 'international');

  return (
    <div className="space-y-4">
      {user ? (
        <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-lg text-sm">
          <span className="font-bold">Logged in as:</span> {user.email}
        </div>
      ) : (
        <div className="bg-gray-50 text-gray-600 px-4 py-3 rounded-lg text-sm">
          Checking out as <strong>Guest</strong>.
          <a href="/auth/login" className="text-primary-600 hover:underline ml-1">Login to save order?</a>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Delivery Details */}
        <div className="bg-white p-6 rounded-xl border border-secondary-200 shadow-sm">
          <h3 className="font-display font-bold text-lg text-secondary-900 mb-4 flex items-center gap-2">
            <Truck className="text-primary-600" size={20} />
            Delivery Details
          </h3>

          {/* Toggle: Want Delivery? */}
          <label className={`flex items-center justify-between gap-4 p-4 mb-4 border-2 rounded-xl cursor-pointer transition-all ${wantsDelivery ? 'border-primary-500 bg-primary-50 shadow-sm' : 'border-secondary-300 bg-white hover:border-primary-300'}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg transition-colors ${wantsDelivery ? 'bg-primary-600 text-white' : 'bg-secondary-100 text-secondary-400'}`}>
                <Truck size={22} />
              </div>
              <div>
                <p className="font-semibold text-secondary-900">I want delivery to my address</p>
                <p className="text-sm text-secondary-500">{wantsDelivery ? 'Delivery to your door will be added to your total.' : 'Pickup / instant online payment — no delivery fee.'}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className={`text-[10px] font-bold uppercase tracking-widest ${wantsDelivery ? 'text-primary-600' : 'text-secondary-400'}`}>
                {wantsDelivery ? 'On' : 'Off'}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={wantsDelivery}
                aria-label="Toggle delivery"
                onClick={() => {
                  setWantsDelivery(!wantsDelivery);
                  if (wantsDelivery) setSelectedZoneId('');
                }}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${wantsDelivery ? 'bg-gradient-to-r from-primary-500 to-primary-700 shadow-inner' : 'bg-secondary-300'}`}
              >
                <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${wantsDelivery ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">First Name *</label>
              <input required name="firstName" className="w-full p-2.5 border rounded-lg focus:border-primary-500" onChange={handleInputChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Last Name</label>
              <input name="lastName" className="w-full p-2.5 border rounded-lg focus:border-primary-500" onChange={handleInputChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Phone Number *</label>
              <input required name="phone" type="tel" className="w-full p-2.5 border rounded-lg focus:border-primary-500" onChange={handleInputChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Email</label>
              <input name="email" type="email" value={formData.email} className="w-full p-2.5 border rounded-lg focus:border-primary-500" onChange={handleInputChange} />
            </div>
            
            {wantsDelivery && (
              <>
                {/* ZONE DROPDOWN */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Delivery Zone *
                  </label>
                  <select 
                    required
                    value={selectedZoneId} 
                    onChange={(e) => setSelectedZoneId(e.target.value)} 
                    className="w-full p-2.5 bg-secondary-50 border border-secondary-200 rounded-lg focus:border-primary-500 font-medium"
                  >
                    <option value="">Select your delivery zone...</option>
                    <optgroup label="Greater Accra">
                      {accraZones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                    </optgroup>
                    <optgroup label="Other Regions">
                      {regionalZones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                    </optgroup>
                    {intlZones.length > 0 && (
                       <optgroup label="International">
                         {intlZones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                       </optgroup>
                    )}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Specific Address *</label>
                  <input required name="address" placeholder="House/Street/Landmark" className="w-full p-2.5 border rounded-lg focus:border-primary-500" onChange={handleInputChange} />
                </div>
              </>
            )}

            {!wantsDelivery && (
              <div className="md:col-span-2 bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm">
                No delivery selected. You can pay online instantly and pick up your items.
              </div>
            )}
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white p-6 rounded-xl border border-secondary-200 shadow-sm">
          <h3 className="font-display font-bold text-lg text-secondary-900 mb-4 flex items-center gap-2">
            <CreditCard className="text-primary-600" size={20} />
            Payment Method
          </h3>
          <div className="space-y-3">
            <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'paystack' ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-secondary-200 hover:border-secondary-300'}`}>
              <input type="radio" name="payment" value="paystack" checked={paymentMethod === 'paystack'} onChange={() => setPaymentMethod('paystack')} className="w-5 h-5 text-primary-600 focus:ring-primary-500" />
              <div className="flex-1">
                <p className="font-semibold text-secondary-900">Pay Online (Instant)</p>
                <p className="text-sm text-secondary-500">Visa, Mastercard, Mobile Money</p>
              </div>
            </label>
            <label className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'manual_momo' ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-secondary-200 hover:border-secondary-300'}`}>
              <input type="radio" name="payment" value="manual_momo" checked={paymentMethod === 'manual_momo'} onChange={() => setPaymentMethod('manual_momo')} className="w-5 h-5 text-primary-600 focus:ring-primary-500 mt-1" />
              <div className="flex-1">
                <p className="font-semibold text-secondary-900">MTN Mobile Money (Manual)</p>
                <p className="text-sm text-secondary-500">Send money directly to merchant.</p>
              </div>
              <Smartphone className="text-secondary-400" />
            </label>
            <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'pay_later' ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-secondary-200 hover:border-secondary-300'}`}>
              <input type="radio" name="payment" value="pay_later" checked={paymentMethod === 'pay_later'} onChange={() => setPaymentMethod('pay_later')} className="w-5 h-5 text-primary-600 focus:ring-primary-500" />
              <div className="flex-1">
                <p className="font-semibold text-secondary-900">Pay Excluding Delivery</p>
                <p className="text-sm text-secondary-500">Pay for items now, admin will contact you later.</p>
              </div>
            </label>
          </div>
        </div>

        {/* Button: Enable if items > 0 AND (Zone Selected OR No Delivery) */}
        <Button 
          type="submit" 
          size="lg" 
          fullWidth 
          isLoading={isSubmitting} 
          disabled={items.length === 0 || (wantsDelivery && !selectedZoneId)} 
          rightIcon={<CheckCircle size={20} />}
        >
          Place Order
        </Button>
      </form>
    </div>
  );
};

export default CheckoutForm;