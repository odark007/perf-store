import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getTables, getStoreOrNull } from '@/lib/stores/config';
import { notFound } from 'next/navigation';
import ProductCard from '@/components/shop/ProductCard';
import { Gift } from 'lucide-react';

export const dynamic = 'force-dynamic';

const SPECIALS_META: Record<string, { title: string; tagline: string; description: string; setType: 'gift-set'; Icon: any }> = {
  'gift-sets': {
    title: 'Gift Sets',
    tagline: 'Curated Collections',
    description: "Handpicked fragrances packed into beautiful sets — perfect for gifting. Each set is priced as one and may include exclusive items you won't find sold individually.",
    setType: 'gift-set',
    Icon: Gift,
  },
};

interface PageProps {
  params: Promise<{ store: string; type: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { store: storeSlug, type } = await params;
  const meta = SPECIALS_META[type];
  const store = getStoreOrNull(storeSlug);
  if (!meta || !store || !store.isPerfume) return { title: 'Specials' };
  return {
    title: `${meta.title} | ${store.name}`,
    description: meta.description,
  };
}

export default async function SpecialsPage({ params }: PageProps) {
  const { store: storeSlug, type } = await params;
  const meta = SPECIALS_META[type];
  const store = getStoreOrNull(storeSlug);
  // Set bundles are a perfume-store feature.
  if (!meta || !store || !store.isPerfume) notFound();

  const t = getTables(storeSlug);
  const supabase = await createClient();

  // Fetch bundles of this set type
  const { data: products, error } = await (supabase as any)
    .from(t.products)
    .select(`
      *,
      variants:${t.productVariants}(
        *,
        inventory:${t.inventory} (current_stock_level)
      )
    `)
    .eq('is_active', true)
    .eq('set_type', meta.setType)
    .order('created_at', { ascending: false });

  if (error) {
    const err = error as any;
    const missingTable =
      err?.code === 'PGRST205' ||
      /could not find the table|relation .* does not exist/i.test(String(err?.message || ''));

    if (missingTable) {
      console.warn(`[specials] ${storeSlug} tables are not provisioned yet.`);
      return (
        <div className="container-custom py-24 text-center">
          <h1 className="text-3xl font-display font-bold text-brand-deep mb-3">{meta.title} coming soon</h1>
          <p className="text-brand-muted max-w-md mx-auto">
            This collection is being prepared. Please check back shortly.
          </p>
        </div>
      );
    }

    console.error('Specials Page Error:', err);
    return <div className="container-custom py-12">Error loading {meta.title}.</div>;
  }

  const { Icon } = meta;

  return (
    <div className="container-custom py-10 md:py-16">
      {/* Header */}
      <div className="max-w-2xl mb-10 md:mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(201,168,76,0.12)] border border-[rgba(201,168,76,0.3)] text-[#c9a84c] text-xs font-bold uppercase tracking-widest mb-5">
          <Icon size={14} />
          {meta.tagline}
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-[#c9a84c] mb-4">{meta.title}</h1>
        <p className="text-[#c4b8d4] leading-relaxed">{meta.description}</p>
      </div>

      {/* Grid */}
      {products && products.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {products.map((product: any) => {
            const uiVariants = (product.variants || []).map((v: any) => ({
              id: v.id,
              name: v.name,
              type: v.type,
              price: v.price,
              stock_deduction: v.stock_deduction || 1,
              master_stock: v.inventory?.current_stock_level || 0,
            }));

            return (
              <ProductCard
                key={product.id}
                id={product.id}
                slug={product.slug}
                title={product.title}
                image={product.base_image_url}
                category={product.categories?.name || meta.title}
                variants={uiVariants}
                isFeatured={product.is_featured}
                brand={product.brand}
                concentration={product.concentration}
                scent_family={product.scent_family}
                discountPercent={product.discount_percent}
                discountStart={product.discount_start_at}
                discountEnd={product.discount_end_at}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-24 bg-[rgba(45,21,84,0.3)] rounded-3xl border border-[rgba(201,168,76,0.15)]">
          <Icon size={40} className="mx-auto text-[#c9a84c]/40 mb-4" />
          <p className="text-[#c4b8d4] mb-2 font-medium">No {meta.title.toLowerCase()} available yet.</p>
          <p className="text-sm text-[#8a7a9e] mb-6">Check back soon — new sets are on the way.</p>
          <Link href={`/${storeSlug}/shop`} className="inline-flex items-center gap-2 text-[#c9a84c] font-semibold text-sm hover:gap-3 transition-all">
            Browse all fragrances →
          </Link>
        </div>
      )}
    </div>
  );
}
