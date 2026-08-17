'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Smartphone,
  Battery,
  Truck,
  Gamepad2,
  Bot,
  Camera,
  Wifi,
  BrainCircuit,
  ArrowRight,
} from 'lucide-react';

/* -----------------------------------------------------------------------
   PLACEHOLDER DATA — mirrors the RC shop template's PRODUCTS array.
   Swap this for a real API/DB fetch when the toy_shop tables are ready.
   ----------------------------------------------------------------------- */

interface ToyProduct {
  id: string;
  name: string;
  tagline: string;
  category: string;
  tags: string[];
  price: number;
  compareAt: number | null;
  quantityAvailable: number;
  ageRating: string;
  emoji: string;
}

const TAG_META: Record<string, { label: string; icon: string }> = {
  camera: { label: 'Camera', icon: '📷' },
  vr: { label: 'VR Ready', icon: '🕶️' },
  app: { label: 'App-Controlled', icon: '📶' },
  rechargeable: { label: 'Rechargeable', icon: '🔋' },
  ai: { label: 'AI-Powered', icon: '🤖' },
  voice: { label: 'Voice Control', icon: '🎙️' },
};

const PRODUCTS: ToyProduct[] = [
  {
    id: 'rc-vralloy-crawler',
    name: 'VR Alloy Crawler RC Car with Camera',
    tagline: 'Off-road alloy crawler with live FPV camera feed',
    category: 'RC Vehicles',
    tags: ['camera', 'vr', 'app', 'rechargeable'],
    price: 79.99,
    compareAt: 99.99,
    quantityAvailable: 142,
    ageRating: '8+',
    emoji: '🚙',
  },
  {
    id: 'ai-robot-dog',
    name: 'AI Smart Robot Dog',
    tagline: 'A companion robot that learns your voice and moves',
    category: 'Robotics',
    tags: ['ai', 'voice', 'app', 'rechargeable'],
    price: 129.99,
    compareAt: 159.99,
    quantityAvailable: 61,
    ageRating: '6+',
    emoji: '🤖',
  },
  {
    id: 'rc-stunt-flip',
    name: 'Flip-Force Stunt RC Car',
    tagline: '360° flips, drives on any side, built to bounce back',
    category: 'RC Vehicles',
    tags: ['app', 'rechargeable'],
    price: 44.99,
    compareAt: null,
    quantityAvailable: 8,
    ageRating: '5+',
    emoji: '🏎️',
  },
  {
    id: 'mini-orbit-bot',
    name: 'Mini Orbit Companion Bot',
    tagline: 'A pocket-size bot that reacts to touch and light',
    category: 'Robotics',
    tags: ['ai', 'rechargeable'],
    price: 24.99,
    compareAt: 29.99,
    quantityAvailable: 210,
    ageRating: '3+',
    emoji: '🤖',
  },
];

/* -----------------------------------------------------------------------
   DESIGN TOKENS — from the RC shop template styles.css.
   Mapped to Tailwind classes where possible, inline styles where not.
   ----------------------------------------------------------------------- */

const C = {
  bg: '#f5f3fc',
  bgAlt: '#ecebfa',
  surface: '#ffffff',
  ink: '#23213d',
  inkSoft: '#5b5876',
  primary: '#8c7ef6',
  primaryDeep: '#6857e8',
  mint: '#4fd6ae',
  mintBg: '#e3faf3',
  coral: '#ff8f66',
  coralDeep: '#f2704a',
  cyanGlow: '#7be8ff',
  line: '#e2ddf7',
};

const FONTS = {
  display: '"Space Grotesk", "Segoe UI", sans-serif',
  body: '"Baloo 2", "Segoe UI", sans-serif',
  mono: '"JetBrains Mono", "Courier New", monospace',
};

/* -----------------------------------------------------------------------
   SUB-COMPONENTS
   ----------------------------------------------------------------------- */

const Eyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    style={{ fontFamily: FONTS.mono }}
    className="inline-flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.14em]"
  >
    <span
      className="inline-block w-[7px] h-[7px] rounded-full"
      style={{ background: C.coral, boxShadow: `0 0 0 4px rgba(255,143,102,0.18)` }}
    />
    <span style={{ color: C.primaryDeep }}>{children}</span>
  </span>
);

const TrustStrip: React.FC = () => {
  const items = [
    { icon: <ShieldCheck size={28} />, title: 'Safety Certified', desc: 'Every toy meets ASTM & CPSIA standards.' },
    { icon: <Smartphone size={28} />, title: 'App Compatible', desc: 'iOS & Android companion apps included where noted.' },
    { icon: <Battery size={28} />, title: 'Battery Included', desc: 'Rechargeable toys ship ready to power on.' },
    { icon: <Truck size={28} />, title: 'Transparent Shipping', desc: 'Real box weights shown before checkout — no surprises.' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[18px]">
      {items.map((item) => (
        <div
          key={item.title}
          className="text-center p-5 rounded-[18px] border"
          style={{ background: C.surface, borderColor: C.line }}
        >
          <div className="text-[1.8rem] mb-2 flex justify-center" style={{ color: C.primary }}>
            {item.icon}
          </div>
          <h4
            className="font-bold text-[0.95rem] mb-1"
            style={{ fontFamily: FONTS.body, color: C.ink }}
          >
            {item.title}
          </h4>
          <p className="text-[0.8rem]" style={{ color: C.inkSoft }}>
            {item.desc}
          </p>
        </div>
      ))}
    </div>
  );
};

const ProductCard: React.FC<{ product: ToyProduct }> = ({ product }) => {
  const level = product.quantityAvailable <= 0 ? 'out' : product.quantityAvailable <= 15 ? 'low' : 'in';
  const stockLabel = { in: 'In stock', low: 'Low stock', out: 'Out of stock' }[level];
  const dotColor = { in: C.mint, low: C.coral, out: '#c9c5df' }[level];
  const tagBadges = product.tags.slice(0, 3).map((t) => TAG_META[t]).filter(Boolean);

  return (
    <div
      className="flex flex-col gap-[10px] p-[18px] rounded-[18px] border transition-all duration-300 hover:-translate-y-1.5"
      style={{
        background: C.surface,
        borderColor: C.line,
        boxShadow: 'none',
        transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 12px 30px -14px rgba(104,87,232,0.35)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Media area */}
      <div
        className="relative aspect-[1.15/1] rounded-[10px] grid place-items-center overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${C.bgAlt}, #fff)` }}
      >
        {product.compareAt && (
          <span
            className="absolute top-3 left-3 px-[9px] py-1 rounded-full text-white text-[0.68rem] z-10"
            style={{ fontFamily: FONTS.mono, background: C.coral }}
          >
            SALE
          </span>
        )}
        <span className="text-[3.4rem]">{product.emoji}</span>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {tagBadges.map((tag) => (
          <span
            key={tag.label}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.72rem]"
            style={{ fontFamily: FONTS.mono, background: C.bgAlt, color: C.inkSoft }}
          >
            {tag.icon} {tag.label}
          </span>
        ))}
      </div>

      {/* Title & tagline */}
      <h3
        className="text-[1.02rem] font-semibold m-0"
        style={{ fontFamily: FONTS.display, color: C.ink }}
      >
        {product.name}
      </h3>
      <p className="text-[0.85rem] m-0" style={{ color: C.inkSoft }}>
        {product.tagline}
      </p>

      {/* Footer: price + age */}
      <div className="flex items-center justify-between mt-auto pt-1.5">
        <div className="flex items-baseline gap-2">
          <span
            className="font-bold text-[1.15rem]"
            style={{ fontFamily: FONTS.display, color: C.ink }}
          >
            GH₵{product.price.toFixed(2)}
          </span>
          {product.compareAt && (
            <span className="text-[0.85rem] line-through" style={{ color: C.inkSoft }}>
              GH₵{product.compareAt.toFixed(2)}
            </span>
          )}
        </div>
        <span
          className="text-[0.7rem] px-2.5 py-[3px] rounded-full border"
          style={{ fontFamily: FONTS.mono, borderColor: C.primary, color: C.primaryDeep }}
        >
          {product.ageRating}
        </span>
      </div>

      {/* Stock row */}
      <div className="flex items-center gap-1.5 text-[0.78rem]" style={{ color: C.inkSoft }}>
        <span
          className="inline-block w-2 h-2 rounded-full"
          style={{ background: dotColor }}
        />
        {stockLabel}
      </div>
    </div>
  );
};

/* -----------------------------------------------------------------------
   MAIN COMPONENT
   ----------------------------------------------------------------------- */

const PlayTimeHome: React.FC = () => {
  const categories: Array<{ label: string; icon: string; filter?: string; tag?: string }> = [
    { label: 'RC Vehicles', icon: '🚙', filter: 'RC Vehicles' },
    { label: 'Robotics', icon: '🤖', filter: 'Robotics' },
    { label: 'Camera & VR', icon: '📷', tag: 'camera' },
    { label: 'App-Controlled', icon: '📶', tag: 'app' },
    { label: 'AI-Powered', icon: '🧠', tag: 'ai' },
  ];

  const featured = PRODUCTS.slice(0, 4);

  return (
    <div style={{ background: C.bg, fontFamily: FONTS.body, color: C.ink }}>
      {/* GOOGLE FONTS */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Baloo+2:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />

      {/* ================================================================
          HERO SECTION
          ================================================================ */}
      <section
        className="relative overflow-hidden px-7 pt-16 pb-10"
        style={{
          borderRadius: '0 0 28px 28px',
          background: `
            radial-gradient(circle at 18% 20%, rgba(140,126,246,0.18), transparent 55%),
            radial-gradient(circle at 82% 75%, rgba(123,232,255,0.18), transparent 50%),
            ${C.bgAlt}
          `,
        }}
      >
        <div className="max-w-[1180px] mx-auto grid lg:grid-cols-2 gap-5 items-center min-h-[460px]">
          {/* Copy */}
          <div className="relative z-10 space-y-6">
            <Eyebrow>New arrivals weekly</Eyebrow>

            <h1
              className="text-[clamp(2.4rem,5vw,4.2rem)] leading-[1.02] m-0 tracking-tight"
              style={{ fontFamily: FONTS.display, color: C.ink }}
            >
              Toys built like tomorrow, played with like today.
            </h1>

            <p
              className="text-[1.1rem] max-w-[44ch] leading-relaxed"
              style={{ color: C.inkSoft }}
            >
              RC crawlers with live camera feeds, AI robot companions, and
              app-connected bots — engineered for kids who ask &quot;how does it
              work?&quot; before &quot;can I have it?&quot;
            </p>

            <div className="flex flex-wrap gap-3.5">
              <Link
                href="/play-time/shop"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-[0.95rem] text-white transition-all duration-300"
                style={{
                  fontFamily: FONTS.body,
                  background: C.coral,
                  boxShadow: `0 10px 24px -10px rgba(242,112,74,0.6)`,
                }}
              >
                Shop all toys <ArrowRight size={16} />
              </Link>
              <Link
                href="/play-time/shop?category=Robotics"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-[0.95rem] border-[1.5px] transition-all duration-300"
                style={{
                  fontFamily: FONTS.body,
                  background: C.surface,
                  color: C.ink,
                  borderColor: C.line,
                }}
              >
                Meet the robots
              </Link>
            </div>
          </div>

          {/* Hero visual — gradient placeholder (3D canvas would go here) */}
          <div
            className="hidden lg:block relative rounded-[28px] overflow-hidden h-[440px]"
            style={{
              background: `linear-gradient(135deg, ${C.primary}33, ${C.cyanGlow}33, ${C.bgAlt})`,
            }}
          >
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center space-y-4">
                <span className="text-[6rem] block">🚙</span>
                <span className="text-[5rem] block -mt-8">🤖</span>
              </div>
            </div>
            <div
              className="absolute bottom-3.5 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full text-[0.72rem] backdrop-blur-sm"
              style={{
                fontFamily: FONTS.mono,
                color: C.inkSoft,
                background: 'rgba(255,255,255,0.7)',
              }}
            >
              3D preview coming soon
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          CATEGORY CHIPS
          ================================================================ */}
      <section className="max-w-[1180px] mx-auto px-7 py-16">
        <div className="mb-7">
          <Eyebrow>Shop by circuit</Eyebrow>
          <h2
            className="text-[clamp(1.7rem,3vw,2.4rem)] mt-2 m-0"
            style={{ fontFamily: FONTS.display, color: C.ink }}
          >
            Find your next favorite
          </h2>
        </div>

        <div className="flex gap-3.5 overflow-x-auto pb-1.5">
          {categories.map((cat) => (
            <Link
              key={cat.label}
              href={
                cat.tag
                  ? `/play-time/shop?tag=${cat.tag}`
                  : `/play-time/shop?category=${encodeURIComponent(cat.filter!)}`
              }
              className="flex items-center gap-2.5 px-5 py-3 rounded-full font-bold text-[0.9rem] border-[1.5px] whitespace-nowrap transition-all duration-200"
              style={{
                fontFamily: FONTS.body,
                background: C.surface,
                borderColor: C.line,
                color: C.ink,
              }}
            >
              <span className="text-[1.1rem]">{cat.icon}</span>
              {cat.label}
            </Link>
          ))}
        </div>
      </section>

      {/* ================================================================
          FEATURED PRODUCTS
          ================================================================ */}
      <section className="max-w-[1180px] mx-auto px-7 pb-16">
        <div className="flex items-end justify-between gap-5 mb-7 flex-wrap">
          <div>
            <Eyebrow>Fresh off the line</Eyebrow>
            <h2
              className="text-[clamp(1.7rem,3vw,2.4rem)] mt-2 m-0"
              style={{ fontFamily: FONTS.display, color: C.ink }}
            >
              Featured toys
            </h2>
          </div>
          <Link
            href="/play-time/shop"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-[0.95rem] border-[1.5px] transition-all duration-200"
            style={{
              fontFamily: FONTS.body,
              background: C.surface,
              color: C.ink,
              borderColor: C.line,
            }}
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[22px]">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ================================================================
          TRUST STRIP
          ================================================================ */}
      <section className="max-w-[1180px] mx-auto px-7 pb-20">
        <div className="mb-7">
          <Eyebrow>Built for trust</Eyebrow>
          <h2
            className="text-[clamp(1.7rem,3vw,2.4rem)] mt-2 m-0"
            style={{ fontFamily: FONTS.display, color: C.ink }}
          >
            Parent-approved, kid-obsessed
          </h2>
        </div>
        <TrustStrip />
      </section>

      {/* ================================================================
          COMING SOON BANNER
          ================================================================ */}
      <section
        className="max-w-[1180px] mx-auto px-7 pb-20"
      >
        <div
          className="rounded-[18px] p-10 text-center border"
          style={{
            background: `linear-gradient(135deg, ${C.primary}15, ${C.cyanGlow}15)`,
            borderColor: C.line,
          }}
        >
          <span className="text-[3rem] block mb-4">🚀</span>
          <h3
            className="text-[1.5rem] font-bold m-0 mb-2"
            style={{ fontFamily: FONTS.display, color: C.ink }}
          >
            Full catalog launching soon
          </h3>
          <p className="text-[0.95rem] max-w-lg mx-auto m-0" style={{ color: C.inkSoft }}>
            We&apos;re curating the best RC cars, robots, and smart toys.
            Check back soon for the complete collection with real-time stock and
            fast checkout.
          </p>
        </div>
      </section>
    </div>
  );
};

export default PlayTimeHome;
