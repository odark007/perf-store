'use client';

import React, { useState } from 'react';
import { Plus, Trash2, MapPin } from 'lucide-react';
import Button from '@/components/ui/Button';
import { upsertZone, deleteZone } from '@/app/actions/settings';

interface Props {
  zones: any[];
}

const DeliverySettings: React.FC<Props> = ({ zones }) => {
  const [editingZone, setEditingZone] = useState<any>(null); // For creating/editing
  
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      id: editingZone?.id, // undefined if new
      name: formData.get('name'),
      region_category: formData.get('region_category'),
      base_price: Number(formData.get('base_price')),
      is_active: true
    };

    await upsertZone(data);
    setEditingZone(null); // Close form
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this zone?")) await deleteZone(id);
  };

  // Group zones for display
  const accraZones = zones.filter(z => z.region_category === 'accra_subzone');
  const regionalZones = zones.filter(z => z.region_category === 'regional');
  const intlZones = zones.filter(z => z.region_category === 'international');

  return (
    <div className="space-y-8">
      {/* HEADER ACTION */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Delivery Zones</h2>
        {!editingZone && (
          <Button onClick={() => setEditingZone({})} leftIcon={<Plus size={18} />}>
            Add Zone
          </Button>
        )}
      </div>

      {/* EDITOR FORM */}
      {editingZone && (
        <div className="bg-secondary-50 p-6 rounded-xl border border-secondary-200 animate-slide-up">
          <h3 className="font-bold mb-4">{editingZone.id ? 'Edit Zone' : 'New Zone'}</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-secondary-500 mb-1">Zone Name</label>
                <input required name="name" defaultValue={editingZone.name} placeholder="e.g. East Legon" className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-secondary-500 mb-1">Category</label>
                <select name="region_category" defaultValue={editingZone.region_category || 'accra_subzone'} className="w-full p-2 border rounded bg-white">
                  <option value="accra_subzone">Accra Sub-Zone</option>
                  <option value="regional">Other Region</option>
                  <option value="international">International</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-secondary-500 mb-1">Base Price (GH₵)</label>
                <input required type="number" name="base_price" defaultValue={editingZone.base_price} placeholder="20.00" className="w-full p-2 border rounded" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditingZone(null)}>Cancel</Button>
              <Button type="submit">Save Zone</Button>
            </div>
          </form>
        </div>
      )}

      {/* ZONES LIST */}
      <div className="space-y-6">
        <ZoneGroup title="Greater Accra (Sub-Zones)" zones={accraZones} onEdit={setEditingZone} onDelete={handleDelete} />
        <ZoneGroup title="Other Regions" zones={regionalZones} onEdit={setEditingZone} onDelete={handleDelete} />
        <ZoneGroup title="International" zones={intlZones} onEdit={setEditingZone} onDelete={handleDelete} />
      </div>
    </div>
  );
};

// Helper Component for List
const ZoneGroup = ({ title, zones, onEdit, onDelete }: any) => {
  if (zones.length === 0) return null;
  return (
    <div className="bg-white rounded-xl border border-secondary-200 overflow-hidden">
      <div className="bg-secondary-50 px-6 py-3 border-b border-secondary-200 font-bold flex items-center gap-2">
        <MapPin size={16} className="text-secondary-500" />
        {title}
      </div>
      <div className="divide-y divide-secondary-100">
        {zones.map((zone: any) => (
          <div key={zone.id} className="px-6 py-4 flex justify-between items-center hover:bg-secondary-50">
            <div>
              <p className="font-medium text-secondary-900">{zone.name}</p>
              <p className="text-sm text-secondary-500">Base: GH₵{zone.base_price.toFixed(2)}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onEdit(zone)} className="text-blue-600 hover:underline text-sm">Edit</button>
              <button onClick={() => onDelete(zone.id)} className="text-red-600 hover:bg-red-50 p-1 rounded">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeliverySettings;