'use client';

import React from 'react';
import Image from 'next/image';

const ProductGallery = ({ image, title }: { image: string, title: string }) => {
  return (
    <div className="relative aspect-square md:aspect-[4/5] bg-secondary-50 rounded-2xl overflow-hidden border border-secondary-200">
      <Image
        src={image || 'https://placehold.co/600x800/png?text=No+Image'}
        alt={title}
        fill
        className="object-cover hover:scale-105 transition-transform duration-700"
        priority
      />
    </div>
  );
};

export default ProductGallery;