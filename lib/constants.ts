export const PRODUCT_CATEGORIES = [
    { slug: 'mens', label: "Men's Fragrances", tag: 'The After Dark' },
    { slug: 'womens', label: "Women's Fragrances", tag: 'The Bloom' },
    { slug: 'unisex', label: 'Unisex & Niche', tag: 'The Artisan' },
    { slug: 'gift-sets', label: 'Gift Sets', tag: 'The Gift' },
    { slug: 'body-mists', label: 'Body Mists', tag: 'The Everyday' },
    { slug: 'oud', label: 'Oud Collection', tag: 'The Heritage' },
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number]['slug'];

export const getCategoryLabel = (slug: string) => {
    return PRODUCT_CATEGORIES.find(c => c.slug === slug)?.label || slug;
};

export const getCategoryTag = (slug: string) => {
    return PRODUCT_CATEGORIES.find(c => c.slug === slug)?.tag || 'The Collection';
};
