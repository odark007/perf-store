import React from 'react';
import { STORES } from '@/lib/stores/config';
import HeroScene from '@/components/portal/HeroScene';
import ShopCard from '@/components/portal/ShopCard';

export const metadata = {
  title: 'Jarayel Technologies | Commerce Platform',
  description: 'Jarayelɔ — the Ga word meaning "merchant" or "trader". A welcoming home for our family of online shops.',
};

const SHOP_META: Record<string, { accent: 'gold' | 'purple'; icon: React.ReactNode }> = {
  derme: {
    accent: 'gold',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <path
          d="M9 2h6M10 2v3.2c0 .4-.15.78-.42 1.06L7.4 8.5c-.6.6-.9 1.4-.9 2.24V19a3 3 0 0 0 3 3h5a3 3 0 0 0 3-3v-8.26c0-.84-.3-1.64-.9-2.24l-2.18-2.24A1.5 1.5 0 0 1 14 5.2V2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M7 14h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  'play-time': {
    accent: 'purple',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <rect x="4" y="8" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 8V6a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="9" cy="13" r="1" fill="currentColor" />
        <circle cx="15" cy="13" r="1" fill="currentColor" />
      </svg>
    ),
  },
};

export default function PortalPage() {
  const stores = Object.values(STORES);

  return (
    <div
      className="relative font-portal-body text-[#211A2E] overflow-x-hidden"
      style={{
        background:
          'radial-gradient(60% 50% at 85% 8%, rgba(255, 182, 39, 0.25), transparent 60%), radial-gradient(50% 45% at 8% 15%, rgba(108, 79, 214, 0.18), transparent 60%), radial-gradient(60% 50% at 50% 100%, rgba(255, 107, 74, 0.14), transparent 60%), linear-gradient(180deg, #FFF9EF 0%, #FFEFD6 100%)',
      }}
    >
      {/* Film grain overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[2] opacity-[0.035]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* 3D canvas sits behind everything in the hero */}
      <HeroScene />

      {/* ---------- NAV ---------- */}
      <header className="relative z-[3] flex items-center justify-between px-[6vw] pt-[26px] max-[860px]:px-[5vw] max-[860px]:pt-5">
        <div className="flex items-center gap-3">
          <span className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center font-portal-display font-black text-[19px] text-white bg-gradient-to-br from-[#FF6B4A] to-[#FFB627] shadow-[0_8px_18px_-6px_rgba(255,107,74,0.55)]">
            J
          </span>
          <div className="flex flex-col leading-[1.15]">
            <span className="font-bold text-[15px]">Jarayel Technologies</span>
            <span className="text-[11px] tracking-[0.08em] uppercase text-[#5B5468] max-[520px]:hidden">Commerce Platform</span>
          </div>
        </div>
      </header>

      <main>
        {/* ---------- HERO ---------- */}
        <section className="relative z-[3] min-h-[92vh] flex items-center px-[6vw] pt-10 pb-[60px] max-[860px]:min-h-0 max-[860px]:pt-[30px] max-[860px]:pb-10">
          <div className="max-w-[760px]">
            <p className="inline-flex items-center gap-2 text-[14.5px] font-medium text-[#5B5468] tracking-[0.01em] mb-[26px]">
              <span className="text-[#FFB627] text-base inline-block animate-[spin-slow_6s_linear_infinite]">✦</span>
              Jarayel<span className="italic">ɔ</span> — the Ga word meaning{' '}
              <em className="text-[#6C4FD6] not-italic font-semibold">“merchant”</em> or{' '}
              <em className="text-[#6C4FD6] not-italic font-semibold">“trader”</em>
            </p>

            <h1 className="font-portal-display font-black tracking-[-0.01em] leading-[1.06] text-[clamp(2.6rem,6vw,4.6rem)] mb-7 max-[520px]:text-[2.2rem]">
              We hope you have an{' '}
              <span className="relative inline-block italic font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B4A] via-[#FFB627] to-[#6C4FD6]">
                awesome time
                <svg className="absolute left-0 -bottom-1.5 w-full h-[14px] overflow-visible" viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M2 18 C 60 4, 120 22, 160 12 S 260 2, 298 14" fill="none" stroke="#FF6B4A" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>{' '}
              interacting with our shops.
            </h1>

            <p className="text-lg leading-[1.6] text-[#5B5468] max-w-[500px] mb-9 max-[520px]:text-base">
              Jarayel Technologies is a home for carefully curated online stores. Pick a shop below, and begin your journey.
            </p>

            <div className="flex items-center gap-[22px] flex-wrap max-[520px]:flex-col max-[520px]:items-start max-[520px]:gap-3.5">
              <a
                href="#shops"
                className="group inline-flex items-center gap-2.5 bg-[#211A2E] text-[#FFF9EF] font-semibold text-[15px] px-6 py-[15px] rounded-full no-underline shadow-[0_10px_24px_-10px_rgba(33,26,46,0.5)] transition-all duration-[250ms] hover:-translate-y-[3px] hover:bg-[#6C4FD6] hover:shadow-[0_14px_30px_-10px_rgba(108,79,214,0.55)]"
              >
                Browse the shops
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform duration-[250ms] group-hover:translate-x-[3px]">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <span className="text-[12.5px] text-[#5B5468] opacity-75">Drag / move your cursor to play with the scene →</span>
            </div>
          </div>
        </section>

        {/* ---------- SHOPS ---------- */}
        <section id="shops" className="relative z-[3] px-[6vw] pt-5 pb-[90px] max-[860px]:px-[5vw] max-[860px]:pt-2.5 max-[860px]:pb-[60px]">
          <div className="mb-10">
            <h2 className="font-portal-display font-black text-[clamp(1.8rem,3.4vw,2.6rem)] mb-2">Open for trade</h2>
            <p className="text-[#5B5468] text-base">Two storefronts, curated with care. More are on the way.</p>
          </div>

          <div className="grid grid-cols-2 gap-[26px] max-[860px]:grid-cols-1">
            {stores.map((store) => {
              const meta = SHOP_META[store.slug] ?? SHOP_META['derme'];
              return (
                <ShopCard
                  key={store.slug}
                  href={`/${store.slug}`}
                  accent={meta.accent}
                  icon={meta.icon}
                  name={store.name}
                  tagline={store.tagline}
                  description={store.description}
                />
              );
            })}
          </div>
        </section>
      </main>

      {/* ---------- FOOTER ---------- */}
      <footer className="relative z-[3] flex items-center justify-between flex-wrap gap-2 px-[6vw] pt-[26px] pb-[34px] border-t border-[#211A2E]/[0.08] text-[13.5px] text-[#5B5468] max-[860px]:px-[5vw]">
        <p>© {new Date().getFullYear()} Jarayel Technologies. All rights reserved.</p>
        <p className="italic">Bridging commerce and technology.</p>
      </footer>
    </div>
  );
}
