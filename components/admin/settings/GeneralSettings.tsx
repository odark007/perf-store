'use client';

import React, { useState } from 'react';
import { Save, Phone, Globe, AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { updateGeneralSettings } from '@/app/actions/settings';

interface Props {
  settings: any;
}

const GeneralSettings: React.FC<Props> = ({ settings }) => {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const res = await updateGeneralSettings(formData);
    setLoading(false);
    if (res.error) alert(res.error);
    else alert('Settings Saved!');
  }

  return (
    <form action={handleSubmit} className="space-y-8 max-w-2xl">

      {/* Contact Info */}
      <div className="bg-white p-6 rounded-xl border border-secondary-200 shadow-sm">
        <h3 className="font-bold text-lg text-secondary-900 mb-4 flex items-center gap-2">
          <Phone className="text-primary-600" size={20} />
          Contact Information
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Primary Voice Number</label>
              <input
                name="primary_phone"
                defaultValue={settings.primary_phone}
                className="w-full p-2 border rounded-lg"
                placeholder="23324..."
              />
              <p className="text-xs text-secondary-500 mt-1">Main number for incoming calls.</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">WhatsApp Business Number</label>
              <input
                name="whatsapp_phone"
                defaultValue={settings.whatsapp_phone}
                className="w-full p-2 border rounded-lg"
                placeholder="23324..."
              />
              <p className="text-xs text-secondary-500 mt-1">Used for chat links & automated alerts.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Toggles */}
      <div className="bg-white p-6 rounded-xl border border-secondary-200 shadow-sm">
        <h3 className="font-bold text-lg text-secondary-900 mb-4 flex items-center gap-2">
          <Globe className="text-primary-600" size={20} />
          Regional Availability
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
            <div>
              <p className="font-medium text-secondary-900">Delivery Outside Accra</p>
              <p className="text-xs text-secondary-500">Enable delivery to other regions in Ghana</p>
            </div>
            <input
              type="checkbox"
              name="enable_outside_accra"
              defaultChecked={settings.enable_outside_accra}
              className="w-5 h-5 text-primary-600 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
            <div>
              <p className="font-medium text-secondary-900">International Delivery</p>
              <p className="text-xs text-secondary-500">Enable delivery outside Ghana</p>
            </div>
            <input
              type="checkbox"
              name="enable_international"
              defaultChecked={settings.enable_international}
              className="w-5 h-5 text-primary-600 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Bulk Logic */}
      <div className="bg-white p-6 rounded-xl border border-secondary-200 shadow-sm">
        <h3 className="font-bold text-lg text-secondary-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="text-amber-600" size={20} />
          Bulk Order Logic
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Bulk Threshold (Items)</label>
            <input
              type="number"
              name="bulk_threshold"
              defaultValue={settings.bulk_threshold}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Surcharge per Extra Item</label>
            <input
              type="number"
              name="bulk_surcharge"
              defaultValue={settings.bulk_surcharge}
              className="w-full p-2 border rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" isLoading={loading} leftIcon={<Save size={18} />}>
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default GeneralSettings;