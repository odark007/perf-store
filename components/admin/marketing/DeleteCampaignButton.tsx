'use client';

import React, { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteCampaign } from '@/app/actions/marketing';

export default function DeleteCampaignButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Delete this campaign?')) return;
    setLoading(true);
    await deleteCampaign(id);
    setLoading(false);
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
      title="Delete Campaign"
    >
      {loading ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
    </button>
  );
}