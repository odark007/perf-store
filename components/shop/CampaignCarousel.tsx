'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CampaignSpotlight from './CampaignSpotlight';
import { MarketingCampaign } from '@/lib/types';

interface Props {
  campaigns: MarketingCampaign[];
}

const CampaignCarousel: React.FC<Props> = ({ campaigns }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // If only 1 campaign, just render it static (no carousel logic)
  if (campaigns.length === 1) {
    return <CampaignSpotlight campaign={campaigns[0]} />;
  }

  // Navigation Logic
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % campaigns.length);
  }, [campaigns.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? campaigns.length - 1 : prev - 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-Play Logic (Pauses on Hover)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 6000); // 6 Seconds
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 1. The Active Slide (Fade Effect handled by React key diffing usually, 
          but for simplicity we just render the active one) */}
      <div className="transition-opacity duration-500">
        <CampaignSpotlight campaign={campaigns[currentIndex]} />
      </div>

      {/* 2. Navigation Arrows (Visible on Hover) */}
      <button 
        onClick={prevSlide}
        className="absolute top-1/2 left-4 md:left-8 -translate-y-1/2 z-20 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-4 group-hover:translate-x-0 border border-white/10"
        aria-label="Previous Slide"
      >
        <ChevronLeft size={24} />
      </button>

      <button 
        onClick={nextSlide}
        className="absolute top-1/2 right-4 md:right-8 -translate-y-1/2 z-20 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0 border border-white/10"
        aria-label="Next Slide"
      >
        <ChevronRight size={24} />
      </button>

      {/* 3. Indicators (Dots) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {campaigns.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`
              h-2 rounded-full transition-all duration-300 
              ${index === currentIndex ? 'w-8 bg-amber-500' : 'w-2 bg-white/30 hover:bg-white/60'}
            `}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide Counter (Optional aesthetic touch) */}
      <div className="absolute bottom-6 right-8 z-20 text-white/40 text-xs font-mono hidden md:block">
        {currentIndex + 1} / {campaigns.length}
      </div>
    </div>
  );
};

export default CampaignCarousel;