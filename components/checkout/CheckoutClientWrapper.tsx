'use client';

import React, { useState } from 'react';
import CheckoutForm from './CheckoutForm';
import CheckoutSummary from './CheckoutSummary';

interface Props {
  settings: any;
  zones: any[];
  taxes: any[];
  storeSlug?: string;
}

const CheckoutClientWrapper: React.FC<Props> = ({ settings, zones, taxes, storeSlug = 'derme' }) => {
  // State to sync Form selection with Summary calculation
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [wantsDelivery, setWantsDelivery] = useState(true);

  // Find the selected zone object
  const selectedZone = zones.find(z => z.id === selectedZoneId) || null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
      {/* Left Column: Form */}
      <div className="lg:col-span-2 space-y-8">
         <CheckoutForm 
           zones={zones} 
           selectedZoneId={selectedZoneId}
           setSelectedZoneId={setSelectedZoneId}
           wantsDelivery={wantsDelivery}
           setWantsDelivery={setWantsDelivery}
           storeSlug={storeSlug}
         />
      </div>

      {/* Right Column: Dynamic Summary */}
      <div>
         <CheckoutSummary 
           settings={settings}
           taxes={taxes}
           selectedZone={selectedZone}
           wantsDelivery={wantsDelivery}
         />
      </div>
    </div>
  );
};

export default CheckoutClientWrapper;