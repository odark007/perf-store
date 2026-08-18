import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProductBySlug, getRelatedProducts, getProductReviews } from '@/app/actions/shop';
import { createClient } from '@/lib/supabase/server';
import { getTables, getStore } from '@/lib/stores/config';
import ProductGallery from '@/components/shop/product/ProductGallery';
import ProductInfo from '@/components/shop/product/ProductInfo';
import ReviewsSection from '@/components/shop/product/ReviewsSection';
import ProductCard from '@/components/shop/ProductCard';
import ToyProductDetail from '@/components/shop/toy/ToyProductDetail';
import { ArrowLeft, Sparkles } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string; store: string }>;
}

// Dynamic Metadata for SEO/Sharing
export async function generateMetadata({ params }: PageProps) {
  const { slug, store: storeSlug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Product Not Found' };

  const store = getStore(storeSlug);
  const storeName = store.name;
  const title = `${product.title} | ${storeName}`;
  const description = product.description?.slice(0, 160) || `Discover ${product.title} at ${storeName}. Fast delivery in Ghana.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: storeName,
      images: [
        {
          url: product.base_image_url,
          width: 1200,
          height: 630,
          alt: product.title,
        },
      ],
      locale: 'en_GH',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [product.base_image_url],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug, store: storeSlug } = await params;

  // 1. Fetch Main Data
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // 2. Fetch Related & Reviews
  const [relatedProducts, reviews] = await Promise.all([
    getRelatedProducts(product.category_id, product.id),
    getProductReviews(product.id)
  ]);

  // =========================================================================
  // TOY SHOP PRODUCT DETAIL (/play-time)
  // =========================================================================
  if (storeSlug === 'play-time') {
    const supabase = await createClient();
    const t = getTables(storeSlug);

    // Fetch all RC products for comparison table
    const { data: rcProducts } = await supabase
      .from(t.products)
      .select(`
        *,
        variants:${t.productVariants}(price)
      `)
      .eq('category', 'RC Vehicles');

    return (
      <ToyProductDetail
        product={product}
        allRcProducts={rcProducts || []}
        relatedProducts={relatedProducts || []}
        storeSlug={storeSlug}
      />
    );
  }

  // =========================================================================
  // PERFUME STORE PRODUCT DETAIL (/derme)
  // =========================================================================
  const uiVariants = product.variants.map((v: any) => ({
    id: v.id,
    name: v.name,
    type: v.type,
    price: v.price,
    stock: Math.floor((v.inventory?.current_stock_level || 0) / v.stock_deduction),
    stock_deduction: v.stock_deduction || 1,
    master_stock: v.inventory?.current_stock_level || 0,
    size: v.size
  }));

  return (
    <div className="bg-brand-cream/10 min-h-screen">
      <div className="container-custom py-12 md:py-20 space-y-24">

        {/* Navigation & Breadcrumb */}
        <div className="flex items-center justify-between -mb-12">
          <Link
            href={`/${storeSlug}/shop?category=${product.categories?.slug || ''}`}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-muted hover:text-brand-gold transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to {product.categories?.name || 'Collection'}
          </Link>

          <div className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold/50">
            <Sparkles size={12} />
            <span>Authenticity Guaranteed</span>
          </div>
        </div>

        {/* Top Section: Gallery + Essential Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <ProductGallery
            image={product.base_image_url}
            title={product.title}
          />

          <ProductInfo
            product={product}
            variants={uiVariants}
          />
        </div>

        {/* Middle Section: Scent Profile & Reviews Tabs */}
        <ReviewsSection
          productId={product.id}
          reviews={reviews}
        />

        {/* Bottom Section: Related Products */}
        {relatedProducts.length > 0 && (
          <div className="space-y-8 border-t border-brand-border/40 pt-16">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-gold">
                  Curated For You
                </span>
                <h2 className="text-3xl font-display font-bold text-brand-deep mt-1">
                  Complementary Scents
                </h2>
              </div>
              <Link
                href={`/${storeSlug}/shop?category=${product.categories?.slug || ''}`}
                className="text-xs font-bold uppercase tracking-widest text-brand-deep hover:text-brand-gold transition-colors"
              >
                View Collection →
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relProduct: any) => {
                const relVariants = relProduct.variants.map((v: any) => ({
                  id: v.id,
                  name: v.name,
                  type: v.type,
                  price: v.price,
                  stock_deduction: v.stock_deduction || 1,
                  master_stock: v.inventory?.current_stock_level || 0
                }));

                return (
                  <ProductCard
                    key={relProduct.id}
                    id={relProduct.id}
                    slug={relProduct.slug}
                    title={relProduct.title}
                    image={relProduct.base_image_url}
                    category={relProduct.categories?.name || 'Fragrance'}
                    variants={relVariants}
                    isFeatured={relProduct.is_featured}
                    brand={relProduct.brand}
                    concentration={relProduct.concentration}
                    scent_family={relProduct.scent_family}
                    discountPercent={relProduct.discount_percent}
                    discountStart={relProduct.discount_start_at}
                    discountEnd={relProduct.discount_end_at}
                  />
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
