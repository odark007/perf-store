import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProductBySlug, getRelatedProducts, getProductReviews } from '@/app/actions/shop';
import ProductGallery from '@/components/shop/product/ProductGallery';
import ProductInfo from '@/components/shop/product/ProductInfo';
import ReviewsSection from '@/components/shop/product/ReviewsSection';
import ProductCard from '@/components/shop/ProductCard';
import { ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Dynamic Metadata for SEO/Sharing
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Product Not Found' };

  return {
    title: `${product.title} | LiquorShop`,
    description: product.description?.slice(0, 160),
    openGraph: {
      images: [product.base_image_url],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Fetch Main Data
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound(); // Triggers Next.js 404 page
  }

  // 2. Fetch Related & Reviews (Parallel Fetching for speed)
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
    master_stock: v.inventory?.current_stock_level || 0
  }));

  return (
    <div className="container-custom py-12 space-y-20">

      {/* Back Button */}
      <div className="-mb-10">
        <Link
          href={`/shop?category=${product.categories?.slug || ''}`}
          className="inline-flex items-center gap-2 text-sm text-secondary-500 hover:text-primary-600 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to {product.categories?.name || 'Shop'}
        </Link>
      </div>

      {/* SECTION 1: HERO (Details) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
        {/* Left: Image */}
        <ProductGallery image={product.base_image_url} title={product.title} />

        {/* Right: Interactive Info */}
        <ProductInfo product={product} variants={uiVariants} />
      </div>

      {/* SECTION 2: RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-secondary-100 pt-16">
          <h2 className="text-2xl font-display font-bold text-secondary-900 mb-8">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p: any) => {
              // Map related variants for card
              const relatedUiVariants = p.variants.map((v: any) => ({
                id: v.id,
                name: v.name,
                type: v.type,
                price: v.price,
                stock: Math.floor((v.inventory?.current_stock_level || 0) / v.stock_deduction),
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
                  category={p.category || 'Drink'} // Fallback text category
                  variants={relatedUiVariants}
                  isFeatured={p.is_featured}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* SECTION 3: REVIEWS */}
      <section id="reviews" className="scroll-mt-24">
        <ReviewsSection productId={product.id} reviews={reviews} />
      </section>

    </div>
  );
}