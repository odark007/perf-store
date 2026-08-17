import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldCheck, Sparkles, MapPin, LayoutGrid, Heart, Search, Gift } from 'lucide-react';
import Button from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/server';
import { getTables } from '@/lib/stores/config';
import ProductCard from '@/components/shop/ProductCard';
import BlogCard from '@/components/blog/BlogCard';
import CampaignCarousel from '@/components/shop/CampaignCarousel';
import PlayTimeHome from '@/components/shop/PlayTimeHome';

export const metadata = {
  title: 'The Perfume Store Ghana | Luxury Fragrances & Niche Scents',
  description: 'Ghana\'s premier destination for authentic luxury fragrances. From timeless classics to rare niche scents, elevate your essence with our curated collection.',
  openGraph: {
    title: 'The Perfume Store Ghana | Luxury Fragrances',
    description: 'Elevate your essence. Discover authentic luxury fragrances delivered to your door in Accra.',
    images: ['/og-image.png'],
  },
};

export const dynamic = 'force-dynamic';

export default async function HomePage({ params }: { params: Promise<{ store: string }> }) {
  const { store: storeSlug } = await params;

  // Toy shop: render the dedicated RC-template-styled homepage
  if (storeSlug === 'play-time') {
    return <PlayTimeHome />;
  }

  const t = getTables(storeSlug);
  const supabase = await createClient();

  const [featuredRes, blogRes, samplerRes, campaignRes] = await Promise.all([
    // A. Featured Products
    supabase
      .from(t.products)
      .select(`
        *,
        ${t.categories}(name),
        variants:${t.productVariants}(
          *,
          inventory:${t.inventory}(current_stock_level)
        )
      `)
      .eq('is_featured', true)
      .limit(4) as any,

    // B. Latest Blog Posts
    supabase
      .from(t.posts)
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(3),

    // C. The Scent Discovery Pool
    supabase
      .from(t.products)
      .select(`
        *,
        ${t.categories}(id, name),
        variants:${t.productVariants}(
          *,
          inventory:${t.inventory}(current_stock_level)
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(20) as any,

    // D. Campaigns
    supabase
      .from(t.campaigns)
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
  ]);

  const featuredProducts = featuredRes.data || [];
  const latestPosts = blogRes.data || [];
  const rawPool = samplerRes.data || [];

  // Campaign Logic
  const allCampaigns = campaignRes.data || [];
  const now = new Date();
  const displayCampaigns = allCampaigns.filter((c: any) => {
    const start = c.start_at ? new Date(c.start_at) : new Date('2000-01-01');
    const end = c.end_at ? new Date(c.end_at) : new Date('2099-01-01');
    return now >= start && now <= end;
  }).slice(0, 5);

  // Sampler Logic
  const stockProducts = rawPool.filter((p: any) => {
    const totalStock = p.variants.reduce((sum: number, v: any) => sum + (v.inventory?.current_stock_level || 0), 0);
    return totalStock > 0;
  });

  const samplerProducts: any[] = [];
  const seenCategories = new Set();

  for (const product of stockProducts) {
    if (featuredProducts.find((fp: any) => fp.id === product.id)) continue;
    if (!seenCategories.has(product.categories?.id)) {
      samplerProducts.push(product);
      seenCategories.add(product.categories?.id);
    }
    if (samplerProducts.length >= 4) break;
  }

  return (
    <div className="bg-brand-cream/10">

      {/* SECTION A: LUXURY HERO */}
      <div className="relative min-h-[85vh] flex items-center overflow-hidden bg-brand-deep">
        {/* Background Accents */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-gold/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-light/5 rounded-full blur-[100px]" />

        <div className="container-custom relative z-10 py-20 text-center lg:text-left grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-brand-gold/30 bg-brand-gold/5 backdrop-blur-sm">
              <Sparkles size={14} className="text-brand-gold" />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-brand-gold">
                The Essence of Luxury
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white leading-[1.1] tracking-tight">
              Elevate Your <br />
              <span className="text-brand-gold italic">Aura.</span>
            </h1>

            <p className="text-lg md:text-xl text-brand-cream/90 max-w-xl mx-auto lg:mx-0 font-body leading-relaxed">
              Ghana's premier selection of authentic luxury fragrances. Discover the scent that speaks your truth, curated from the world's most iconic perfume houses.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Link href={`/${storeSlug}/shop`} className="w-full sm:w-auto">
                <Button size="xl" className="w-full bg-brand-gold text-brand-deep hover:bg-white hover:text-brand-deep border-none shadow-xl shadow-brand-gold/20">
                  Explore Collection
                </Button>
              </Link>
              <Link href={`/${storeSlug}/about`} className="w-full sm:w-auto">
                <Button variant="outline" size="xl" className="w-full border-brand-gold/30 text-white hover:bg-brand-gold/10">
                  Our Philosophy
                </Button>
              </Link>
            </div>
          </div>

          <div className="hidden lg:block relative aspect-[4/5] w-full max-w-md ml-auto">
            <div className="absolute inset-0 border-[1px] border-brand-gold/20 translate-x-8 translate-y-8 rounded-2xl" />
            <div className="relative h-full rounded-2xl overflow-hidden shadow-2xl border border-brand-gold/10">
              <Image
                src="https://images.unsplash.com/photo-1585120040315-2241b774ad0f?q=80&w=1000&auto=format&fit=crop"
                alt="Luxury Perfume Bottle"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION B: SCENT EXPERIENCES (CATEGORY TILES) */}
      <section className="py-24 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-brand-deep italic">Curated Collections</h2>
            <div className="w-24 h-[1px] bg-brand-gold mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href={`/${storeSlug}/shop?category=mens`} className="group relative h-[450px] rounded-2xl overflow-hidden shadow-2xl border border-brand-border">
              <Image src="https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=800&auto=format&fit=crop" alt="Mens" fill className="object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-deep via-brand-deep/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              <div className="absolute bottom-10 left-10 text-white">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-gold mb-2 block">Masculine</span>
                <h3 className="text-3xl font-display font-bold">Pour Homme</h3>
                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-brand-gold/80 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                  Discover Now <ArrowRight size={14} />
                </div>
              </div>
            </Link>

            <Link href={`/${storeSlug}/shop?category=womens`} className="group relative h-[450px] rounded-2xl overflow-hidden shadow-2xl border border-brand-border md:translate-y-[-20px]">
              <Image src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop" alt="Womens" fill className="object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-deep via-brand-deep/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              <div className="absolute bottom-10 left-10 text-white">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-gold mb-2 block">Feminine</span>
                <h3 className="text-3xl font-display font-bold">Pour Femme</h3>
                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-brand-gold/80 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                  Discover Now <ArrowRight size={14} />
                </div>
              </div>
            </Link>

            <Link href={`/${storeSlug}/shop?category=unisex`} className="group relative h-[450px] rounded-2xl overflow-hidden shadow-2xl border border-brand-border">
              <Image src="https://images.unsplash.com/photo-1615484477778-ca3b77940c25?q=80&w=800&auto=format&fit=crop" alt="Unisex" fill className="object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-deep via-brand-deep/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              <div className="absolute bottom-10 left-10 text-white">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-gold mb-2 block">Modern</span>
                <h3 className="text-3xl font-display font-bold">Unisex & Niche</h3>
                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-brand-gold/80 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                  Discover Now <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION C: FEATURED FRAGRANCES */}
      {featuredProducts.length > 0 && (
        <section className="py-24 bg-brand-cream/20">
          <div className="container-custom">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div className="space-y-2">
                <span className="text-brand-gold font-bold tracking-[0.3em] uppercase text-[10px]">The Masterpieces</span>
                <h2 className="text-4xl font-display font-bold text-brand-deep">Iconic Selections</h2>
              </div>
              <Link href={`/${storeSlug}/shop`} className="group flex items-center gap-3 text-brand-deep font-bold text-sm tracking-widest uppercase hover:text-brand-gold transition-colors">
                View All Fragrances <div className="w-8 h-[1px] bg-brand-deep group-hover:bg-brand-gold transition-colors" />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
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
                    category={p.categories?.name || 'Fragrance'}
                    variants={uiVariants}
                    isFeatured={p.is_featured}
                    brand={p.brand}
                    concentration={p.concentration}
                    scent_family={p.scent_family}
                    discountPercent={p.discount_percent}
                    discountStart={p.discount_start_at}
                    discountEnd={p.discount_end_at}
                  />
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* SECTION D: THE PERFUME STORE ESSENCE */}
      <section className="py-24 bg-brand-deep text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')]" />
        </div>

        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1 relative aspect-square max-w-lg mx-auto lg:mx-0">
              <div className="absolute inset-0 border border-brand-gold/30 translate-x-10 translate-y-10 rounded-2xl" />
              <div className="relative h-full rounded-2xl overflow-hidden">
                <Image src="https://images.unsplash.com/photo-1458538977777-0549b2370168?q=80&w=800&auto=format&fit=crop" alt="Essence" fill className="object-cover" />
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-10">
              <div className="space-y-4">
                <span className="text-brand-gold font-bold tracking-[0.3em] uppercase text-[10px]">The Essence</span>
                <h2 className="text-4xl md:text-5xl font-display font-bold italic">Uncompromising Quality</h2>
                <p className="text-brand-cream/90 text-lg leading-relaxed font-body">
                  At The Perfume Store, we believe a fragrance is more than a scent—it&apos;s a legacy. We source exclusively from authorized distributors to ensure every bottle is a masterpiece of authenticity.
                </p>
              </div>

              <div className="grid gap-8">
                <div className="flex gap-6 group">
                  <div className="w-14 h-14 bg-brand-gold/5 rounded-full flex items-center justify-center flex-shrink-0 border border-brand-gold/20 group-hover:bg-brand-gold/20 transition-all">
                    <ShieldCheck size={28} className="text-brand-gold" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg tracking-wide uppercase text-sm mb-1">Authenticity Guaranteed</h4>
                    <p className="text-brand-cream/60 text-sm">Every scent is meticulously verified. We tolerate no compromises.</p>
                  </div>
                </div>

                <div className="flex gap-6 group">
                  <div className="w-14 h-14 bg-brand-gold/5 rounded-full flex items-center justify-center flex-shrink-0 border border-brand-gold/20 group-hover:bg-brand-gold/20 transition-all">
                    <MapPin size={28} className="text-brand-gold" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg tracking-wide uppercase text-sm mb-1">Luxury Logistics</h4>
                    <p className="text-brand-cream/60 text-sm">Temperature-controlled storage and discreet, secure delivery.</p>
                  </div>
                </div>

                <div className="flex gap-6 group">
                  <div className="w-14 h-14 bg-brand-gold/5 rounded-full flex items-center justify-center flex-shrink-0 border border-brand-gold/20 group-hover:bg-brand-gold/20 transition-all">
                    <Heart size={28} className="text-brand-gold" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg tracking-wide uppercase text-sm mb-1">Personalized Concierge</h4>
                    <p className="text-brand-cream/60 text-sm">Expert guidance to help you find your signature olfactive identity.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: CAMPAIGN SPOTLIGHT */}
      {displayCampaigns.length > 0 && (
        <section className="py-12">
          <CampaignCarousel campaigns={displayCampaigns} />
        </section>
      )}

      {/* SECTION E: THE GIFT CONCIERGE */}
      <section className="py-24 bg-brand-gold text-brand-deep relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="container-custom relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left space-y-8">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-brand-deep/5 backdrop-blur-sm border border-brand-deep/10">
              <Gift size={16} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Bespoke Gifting</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight">Art of Gifting</h2>
            <p className="text-lg font-body leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
              Make every occasion unforgettable with our luxury gift services. From corporate orders to private celebration favors, we provide premium wrapping and customized olfactive consultations.
            </p>
            <Link href={`/${storeSlug}/contact`} className="inline-block">
              <Button size="xl" className="bg-brand-deep text-white hover:bg-[#2d1554] border-none px-12 shadow-2xl">
                Connect with Concierge
              </Button>
            </Link>
          </div>

          <div className="hidden lg:flex justify-end relative">
            <div className="w-[80%] aspect-[4/3] bg-brand-deep/5 rounded-2xl border border-brand-deep/10 flex items-center justify-center overflow-hidden rotate-2 shadow-2xl">
              <Image src="https://images.unsplash.com/photo-1549439602-43ebca2327af?q=80&w=800&auto=format&fit=crop" alt="Gifts" fill className="object-cover opacity-80" />
            </div>
            <div className="absolute top- [-20px] left-0 w-[40%] aspect-square bg-[#c4b8d4] rounded-2xl border-4 border-brand-gold -rotate-12 shadow-2xl flex items-center justify-center p-4">
              <Sparkles className="text-brand-deep w-12 h-12" />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION F: THE SCENT JOURNAL */}
      {latestPosts.length > 0 && (
        <section className="py-24 container-custom">
          <div className="text-center mb-16 space-y-4">
            <span className="text-brand-gold font-bold tracking-[0.3em] uppercase text-[10px]">Olfactive Notes</span>
            <h2 className="text-4xl font-display font-bold text-brand-deep italic">The Scent Journal</h2>
            <p className="text-brand-muted max-w-xl mx-auto">Explore the history, artistry, and hidden notes of fine perfumery.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {latestPosts.map((post: any) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
          <div className="text-center mt-16">
            <Link href={`/${storeSlug}/blog`}>
              <Button variant="outline" className="px-12 border-brand-gold/30 text-brand-deep hover:bg-brand-gold/5 font-bold tracking-widest uppercase text-xs">
                Enter The Journal
              </Button>
            </Link>
          </div>
        </section>
      )}

    </div>
  );
}
