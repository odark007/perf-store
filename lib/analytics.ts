'use client';

// Helper to send GA4 Events safely
export const sendGAEvent = (eventName: string, params: Record<string, any>) => {
  // Check if window exists and gtag is loaded
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, params);
    // console.log(`[GA4] Event Sent: ${eventName}`, params); // Uncomment for debugging
  }
};