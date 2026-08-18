'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SmartImage from '@/components/ui/SmartImage';
import ToyProductCard from './ToyProductCard';
import {
  ShieldCheck,
  Smartphone,
  Battery,
  Truck,
  ArrowRight,
  Sparkles,
  RotateCcw,
  Zap,
  Radio
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
}

interface ToyHomePageProps {
  categories: Category[];
  featuredProducts: any[];
  storeSlug?: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  'rc-vehicles': '🚙',
  'robotics': '🤖',
  'camera-vr': '📷',
  'app-controlled': '📶',
  'ai-powered': '🧠',
};

const ToyHomePage: React.FC<ToyHomePageProps> = ({
  categories,
  featuredProducts,
  storeSlug = 'play-time'
}) => {
  return (
    <div className="bg-[#f5f3fc] font-body text-[#23213d] min-h-screen">
      {/* ================================================================
          1. HERO SECTION
          ================================================================ */}
      <section className="relative overflow-hidden px-4 sm:px-8 pt-10 sm:pt-16 pb-12 rounded-b-[36px] bg-gradient-to-b from-[#ecebfa] via-[#f5f3fc] to-[#f5f3fc] border-b border-[#e2ddf7]">
        {/* Soft background ambient glow */}
        <div className="pointer-events-none absolute -top-20 -left-20 w-96 h-96 bg-[#8c7ef6]/15 rounded-full blur-[90px]" />
        <div className="pointer-events-none absolute top-10 right-0 w-96 h-96 bg-[#7be8ff]/20 rounded-full blur-[90px]" />

        <div className="container-custom relative z-10 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Copy Area */}
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#e2ddf7] text-[#6857e8] text-xs font-mono font-semibold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#ff8f66] shadow-[0_0_0_3px_rgba(255,143,102,0.25)] animate-pulse" />
              New arrivals weekly in Accra
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-[#23213d] tracking-tight leading-[1.08]">
              Toys built like <span className="text-[#6857e8]">tomorrow</span>, played with like today.
            </h1>

            <p className="text-base sm:text-lg text-[#5b5876] max-w-xl mx-auto lg:mx-0 leading-relaxed">
              RC crawlers with live camera feeds, AI robot companions, and app-connected bots — engineered for kids and tech lovers who ask &quot;how does it work?&quot; before &quot;can I have it?&quot;
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href={`/${storeSlug}/shop`}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#ff8f66] hover:bg-[#f2704a] text-white font-bold text-base shadow-[0_10px_24px_-10px_rgba(242,112,74,0.6)] hover:-translate-y-0.5 transition-all duration-200 inline-flex items-center justify-center gap-2"
              >
                <span>Shop all toys</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                href={`/${storeSlug}/shop?category=robotics`}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white hover:bg-[#f5f3fc] border border-[#e2ddf7] text-[#23213d] hover:border-[#8c7ef6] hover:text-[#6857e8] font-bold text-base transition-all duration-200 inline-flex items-center justify-center gap-2"
              >
                <span>Meet the robots</span>
              </Link>
            </div>

            {/* Quick stats / Highlights */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-[#e2ddf7]/60 max-w-md mx-auto lg:mx-0">
              <div>
                <span className="block font-display font-bold text-xl text-[#23213d]">100%</span>
                <span className="text-xs text-[#5b5876] font-mono">Authentic Specs</span>
              </div>
              <div>
                <span className="block font-display font-bold text-xl text-[#23213d]">24hr</span>
                <span className="text-xs text-[#5b5876] font-mono">Accra Delivery</span>
              </div>
              <div>
                <span className="block font-display font-bold text-xl text-[#23213d]">ASTM</span>
                <span className="text-xs text-[#5b5876] font-mono">Certified Safe</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Card Showcase */}
          <div className="relative aspect-[4/3] sm:aspect-[16/11] rounded-3xl overflow-hidden border border-[#e2ddf7] bg-white p-3 shadow-xl">
            <div className="relative w-full h-full rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1594787318286-3d835c1d207f?q=80&w=1000&auto=format&fit=crop"
                alt="Tomorrow's Playground RC Crawler"
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#23213d]/80 via-transparent to-transparent" />

              {/* Floating feature pills */}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#4fd6ae] text-[#23213d] shadow-md">
                  ● Ready to Run
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-white/90 text-[#23213d] backdrop-blur shadow-md">
                  📷 720p FPV Live
                </span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 text-white flex items-end justify-between">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-[#7be8ff]">Featured Highlight</span>
                  <h3 className="text-xl font-display font-bold text-white">VR Alloy Crawler 4WD</h3>
                </div>
                <Link
                  href={`/${storeSlug}/products/rc-vralloy-crawler`}
                  className="px-4 py-2 rounded-full bg-[#ff8f66] hover:bg-[#f2704a] text-white text-xs font-bold font-body shadow-md inline-flex items-center gap-1 shrink-0"
                >
                  View Details <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          2. SHOP BY CIRCUIT (CATEGORY CHIPS)
          ================================================================ */}
      <section className="py-14 container-custom">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#6857e8] font-semibold block mb-1">
              Shop by Circuit
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#23213d]">
              Find your next favorite
            </h2>
          </div>
          <Link
            href={`/${storeSlug}/shop`}
            className="text-xs font-bold text-[#6857e8] hover:text-[#ff8f66] transition-colors hidden sm:inline-flex items-center gap-1"
          >
            All categories <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => {
            const icon = CATEGORY_ICONS[cat.slug] || '🎮';
            return (
              <Link
                key={cat.id}
                href={`/${storeSlug}/shop?category=${cat.slug}`}
                className="group p-5 rounded-2xl bg-white border border-[#e2ddf7] hover:border-[#8c7ef6] transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col items-center text-center gap-3"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#ecebfa] group-hover:bg-[#8c7ef6] group-hover:text-white grid place-items-center text-2xl transition-colors">
                  <span>{icon}</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#23213d] group-hover:text-[#6857e8] transition-colors font-display">
                    {cat.name}
                  </h3>
                  <span className="text-[11px] text-[#5b5876] font-mono mt-0.5 block">Explore →</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ================================================================
          3. FEATURED TOYS GRID
          ================================================================ */}
      {featuredProducts.length > 0 && (
        <section className="py-14 bg-white border-y border-[#e2ddf7]">
          <div className="container-custom">
            <div className="flex items-end justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#6857e8] font-semibold block mb-1">
                  Fresh Off The Line
                </span>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#23213d]">
                  Featured Toys
                </h2>
              </div>
              <Link
                href={`/${storeSlug}/shop`}
                className="px-5 py-2.5 rounded-full border border-[#e2ddf7] hover:border-[#8c7ef6] text-[#23213d] hover:text-[#6857e8] text-xs font-bold font-body transition-all inline-flex items-center gap-1.5"
              >
                View all toys <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((p: any) => {
                const primaryVariant = p.variants?.[0];
                const masterStock = primaryVariant?.inventory?.current_stock_level ?? 10;

                return (
                  <ToyProductCard
                    key={p.id}
                    id={p.id}
                    slug={p.slug}
                    title={p.title}
                    description={p.description}
                    image={p.base_image_url}
                    category={p.category}
                    price={Number(primaryVariant?.price) || 0}
                    compareAtPrice={p.compare_at_price ? Number(p.compare_at_price) : null}
                    discountPercent={p.discount_percent || 0}
                    ageRating={p.age_rating || '6+'}
                    tags={p.tags || []}
                    quantityAvailable={masterStock}
                    variantId={primaryVariant?.id}
                    variantName={primaryVariant?.name}
                    storeSlug={storeSlug}
                  />
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ================================================================
          4. WHY SHOP WITH US / TRUST STRIP
          ================================================================ */}
      <section className="py-16 container-custom">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-mono uppercase tracking-widest text-[#6857e8] font-semibold block mb-1">
            Built for Trust
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#23213d]">
            Parent-Approved, Kid-Obsessed
          </h2>
          <p className="text-sm text-[#5b5876] mt-2">
            Every vehicle, robot, and smart device is rigorously checked for durability, safety, and battery reliability.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-[#e2ddf7] text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#e3faf3] text-[#4fd6ae] grid place-items-center mx-auto text-xl">
              <ShieldCheck size={26} />
            </div>
            <h4 className="font-bold text-base text-[#23213d]">Safety Certified</h4>
            <p className="text-xs text-[#5b5876] leading-relaxed">
              Every toy meets ASTM & CPSIA international standards for non-toxic materials and electronics.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#e2ddf7] text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#ecebfa] text-[#8c7ef6] grid place-items-center mx-auto text-xl">
              <Smartphone size={26} />
            </div>
            <h4 className="font-bold text-base text-[#23213d]">App Compatible</h4>
            <p className="text-xs text-[#5b5876] leading-relaxed">
              Free iOS & Android companion applications included for live FPV streaming and trick programming.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#e2ddf7] text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#fff2eb] text-[#ff8f66] grid place-items-center mx-auto text-xl">
              <Battery size={26} />
            </div>
            <h4 className="font-bold text-base text-[#23213d]">Battery Included</h4>
            <p className="text-xs text-[#5b5876] leading-relaxed">
              Rechargeable models ship with Li-Po batteries and USB fast chargers ready to power on.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#e2ddf7] text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#e6f9ff] text-[#7be8ff] grid place-items-center mx-auto text-xl">
              <Truck size={26} className="text-[#0284c7]" />
            </div>
            <h4 className="font-bold text-base text-[#23213d]">Transparent Shipping</h4>
            <p className="text-xs text-[#5b5876] leading-relaxed">
              Real box dimensions and net weights shown on product pages — zero surprise fees at checkout.
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================
          5. CALL TO ACTION BANNER
          ================================================================ */}
      <section className="pb-20 container-custom">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-[#8c7ef6] to-[#6857e8] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <span className="text-xs font-mono uppercase tracking-widest text-[#7be8ff] font-semibold block">
              Ready for Adventure?
            </span>
            <h3 className="text-2xl sm:text-3xl font-display font-bold leading-tight">
              Get 10% off your first RC crawler or companion robot.
            </h3>
            <p className="text-sm text-white/80 font-body">
              Join Tomorrow&apos;s Playground and elevate your playtime with cutting-edge tech in Ghana.
            </p>
          </div>

          <Link
            href={`/${storeSlug}/shop`}
            className="px-8 py-4 rounded-full bg-white text-[#23213d] hover:bg-[#ff8f66] hover:text-white font-bold text-sm transition-all duration-300 shadow-lg shrink-0 inline-flex items-center gap-2"
          >
            <span>Explore The Store</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ToyHomePage;
