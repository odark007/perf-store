import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Truck, Sparkles, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import { getStoreOrNull } from '@/lib/stores/config';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ store: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { store: storeSlug } = await params;
  const store = getStoreOrNull(storeSlug);
  if (!store) return { title: 'About Us' };
  return {
    title: `About Us | ${store.name}`,
    description: store.seo.description,
  };
}

export default async function AboutPage({ params }: PageProps) {
  const { store: storeSlug } = await params;
  const store = getStoreOrNull(storeSlug);
  if (!store) notFound();

  return (
    <div className="bg-white">

      {/* 1. HERO SECTION */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1585120040315-2241b774ad0f?q=80&w=1920&auto=format&fit=crop"
            alt="Luxury perfume"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-brand-deep/80" />
        </div>

        <div className="relative z-10 container-custom text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
            {store.hero.title} <br />
            <span className="text-brand-gold italic">{store.hero.accent}</span>
          </h1>
          <p className="text-lg md:text-xl text-brand-cream/90 max-w-2xl mx-auto">
            {store.description}
          </p>
        </div>
      </section>

      {/* 2. OUR STORY */}
      <section className="py-16 md:py-24 container-custom">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <span className="text-brand-gold font-bold tracking-wider uppercase text-sm">Our Story</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-brand-deep">
            Why We Started
          </h2>
          <p className="text-secondary-600 leading-relaxed text-lg">
            {store.name} exists to make authentic designer fragrance simple to buy in Ghana —
            whether you are shopping for yourself, gifting someone, or stocking a shelf.
          </p>
          <p className="text-secondary-600 leading-relaxed text-lg">
            {store.businessType}. We focus on honest sourcing, clear pricing, and delivery you can
            rely on from our base in {store.contact.city}.
          </p>
        </div>
      </section>

      {/* 3. SPECIALTIES (perfume) */}
      {store.specialties.length > 0 && (
        <section className="py-12 bg-brand-cream/40">
          <div className="container-custom">
            <div className="text-center mb-10">
              <span className="text-brand-gold font-bold tracking-[0.3em] uppercase text-[10px]">What We Carry</span>
              <h2 className="text-3xl font-display font-bold text-brand-deep mt-2">Every Concentration</h2>
            </div>
            <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
              {store.specialties.map((item) => (
                <span
                  key={item}
                  className="px-4 py-2 rounded-full border border-brand-border bg-white text-sm font-medium text-brand-deep"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. VALUE PROPS */}
      <section className="bg-secondary-50 py-16 md:py-24">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-secondary-100 text-center hover:-translate-y-1 transition-transform duration-300">
              <div className="w-16 h-16 bg-brand-gold/10 text-brand-deep rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">100% Authentic</h3>
              <p className="text-secondary-500">
                We source from trusted distributors and verify every batch. No fakes, no diluted
                product — just the real thing.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-secondary-100 text-center hover:-translate-y-1 transition-transform duration-300">
              <div className="w-16 h-16 bg-brand-gold/10 text-brand-deep rounded-full flex items-center justify-center mx-auto mb-6">
                <Truck size={32} />
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">Reliable Delivery</h3>
              <p className="text-secondary-500">
                Dispatch across Greater Accra, with regional and international options where
                available. Your order is packed with care.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-secondary-100 text-center hover:-translate-y-1 transition-transform duration-300">
              <div className="w-16 h-16 bg-brand-gold/10 text-brand-deep rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles size={32} />
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">Curated Selection</h3>
              <p className="text-secondary-500">
                From everyday fresh scents to statement evening fragrances and packed gift sets —
                our catalogue is chosen for quality.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. CTA */}
      <section className="py-20 text-center container-custom">
        <h2 className="text-3xl font-display font-bold text-brand-deep mb-6">
          Ready to find your signature scent?
        </h2>
        <Link href={`/${storeSlug}/shop`}>
          <Button size="lg" className="px-8 h-14 text-lg" rightIcon={<ArrowRight size={20} />}>
            Explore Our Collection
          </Button>
        </Link>
      </section>

    </div>
  );
}
