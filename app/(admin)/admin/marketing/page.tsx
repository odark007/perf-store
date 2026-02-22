import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Megaphone, Trash2, Calendar } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import DeleteCampaignButton from '@/components/admin/marketing/DeleteCampaignButton';
import { Edit2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MarketingPage() {
  const supabase = await createClient();

  const { data: campaigns } = await supabase
    .from('marketing_campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-secondary-900">Marketing Campaigns</h1>
        <Link href="/admin/marketing/create">
          <Button leftIcon={<Plus size={18} />}>New Campaign</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {campaigns?.map((campaign) => {
          const isScheduled = campaign.start_at && new Date(campaign.start_at) > new Date();
          const isExpired = campaign.end_at && new Date(campaign.end_at) < new Date();
          let status = 'Active';
          let statusVariant: any = 'success';

          if (!campaign.is_active) { status = 'Disabled'; statusVariant = 'secondary'; }
          else if (isExpired) { status = 'Expired'; statusVariant = 'danger'; }
          else if (isScheduled) { status = 'Scheduled'; statusVariant = 'warning'; }

          return (
            <div key={campaign.id} className="bg-white border border-secondary-200 rounded-xl p-4 flex flex-col md:flex-row gap-6 items-center">

              {/* Thumbnail */}
              <div className="w-full md:w-48 h-32 bg-secondary-100 rounded-lg overflow-hidden relative flex-shrink-0 border border-secondary-200">
                {campaign.media_type === 'image' ? (
                  <Image src={campaign.media_url} alt={campaign.title} fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-red-500 bg-black">
                    {/* Simple YouTube Thumbnail fallback logic if needed, or just an icon */}
                    <Megaphone size={32} className="text-white" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 w-full text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center gap-2 mb-2">
                  <h3 className="font-bold text-lg text-secondary-900">{campaign.title}</h3>
                  <Badge variant={statusVariant}>{status}</Badge>
                </div>
                <p className="text-secondary-600 text-sm mb-4 line-clamp-2">{campaign.description}</p>

                <div className="flex items-center justify-center md:justify-start gap-4 text-xs text-secondary-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>Start: {campaign.start_at ? new Date(campaign.start_at).toLocaleDateString() : 'Immediate'}</span>
                  </div>
                  {campaign.end_at && (
                    <span>End: {new Date(campaign.end_at).toLocaleDateString()}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  href={`/admin/marketing/${campaign.id}/edit`}
                  className="p-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 size={20} />
                </Link>

                <DeleteCampaignButton id={campaign.id} />
              </div>

            </div>
          );
        })}

        {campaigns?.length === 0 && (
          <div className="p-12 text-center bg-white border border-dashed border-secondary-300 rounded-xl text-secondary-500">
            No marketing campaigns found. Create one to spotlight a promotion on the homepage.
          </div>
        )}
      </div>
    </div>
  );
}