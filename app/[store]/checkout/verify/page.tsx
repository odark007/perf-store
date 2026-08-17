'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// NOTE: We removed 'createClient' import because we now call the API instead

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const reference = searchParams.get('reference'); // Paystack sends this
  const [status, setStatus] = useState('Verifying payment...');

  useEffect(() => {
    if (!orderId || !reference) {
      setStatus('Invalid verification link.');
      return;
    }

    const verifyPayment = async () => {
      try {
        // CALL THE SECURE API ROUTE
        const res = await fetch('/api/paystack/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference }),
        });

        if (res.ok) {
          // Success: Redirect to success page
          router.push(`/checkout/success/${orderId}`);
        } else {
          // Failure: Paystack said transaction failed
          setStatus('Payment verification failed. Please contact support.');
        }
      } catch (error) {
        console.error("Verification Error", error);
        setStatus('Error connecting to server.');
      }
    };

    verifyPayment();
  }, [orderId, reference, router]);

  return (
    <div className="container-custom py-32 text-center flex flex-col items-center">
      <Loader2 className="animate-spin text-primary-600 mb-4" size={48} />
      <h2 className="text-xl font-bold text-secondary-900">{status}</h2>
      <p className="text-secondary-500 mt-2">Please wait while we confirm your transaction.</p>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center">Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}