import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Truck, Wine, HeartHandshake, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';

export const metadata = {
  title: 'About Us | LiquorShop Ghana',
  description: 'Your premium destination for authentic wines, spirits, and beers in Accra.',
};

export default function AboutPage() {
  return (
    <div className="bg-white">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?q=80&w=1920&auto=format&fit=crop"
            alt="Toasting glasses"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-secondary-900/70" />
        </div>

        {/* Content */}
        <div className="relative z-10 container-custom text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
            Celebrating Life, <br />
            <span className="text-primary-500">One Sip at a Time.</span>
          </h1>
          <p className="text-lg md:text-xl text-secondary-200 max-w-2xl mx-auto">
            Ghana's premium concierge for authentic wines, spirits, and craft beers. 
            Delivered from our cellar to your doorstep.
          </p>
        </div>
      </section>

      {/* 2. OUR STORY */}
      <section className="py-16 md:py-24 container-custom">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <span className="text-primary-600 font-bold tracking-wider uppercase text-sm">Our Story</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-secondary-900">
            Why We Started
          </h2>
          <p className="text-secondary-600 leading-relaxed text-lg">
            Founded in 2024, LiquorShop was born out of a simple frustration: the hassle of finding authentic premium drinks in the busy streets of Accra. 
          </p>
          <p className="text-secondary-600 leading-relaxed text-lg">
            We wanted to create a platform that combines the curated selection of a high-end boutique with the convenience of modern e-commerce. Whether you are stocking up for a wedding, a corporate event, or just a quiet Friday night, we believe the process should be seamless, transparent, and reliable.
          </p>
        </div>
      </section>

      {/* 3. VALUE PROPS (Why Choose Us) */}
      <section className="bg-secondary-50 py-16 md:py-24">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-secondary-100 text-center hover:-translate-y-1 transition-transform duration-300">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">100% Authentic</h3>
              <p className="text-secondary-500">
                We source directly from manufacturers and authorized distributors. No fakes, no diluted drinks. Just the real deal.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-secondary-100 text-center hover:-translate-y-1 transition-transform duration-300">
              <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Truck size={32} />
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">Fast Delivery</h3>
              <p className="text-secondary-500">
                Skip the traffic. We deliver across Greater Accra and beyond. Your order arrives safe, chilled, and on time.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-secondary-100 text-center hover:-translate-y-1 transition-transform duration-300">
              <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Wine size={32} />
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">Curated Selection</h3>
              <p className="text-secondary-500">
                From local favorites like premium Sobolo to rare Single Malt Whiskies, our catalog is hand-picked for quality.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. RESPONSIBLE DRINKING */}
      <section className="py-16 bg-secondary-900 text-white">
        <div className="container-custom flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-3 text-amber-500 mb-2">
              <HeartHandshake size={24} />
              <span className="font-bold uppercase tracking-wide">Our Commitment</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold">
              Drink Responsibly
            </h2>
            <p className="text-secondary-300 text-lg leading-relaxed">
              We are committed to safe consumption. We strictly enforce the 18+ age limit for all purchases. Alcohol is meant to be enjoyed, not abused. Please drink in moderation and never drink and drive.
            </p>
          </div>
          <div className="flex-shrink-0 relative w-full md:w-1/3 aspect-square bg-secondary-800 rounded-2xl overflow-hidden border border-secondary-700">
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8 border-4 border-white/20 rounded-full w-48 h-48 flex flex-col items-center justify-center">
                   <span className="text-5xl font-bold text-white">18+</span>
                   <span className="text-sm text-secondary-400 mt-2 uppercase tracking-widest">Legal Age Only</span>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 5. CTA */}
      <section className="py-20 text-center container-custom">
        <h2 className="text-3xl font-display font-bold text-secondary-900 mb-6">
          Ready to stock your cellar?
        </h2>
        <Link href="/shop">
          <Button size="lg" className="px-8 h-14 text-lg" rightIcon={<ArrowRight size={20} />}>
            Explore Our Collection
          </Button>
        </Link>
      </section>

    </div>
  );
}