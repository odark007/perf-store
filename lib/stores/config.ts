// Store Registry — single source of truth for all stores in the Jarayel platform.
// Adding a new store = add one entry here + create its Supabase resources with the matching suffix.
//
// MULTITENANCY RULE:
//   Every store owns its own table suffix and storage buckets. A store must never
//   read or write another store's suffix. `getStore()` throws for unknown slugs so
//   a typo or missing env var can never silently resolve to derme.

export interface StoreTheme {
  fontDisplay: string;
  fontBody: string;
  /** Dominant brand colour (hero / navbar / dark sections). */
  primaryColor: string;
  /** Secondary highlight colour (gold / champagne / orange). */
  accentColor: string;
  bgPrimary: string;
  navbarBg: string;

  // CSS-variable palette (RGB channels are derived from these hex values).
  deep: string;
  mid: string;
  light: string;
  gold: string;
  goldLight: string;
  goldPale: string;
  cream: string;
  muted: string;
  subtle: string;
}

export interface StoreContact {
  primaryPhone: string;
  secondaryPhone?: string;
  /** Digits only, international format (used by wa.me links). */
  whatsappPhone: string;
  /** Empty string means "not published yet" — never invent an address. */
  supportEmail: string;
  addressLine: string;
  city: string;
  country: string;
  mapQuery?: string;
}

export interface StoreSocials {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  x?: string;
  linkedin?: string;
}

export interface StoreHero {
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
}

export interface StoreConfig {
  slug: string;              // URL segment, e.g. 'derme'
  name: string;              // Brand name shown to customers
  shortName: string;         // Compact brand name for narrow UI
  monogram: string;          // Logo letter
  tagline: string;           // Slogan
  navTagline: string;        // Small line under the logo
  description: string;
  businessType: string;
  tableSuffix: string;       // '_perfume_store' | '_toy_shop' | '_royal_perfume_hub'
  bucketName: string;        // Storage bucket for product images (legacy alias)
  buckets: {
    products: string;        // product images
    blog: string;            // blog cover images
    marketing: string;       // campaign/landing assets
  };
  currency: string;          // 'GHS'
  currencyCode: string;      // ISO code for Intl formatter, e.g. 'GHS'
  theme: StoreTheme;
  contact: StoreContact;
  socials: StoreSocials;
  hero: StoreHero;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  specialties: string[];
  isPerfume: boolean;
  isToy: boolean;
  /** Optional custom domain — informational for deployment docs. */
  domain?: string;
}

export const STORES: Record<string, StoreConfig> = {
  derme: {
    slug: 'derme',
    name: 'The Perfume Store Ghana',
    shortName: 'The Perfume Store',
    monogram: 'P',
    tagline: 'Luxury Fragrances',
    navTagline: 'Ghana',
    description: "Ghana's premier destination for authentic luxury fragrances. Curating excellence since 2024.",
    businessType: 'Luxury Fragrances',
    tableSuffix: '_perfume_store',
    bucketName: 'product-images-perfume-store',
    buckets: {
      products: 'product-images-perfume-store',
      blog: 'blog-images-perfume-store',
      marketing: 'marketing-assets-perfume-store',
    },
    currency: 'GHS',
    currencyCode: 'GHS',
    theme: {
      fontDisplay: 'Cormorant Garamond',
      fontBody: 'Jost',
      primaryColor: '#c9a84c',
      accentColor: '#e8c97a',
      bgPrimary: '#1a0a2e',
      navbarBg: 'rgba(26, 10, 46, 0.92)',
      deep: '#1a0a2e',
      mid: '#2d1554',
      light: '#4a2080',
      gold: '#c9a84c',
      goldLight: '#e8c97a',
      goldPale: '#f5e6b8',
      cream: '#fdf8f0',
      muted: '#8a7a9e',
      subtle: '#c4b8d4',
    },
    contact: {
      primaryPhone: '+233 24 000 0000',
      whatsappPhone: '233240000000',
      supportEmail: 'concierge@perfumestore.gh',
      addressLine: 'East Legon, Private Showroom',
      city: 'Accra',
      country: 'Ghana',
    },
    // Placeholder links preserve the existing footer layout until real
    // accounts are added.
    socials: { instagram: '#', facebook: '#', x: '#' },
    hero: {
      eyebrow: 'The Essence of Luxury',
      title: 'Elevate Your',
      accent: 'Aura.',
      description:
        "Ghana's premier selection of authentic luxury fragrances. Discover the scent that speaks your truth, curated from the world's most iconic perfume houses.",
    },
    seo: {
      title: 'The Perfume Store Ghana | Luxury Fragrances',
      description: "Ghana's premier destination for authentic luxury fragrances.",
      keywords: ['perfume', 'fragrance', 'Ghana', 'luxury perfume', 'Accra'],
    },
    specialties: [],
    isPerfume: true,
    isToy: false,
  },

  'play-time': {
    slug: 'play-time',
    name: "Tomorrow's Playground",
    shortName: "Tomorrow's Playground",
    monogram: 'T',
    tagline: 'RC Cars, Robots & Smart Toys',
    navTagline: 'RC & Robotics',
    description: 'A futuristic, friendly toy shop specializing in RC cars, AI robots, and app-connected toys.',
    businessType: 'RC Cars, Robotics & Smart Toys',
    tableSuffix: '_toy_shop',
    bucketName: 'product-images-toy-shop',
    buckets: {
      products: 'product-images-toy-shop',
      blog: 'blog-images-toy-shop',
      marketing: 'marketing-assets-toy-shop',
    },
    currency: 'GHS',
    currencyCode: 'GHS',
    theme: {
      fontDisplay: 'Space Grotesk',
      fontBody: 'Baloo 2',
      primaryColor: '#8c7ef6',
      accentColor: '#ff8f66',
      bgPrimary: '#f5f3fc',
      navbarBg: 'rgba(245, 243, 252, 0.82)',
      deep: '#23213d',
      mid: '#2e2a4d',
      light: '#8c7ef6',
      gold: '#ff8f66',
      goldLight: '#7be8ff',
      goldPale: '#f5f3fc',
      cream: '#f5f3fc',
      muted: '#5b5876',
      subtle: '#b7b3dd',
    },
    contact: {
      primaryPhone: '+233 24 000 0000',
      whatsappPhone: '233240000000',
      supportEmail: 'concierge@playtime.gh',
      addressLine: 'Accra',
      city: 'Accra',
      country: 'Ghana',
    },
    socials: { instagram: '#', facebook: '#', x: '#' },
    hero: {
      eyebrow: 'Built for Curiosity',
      title: 'Play Beyond',
      accent: 'Tomorrow.',
      description: 'RC cars, AI robots, and app-connected toys engineered for curious minds.',
    },
    seo: {
      title: "Tomorrow's Playground | RC Cars, Robots & Smart Toys",
      description: 'A futuristic toy shop specializing in RC cars, AI robots, and app-connected toys.',
      keywords: ['RC cars', 'robots', 'smart toys', 'Ghana', 'Accra'],
    },
    specialties: [],
    isPerfume: false,
    isToy: true,
  },

  'royal-perfume-hub': {
    slug: 'royal-perfume-hub',
    name: 'Royal Perfume Hub',
    shortName: 'Royal Perfume Hub',
    monogram: 'R',
    tagline: 'Unveil Your Charm',
    navTagline: 'Unveil Your Charm',
    description:
      'Wholesale and retail of designer perfumes, gift sets, and special packages. Extraits, parfums, EDP, EDT, and every concentration in between — delivered from Haatso-Bohye, Accra.',
    businessType: 'Wholesale & Retail of Designer and All Kinds of Perfumes, Gift Sets and Special Packages',
    tableSuffix: '_royal_perfume_hub',
    bucketName: 'product-images-royal-perfume-hub',
    buckets: {
      products: 'product-images-royal-perfume-hub',
      blog: 'blog-images-royal-perfume-hub',
      marketing: 'marketing-assets-royal-perfume-hub',
    },
    currency: 'GHS',
    currencyCode: 'GHS',
    theme: {
      fontDisplay: 'Cormorant Garamond',
      fontBody: 'Jost',
      // Dominant colour: Royal Plum / Deep Purple (#553553)
      primaryColor: '#553553',
      accentColor: '#d9b98c',
      bgPrimary: '#553553',
      navbarBg: 'rgba(85, 53, 83, 0.94)',
      deep: '#553553',
      mid: '#6b4569',
      light: '#8a5f87',
      gold: '#d9b98c',
      goldLight: '#ead7bc',
      goldPale: '#f5ebdd',
      cream: '#fbf7fa',
      muted: '#8a7488',
      subtle: '#d2bed0',
    },
    contact: {
      primaryPhone: '0593448658',
      secondaryPhone: '0537681940',
      whatsappPhone: '233593448658',
      // TODO: confirm the shop email before launch. Empty = not published.
      supportEmail: '',
      addressLine: 'Haatso-Bohye, Near Academic City University',
      city: 'Accra',
      country: 'Ghana',
      mapQuery: 'Haatso-Bohye, Accra, Ghana',
    },
    socials: {
      instagram: 'https://www.instagram.com/royalperfumehub',
      facebook: 'https://www.facebook.com/royalperfumehub',
      tiktok: 'https://www.tiktok.com/@royalperfumehub?_r=1&_t=ZS-9B8FqigH2SP',
    },
    hero: {
      eyebrow: 'Wholesale & Retail • Designer Fragrances',
      title: 'Unveil Your',
      accent: 'Charm.',
      description:
        'Designer perfumes, gift sets, and special packages for every mood and moment. From pure extrait to refreshing splash — find the scent that announces you.',
    },
    seo: {
      title: 'Royal Perfume Hub | Designer Perfumes, Gift Sets & Special Packages',
      description:
        'Wholesale and retail of designer perfumes, gift sets, and special packages in Haatso-Bohye, Accra. Extrait de Parfum, Parfum, EDP, EDT, Eau Fraiche, and more.',
      keywords: [
        'Royal Perfume Hub',
        'perfume Ghana',
        'designer perfume Accra',
        'gift sets',
        'wholesale perfume Ghana',
        'Extrait de Parfum',
        'Eau de Parfum',
        'Eau de Toilette',
      ],
    },
    specialties: [
      'Extrait de Parfum',
      'Parfum',
      'Eau de Parfum',
      'Eau de Toilette',
      'Eau Fraiche',
      'Eau de Senteur',
      'Splash',
      'Gift Sets',
      'Special Packages',
    ],
    isPerfume: true,
    isToy: false,
  },
};

export const storeSlugs = Object.keys(STORES);

export const STORE_COOKIE = 'jarayel_store';

export const DEFAULT_STORE_SLUG = 'derme';

/** Returns a valid store slug or null. Never falls back. */
export function resolveStoreSlug(value?: string | null): string | null {
  if (!value) return null;
  return Object.prototype.hasOwnProperty.call(STORES, value) ? value : null;
}

/**
 * The tenant a deployment is locked to, if any.
 * `STORE_SLUG` covers server/middleware; `NEXT_PUBLIC_STORE_SLUG` covers the
 * client and is also available to middleware at runtime.
 */
export function getLockedStoreSlug(): string | null {
  return (
    resolveStoreSlug(process.env.STORE_SLUG) ??
    resolveStoreSlug(process.env.NEXT_PUBLIC_STORE_SLUG)
  );
}

/**
 * Strict server-side lookup. Throws instead of silently falling back to derme,
 * so an unknown tenant can never read another store's data.
 */
export function getStore(slug: string): StoreConfig {
  const store = resolveStoreSlug(slug);
  if (!store) {
    throw new Error(`Unknown store slug: "${slug}". Check lib/stores/config.ts.`);
  }
  return STORES[store];
}

export function getStoreOrNull(slug: string): StoreConfig | null {
  const resolved = resolveStoreSlug(slug);
  return resolved ? STORES[resolved] : null;
}

/**
 * Store slug for client components that may render outside a [store] route.
 * Priority: route param → NEXT_PUBLIC_STORE_SLUG (locked deployment) → derme.
 * Only valid registered slugs are accepted.
 */
export function getPublicStoreSlug(explicit?: string | null): string {
  const locked = resolveStoreSlug(process.env.NEXT_PUBLIC_STORE_SLUG);
  if (locked) return locked;

  const requested = resolveStoreSlug(explicit);
  if (requested) return requested;

  // Browser fallback: the middleware sets this cookie on every store route.
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(
      new RegExp(`(?:^|;\\s*)${STORE_COOKIE}=([^;]+)`)
    );
    const fromCookie = match ? resolveStoreSlug(decodeURIComponent(match[1])) : null;
    if (fromCookie) return fromCookie;
  }

  return DEFAULT_STORE_SLUG;
}

// Build full table names for a given store suffix.
export function getTableName(slug: string, base: string): string {
  const store = getStore(slug);
  return `${base}${store.tableSuffix}`;
}

// Namespaced storage buckets for a store.
export function getStoreBuckets(slug: string) {
  return getStore(slug).buckets;
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

/** Convert "#553553" to "85 53 83" for Tailwind's rgb(var(--x) / <alpha>) colours. */
export function hexToRgbChannels(hex: string): string {
  const clean = hex.replace('#', '').trim();
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean;
  const int = Number.parseInt(full, 16);
  if (!Number.isFinite(int)) return '0 0 0';
  return `${(int >> 16) & 255} ${(int >> 8) & 255} ${int & 255}`;
}

/** CSS variables consumed by tailwind.config.ts (brand-* colour tokens). */
export function getStoreThemeVars(theme: StoreTheme): Record<string, string> {
  return {
    '--brand-deep': hexToRgbChannels(theme.deep),
    '--brand-mid': hexToRgbChannels(theme.mid),
    '--brand-light': hexToRgbChannels(theme.light),
    '--brand-gold': hexToRgbChannels(theme.gold),
    '--brand-gold-light': hexToRgbChannels(theme.goldLight),
    '--brand-gold-pale': hexToRgbChannels(theme.goldPale),
    '--brand-cream': hexToRgbChannels(theme.cream),
    '--brand-muted': hexToRgbChannels(theme.muted),
    '--brand-subtle': hexToRgbChannels(theme.subtle),
  };
}
