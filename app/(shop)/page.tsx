import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldCheck, Snowflake, MapPin, Wine, Beer, Martini, LayoutGrid } from 'lucide-react';
import Button from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/server';
import ProductCard from '@/components/shop/ProductCard';
import BlogCard from '@/components/blog/BlogCard';
import CampaignCarousel from '@/components/shop/CampaignCarousel';

export const metadata = {
  title: 'LiquorShop Ghana | Premium Drinks Delivered',
  description: 'Order authentic wine, spirits, and beer in Accra. Fast delivery, chilled drinks, and bulk event services.',
  openGraph: {
    title: 'LiquorShop Ghana | Premium Drinks Delivered',
    description: 'From our cellar to your glass. Authentic drinks delivered fast in Accra.',
    images: ['/og-image.png'],
  },
};

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = await createClient();

  const [featuredRes, blogRes, samplerRes, campaignRes] = await Promise.all([
    // A. Featured Products
    supabase
      .from('products')
      .select(`
        *,
        categories(name),
        variants:product_variants(
          *,
          inventory:inventory_master(current_stock_level)
        )
      `)
      .eq('is_featured', true)
      .eq('is_active', true)
      .limit(4),

    // B. Latest Blog Posts
    supabase
      .from('posts')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(3),

    // C. The Mixer Pool
    supabase
      .from('products')
      .select(`
        *,
        categories(id, name),
        variants:product_variants(
          *,
          inventory:inventory_master(current_stock_level)
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(20),

    // D. Campaigns (Fetch all active, filter dates in JS)
    supabase
      .from('marketing_campaigns')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
  ]);

  const featuredProducts = featuredRes.data || [];
  const latestPosts = blogRes.data || [];
  const rawPool = samplerRes.data || [];

  // Campaign Logic: Filter for ALL active campaigns within date range
  const allCampaigns = campaignRes.data || [];
  const now = new Date();

  const activeCampaigns = allCampaigns.filter((c: any) => {
    const start = c.start_at ? new Date(c.start_at) : new Date('2000-01-01');
    const end = c.end_at ? new Date(c.end_at) : new Date('2099-01-01');
    return now >= start && now <= end;
  });

  // Limit to avoid carousel overload (e.g. max 5)
  const displayCampaigns = activeCampaigns.slice(0, 5);

  // Mixer Logic
  const stockProducts = rawPool.filter((p: any) => {
    const totalStock = p.variants.reduce((sum: number, v: any) => sum + (v.inventory?.current_stock_level || 0), 0);
    return totalStock > 0;
  });

  const samplerProducts: any[] = [];
  const seenCategories = new Set();

  for (const product of stockProducts) {
    if (featuredProducts.find(fp => fp.id === product.id)) continue;
    if (!seenCategories.has(product.categories?.id)) {
      samplerProducts.push(product);
      seenCategories.add(product.categories?.id);
    }
    if (samplerProducts.length >= 4) break;
  }

  if (samplerProducts.length < 4) {
    for (const product of stockProducts) {
      if (featuredProducts.find(fp => fp.id === product.id)) continue;
      if (samplerProducts.find(sp => sp.id === product.id)) continue;
      samplerProducts.push(product);
      if (samplerProducts.length >= 4) break;
    }
  }

  return (
    <div className="bg-white">

      {/* SECTION A: HERO */}
      <div className="container-custom py-12 md:py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-display font-bold text-secondary-900 mb-6">
          Premium Drinks, <br />
          <span className="text-primary-600">Delivered to Your Door</span>
        </h1>
        <p className="text-lg text-secondary-600 max-w-2xl mx-auto mb-8">
          Experience Ghana's finest selection of wines, spirits, and beers.
          Order now for fast, reliable delivery.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/shop">
            <Button size="lg">Shop Now</Button>
          </Link>
          <Link href="/about">
            <Button variant="outline" size="lg">Learn More</Button>
          </Link>
        </div>
      </div>

      {/* SECTION B: SHOP BY MOOD */}
      <section className="py-12 bg-secondary-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/shop?category=beer" className="group relative h-80 rounded-2xl overflow-hidden shadow-md">
              <Image src="/beersCider.jpg" alt="Cold Beer" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <div className="flex items-center gap-2 mb-2 text-amber-400">
                  <Beer size={20} />
                  <span className="text-xs font-bold uppercase tracking-wider">The After Work</span>
                </div>
                <h3 className="text-2xl font-display font-bold">Beers & Ciders</h3>
              </div>
            </Link>
            <Link href="/shop?category=spirits" className="group relative h-80 rounded-2xl overflow-hidden shadow-md">
              <Image src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=600&auto=format&fit=crop" alt="Cocktails" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <div className="flex items-center gap-2 mb-2 text-amber-400">
                  <Martini size={20} />
                  <span className="text-xs font-bold uppercase tracking-wider">The Nightcap</span>
                </div>
                <h3 className="text-2xl font-display font-bold">Spirits & Mixers</h3>
              </div>
            </Link>
            <Link href="/shop?category=wine" className="group relative h-80 rounded-2xl overflow-hidden shadow-md">
              <Image src="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=600&auto=format&fit=crop" alt="Wine Pour" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <div className="flex items-center gap-2 mb-2 text-amber-400">
                  <Wine size={20} />
                  <span className="text-xs font-bold uppercase tracking-wider">The Celebration</span>
                </div>
                <h3 className="text-2xl font-display font-bold">Wines & Champagne</h3>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION C: FEATURED SELECTION */}
      {featuredProducts.length > 0 && (
        <section className="py-16 md:py-24 container-custom">
          <div className="flex justify-between items-end mb-8">
            <div>
              <span className="text-primary-600 font-bold tracking-wider uppercase text-sm">Top Shelf</span>
              <h2 className="text-3xl font-display font-bold text-secondary-900 mt-1">Featured Selections</h2>
            </div>
            <Link href="/shop?featured=true" className="hidden md:flex items-center gap-2 text-secondary-600 hover:text-primary-600 transition-colors font-medium">
              View All Specials <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((p: any) => {
              const uiVariants = p.variants.map((v: any) => ({
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
                  category={p.categories?.name || 'Drink'}
                  variants={uiVariants}
                  isFeatured={p.is_featured}
                  discountPercent={p.discount_percent}
                  discountStart={p.discount_start_at}
                  discountEnd={p.discount_end_at}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* SECTION D: VALUE PROPOSITION */}
      <section className="py-16 bg-white border-y border-secondary-100">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2 relative h-[400px] rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="https://images.unsplash.com/photo-1616401784845-180882ba9ba8?q=80&w=800&auto=format&fit=crop"
                alt="Delivery Rider"
                fill
                className="object-cover"
              />
            </div>
            <div className="w-full md:w-1/2 space-y-8">
              <div className="space-y-4">
                <span className="text-primary-600 font-bold tracking-wider uppercase text-sm">Why Choose Us</span>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-secondary-900">The LiquorShop Promise</h2>
                <p className="text-secondary-600 text-lg leading-relaxed">
                  We know the hassle of finding quality drinks in Accra. We built LiquorShop to give you peace of mind, one bottle at a time.
                </p>
              </div>
              <div className="grid gap-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0"><Snowflake size={24} /></div>
                  <div><h4 className="font-bold text-secondary-900 text-lg">Chilled on Arrival</h4><p className="text-secondary-500">We keep it cold so you can drink immediately.</p></div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center flex-shrink-0"><ShieldCheck size={24} /></div>
                  <div><h4 className="font-bold text-secondary-900 text-lg">100% Authentic</h4><p className="text-secondary-500">Sourced directly from manufacturers. Guaranteed.</p></div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center flex-shrink-0"><MapPin size={24} /></div>
                  <div><h4 className="font-bold text-secondary-900 text-lg">GPS Precision</h4><p className="text-secondary-500">Our riders use Ghana Post GPS to find your door.</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: CAMPAIGN SPOTLIGHT (CAROUSEL) */}
      {displayCampaigns.length > 0 && (
        <CampaignCarousel campaigns={displayCampaigns} />
      )}

      {/* SECTION: CATEGORY SAMPLER */}
      {samplerProducts.length > 0 && (
        <section className="py-20 bg-secondary-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <span className="text-primary-600 font-bold tracking-wider uppercase text-sm">Discover More</span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-secondary-900 mt-2 mb-4">Explore Our Collection</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {samplerProducts.map((p: any) => {
                const uiVariants = p.variants.map((v: any) => ({
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
                    category={p.categories?.name || 'Drink'}
                    variants={uiVariants}
                    isFeatured={p.is_featured}
                    discountPercent={p.discount_percent}
                    discountStart={p.discount_start_at}
                    discountEnd={p.discount_end_at}
                  />
                );
              })}
            </div>
            <div className="text-center mt-10">
              <Link href="/shop"><Button size="lg" className="px-10" leftIcon={<LayoutGrid size={20} />}>View Full Catalog</Button></Link>
            </div>
          </div>
        </section>
      )}

      {/* SECTION E: BULK CONCIERGE */}
      <section className="py-20 bg-secondary-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="container-custom relative z-10 text-center max-w-3xl mx-auto">
          <span className="text-amber-500 font-bold tracking-wider uppercase text-sm mb-4 block">Events & Corporate</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Planning a Wedding or Party?</h2>
          <p className="text-secondary-300 text-lg mb-8 leading-relaxed">Let us handle the bar. We offer special bulk pricing and professional advice.</p>
          <Link href="/contact">
            <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-black border-none px-8">Get a Bulk Quote</Button>
          </Link>
        </div>
      </section>

      {/* SECTION F: LATEST NEWS */}
      {latestPosts.length > 0 && (
        <section className="py-16 md:py-24 container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-secondary-900 mb-4">The Cellar Journal</h2>
            <p className="text-secondary-500">Culture, recipes, and guides.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestPosts.map((post: any) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/blog"><Button variant="outline">Read All Stories</Button></Link>
          </div>
        </section>
      )}

    </div>
  );
}