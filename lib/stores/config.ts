// Store Registry — single source of truth for all stores in the Jarayel platform.
// Adding a new store = add one entry here + seed its Supabase tables with the matching suffix.

export interface StoreTheme {
  fontDisplay: string;
  fontBody: string;
  primaryColor: string;
  accentColor: string;
  bgPrimary: string;
  navbarBg: string;
}

export interface StoreConfig {
  slug: string;              // URL segment, e.g. 'derme'
  name: string;              // Brand name shown to customers
  tagline: string;
  description: string;
  tableSuffix: string;       // '_perfume_store' | '_toy_shop' etc.
  bucketName: string;        // Storage bucket for product images
  currency: string;          // 'GHS'
  currencyCode: string;      // ISO code for Intl formatter, e.g. 'GHS'
  theme: StoreTheme;
}

export const STORES: Record<string, StoreConfig> = {
  derme: {
    slug: 'derme',
    name: 'The Perfume Store Ghana',
    tagline: 'Luxury Fragrances',
    description: "Ghana's premier destination for authentic luxury fragrances. Curating excellence since 2024.",
    tableSuffix: '_perfume_store',
    bucketName: 'product-images-perfume-store',
    currency: 'GHS',
    currencyCode: 'GHS',
    theme: {
      fontDisplay: 'Cormorant Garamond',
      fontBody: 'Jost',
      primaryColor: '#c9a84c',
      accentColor: '#e8c97a',
      bgPrimary: '#1a0a2e',
      navbarBg: 'rgba(26, 10, 46, 0.92)',
    },
  },
  'play-time': {
    slug: 'play-time',
    name: "Tomorrow's Playground",
    tagline: 'RC Cars, Robots & Smart Toys',
    description: 'A futuristic, friendly toy shop specializing in RC cars, AI robots, and app-connected toys.',
    tableSuffix: '_toy_shop',
    bucketName: 'product-images-toy-shop',
    currency: 'GHS',
    currencyCode: 'GHS',
    theme: {
      fontDisplay: 'Space Grotesk',
      fontBody: 'Baloo 2',
      primaryColor: '#8c7ef6',
      accentColor: '#ff8f66',
      bgPrimary: '#f5f3fc',
      navbarBg: 'rgba(245, 243, 252, 0.82)',
    },
  },
};

export const storeSlugs = Object.keys(STORES);

export const STORE_COOKIE = 'jarayel_store';

export function getStore(slug: string): StoreConfig {
  return STORES[slug] || STORES.derme;
}

export function getStoreOrNull(slug: string): StoreConfig | null {
  return STORES[slug] || null;
}

// Build full table names for a given store suffix.
export function getTableName(slug: string, base: string): string {
  const store = getStore(slug);
  return `${base}${store.tableSuffix}`;
}

// Convenience: namespaced table map for a store.
export function getTables(slug: string) {
  const store = getStore(slug);
  const s = store.tableSuffix;
  return {
    categories: `categories${s}`,
    products: `products${s}`,
    productVariants: `product_variants${s}`,
    inventory: `inventory_master${s}`,
    orders: `orders${s}`,
    orderItems: `order_items${s}`,
    payments: `payments${s}`,
    storeSettings: `store_settings${s}`,
    deliveryZones: `delivery_zones${s}`,
    taxes: `taxes${s}`,
    notificationTemplates: `notification_templates${s}`,
    posts: `posts${s}`,
    campaigns: `marketing_campaigns${s}`,
    reviews: `product_reviews${s}`,
    smsLogs: `sms_logs${s}`,
    profiles: `profiles${s}`,
  };
}