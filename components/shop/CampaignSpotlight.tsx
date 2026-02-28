'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, PlayCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { getYoutubeId } from '@/lib/utils';
import { MarketingCampaign } from '@/lib/types';

interface Props {
  campaign: MarketingCampaign;
}

const CampaignSpotlight: React.FC<Props> = ({ campaign }) => {
  const youtubeId = campaign.media_type === 'youtube' ? getYoutubeId(campaign.media_url) : null;

  return (
    <section className="py-20 bg-brand-cream overflow-hidden relative">
      {/* Decorative Background Blur */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600 rounded-full blur-[120px]" />
      </div>

      <div className="container-custom relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* TEXT CONTENT */}
          <div className="w-full lg:w-1/2 text-center lg:text-left space-y-6">
            <span className="inline-block px-3 py-1 rounded-full bg-brand-gold/10 text-brand-gold border border-brand-gold/30 text-xs font-bold uppercase tracking-wider">
              Spotlight
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-brand-deep leading-tight">
              {campaign.title}
            </h2>
            <p className="text-lg text-brand-muted leading-relaxed max-w-xl mx-auto lg:mx-0">
              {campaign.description}
            </p>
            {campaign.cta_text && campaign.cta_link && (
              <div className="pt-4">
                <Link href={campaign.cta_link}>
                  <Button
                    size="lg"
                    className="h-14 px-8 text-lg bg-brand-deep text-white hover:bg-brand-mid border-none shadow-xl shadow-brand-deep/20"
                    rightIcon={<ArrowRight size={20} />}
                  >
                    {campaign.cta_text}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* MEDIA CONTENT */}
          <div className="w-full lg:w-1/2">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-brand-border bg-white aspect-video lg:aspect-[4/3] group">

              {campaign.media_type === 'image' ? (
                <Image
                  src={campaign.media_url}
                  alt={campaign.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : youtubeId ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
                  title={campaign.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-secondary-500">
                  <PlayCircle size={48} />
                  <span className="ml-2">Video Unavailable</span>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CampaignSpotlight;