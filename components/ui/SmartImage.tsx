'use client';

import React from 'react';
import Image, { ImageProps } from 'next/image';

const WHITELISTED_HOSTS = [
    'www.thewhiskyworld.com',
    'unsplash.com',
    'images.unsplash.com',
    'encrypted-tbn0.gstatic.com',
    'eominikzaajxzvmmpmtt.supabase.co',
    'placehold.co',
    'localhost'
];

interface SmartImageProps extends Omit<ImageProps, 'src'> {
    src: string;
}

/**
 * SmartImage Component
 * 
 * Automatically selects between Next.js <Image> (optimized) and standard <img> (unoptimized)
 * based on whether the source hostname is whitelisted in next.config.ts.
 * This bypasses the "hostname not configured" error for unknown external URLs.
 */
const SmartImage: React.FC<SmartImageProps> = ({ src, alt, ...props }) => {
    if (!src) return null;

    // 1. Determine if the URL is whitelisted
    let isWhitelisted = false;
    try {
        if (src.startsWith('http')) {
            const url = new URL(src);
            isWhitelisted = WHITELISTED_HOSTS.some(host => url.hostname === host || url.hostname.endsWith('.' + host));
        } else if (src.startsWith('/') || src.startsWith('data:')) {
            // Local paths and data URLs are always allowed
            isWhitelisted = true;
        }
    } catch (e) {
        // If URL parsing fails, we'll treat it as non-whitelisted
        isWhitelisted = false;
    }

    // 2. Render optimized or standard image
    if (isWhitelisted) {
        return <Image src={src} alt={alt} {...props} />;
    }

    // Fallback to standard <img> for non-whitelisted external domains
    // We use similar styles to match Next.js fill/contain behavior if those props are passed
    const { fill, className, style, ...remainingProps } = props as any;

    return (
        <img
            src={src}
            alt={alt}
            className={`${className} ${fill ? 'absolute inset-0 h-full w-full object-cover' : ''}`}
            style={style}
            {...remainingProps}
        />
    );
};

export default SmartImage;
