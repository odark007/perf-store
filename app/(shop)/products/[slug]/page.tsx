import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProductBySlug, getRelatedProducts, getProductReviews } from '@/app/actions/shop';
import ProductGallery from '@/components/shop/product/ProductGallery';
import ProductInfo from '@/components/shop/product/ProductInfo';
import ReviewsSection from '@/components/shop/product/ReviewsSection';
import ProductCard from '@/components/shop/ProductCard';
import { ArrowLeft, Sparkles } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Dynamic Metadata for SEO/Sharing
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Product Not Found' };

  const storeName = 'The Perfume Store Ghana';
  const title = `${product.title}${product.brand ? ` by ${product.brand}` : ''} | ${storeName}`;
  const description = product.description?.slice(0, 160) || `Discover ${product.title} at ${storeName}. Authentic luxury fragrances delivered in Ghana.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://perfumestoreghana.com/products/${slug}`,
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
  const { slug } = await params;

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

  // 3. Prepare Variants with Stock Logic
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
            href={`/shop?category=${product.categories?.slug || ''}`}
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

        {/* SECTION 1: PRODUCT HERO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left: Premium Gallery */}
          <div className="lg:sticky lg:top-24">
            <ProductGallery image={product.base_image_url} title={product.title} />
          </div>

          {/* Right: Interactive Product Space */}
          <ProductInfo product={product} variants={uiVariants} />
        </div>

        {/* SECTION 2: RELATED FINDS */}
        {relatedProducts.length > 0 && (
          <section className="pt-24 border-t border-brand-border">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div className="space-y-2">
                <span className="text-brand-gold font-bold tracking-[0.3em] uppercase text-[10px]">Discovery</span>
                <h2 className="text-3xl font-display font-bold text-brand-deep">Olfactive Relatives</h2>
              </div>
              <Link href="/shop" className="text-xs font-bold uppercase tracking-widest text-brand-deep hover:text-brand-gold transition-colors underline underline-offset-8">
                View Entire Collection
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {relatedProducts.slice(0, 4).map((p: any) => {
                const relatedUiVariants = p.variants.map((v: any) => ({
                  id: v.id,
                  name: v.name,
                  type: v.type,
                  price: v.price,
                  stock_deduction: v.stock_deduction || 1,
                  master_stock: v.inventory?.current_stock_level || 0
                }));

                return (
                  <ProductCard
                    key={p.id}
                    id={p.id}
                    slug={p.slug}
                    title={p.title}
                    image={p.base_image_url}
                    category={p.categories?.name || 'Fragrance'}
                    variants={relatedUiVariants}
                    isFeatured={p.is_featured}
                    brand={p.brand}
                    concentration={p.concentration}
                    scentFamily={p.scentFamily}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* SECTION 3: VOICES (REVIEWS) */}
        <section id="reviews" className="scroll-mt-24 pt-24 border-t border-brand-border">
          <ReviewsSection productId={product.id} reviews={reviews} />
        </section>

      </div>
    </div>
  );
}
