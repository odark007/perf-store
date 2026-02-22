'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Button';

const AGE_VERIFICATION_KEY = 'age_verified_token';
const VERIFICATION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

const AgeGateModal: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Check storage only after mounting to browser
    const verification = localStorage.getItem(AGE_VERIFICATION_KEY);
    
    if (verification) {
      try {
        const { timestamp } = JSON.parse(verification);
        const isExpired = Date.now() - timestamp > VERIFICATION_DURATION;
        if (!isExpired) return; // Valid token, do nothing
      } catch (error) {
        // console.error("Token error", error);
      }
    }
    
    // If we reach here, show the modal
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const handleVerify = (isOfAge: boolean) => {
    if (isOfAge) {
      localStorage.setItem(
        AGE_VERIFICATION_KEY,
        JSON.stringify({ timestamp: Date.now() })
      );
      setShowModal(false);
      document.body.style.overflow = 'unset';
    } else {
      window.location.href = 'https://www.google.com';
    }
  };

  // Don't render anything on server, or if modal is hidden
  if (!isMounted || !showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300">
        
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
            <ShieldCheck className="text-primary-600" size={40} />
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-secondary-900 mb-3">
            Age Verification Required
          </h2>
          <p className="text-secondary-600 mb-4">
            You must be 18 years or older to access this website.
          </p>
          
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-left">
            <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-amber-900">
              By entering this site, you confirm that you are of legal drinking age 
              in Ghana. Drink responsibly.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => handleVerify(true)}
          >
            Yes, I'm 18 or Older
          </Button>
          <Button
            variant="outline"
            size="lg"
            fullWidth
            onClick={() => handleVerify(false)}
          >
            No, I'm Under 18
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AgeGateModal;