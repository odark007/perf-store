'use client';

import React from 'react';
import Link from 'next/link';
import {
  Instagram,
  Facebook,
  Twitter,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  CreditCard
} from 'lucide-react';
import { StoreSettings } from '@/lib/types';

interface FooterProps {
  settings?: StoreSettings | null;
}

const Footer: React.FC<FooterProps> = ({ settings }) => {
  const currentYear = new Date().getFullYear();

  // Fallbacks if DB is empty
  const phone = settings?.primary_phone || '+233 24 000 0000';
  const email = settings?.support_email || 'concierge@perfumestore.gh';

  const footerLinks = {
    shop: [
      { label: 'All Fragrances', href: '/shop' },
      { label: "Men's Fragrances", href: '/shop?category=mens' },
      { label: "Women's Fragrances", href: '/shop?category=womens' },
      { label: 'Unisex & Niche', href: '/shop?category=unisex' },
      { label: 'Gift Sets', href: '/shop?category=gift-sets' },
      { label: 'Body Mists', href: '/shop?category=body-mists' },
    ],
    support: [
      { label: 'Track Order', href: '/account/history' },
      { label: 'Shipping Policy', href: '/shipping' },
      { label: 'Returns & Exchanges', href: '/returns' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Contact Us', href: '/contact' },
    ],
    company: [
      { label: 'Our Story', href: '/about' },
      { label: 'The Scent Journal', href: '/blog' },
      { label: 'Authenticity Guarantee', href: '/authenticity' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
    ]
  };

  return (
    <footer className="bg-[#1a0a2e] text-[#c4b8d4] border-t border-[rgba(201,168,76,0.2)] mt-auto font-body">
      {/* 1. Value Props / Trust Signals */}
      <div className="border-b border-[rgba(201,168,76,0.1)]">
        <div className="container-custom py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
            <div className="p-3 bg-[#2d1554] rounded-lg text-[#c9a84c]">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-white mb-1 uppercase tracking-wider text-sm">100% Authentic</h4>
              <p className="text-xs leading-relaxed">Direct from authorized luxury distributors worldwide.</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
            <div className="p-3 bg-[#2d1554] rounded-lg text-[#c9a84c]">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-white mb-1 uppercase tracking-wider text-sm">Swift Delivery</h4>
              <p className="text-xs leading-relaxed">Same-day delivery within Accra for orders before 2PM.</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
            <div className="p-3 bg-[#2d1554] rounded-lg text-[#c9a84c]">
              <RotateCcw size={24} />
            </div>
            <div>
              <h4 className="font-bold text-white mb-1 uppercase tracking-wider text-sm">Easy Returns</h4>
              <p className="text-xs leading-relaxed">7-day hassle-free return policy on sealed products.</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
            <div className="p-3 bg-[#2d1554] rounded-lg text-[#c9a84c]">
              <Sparkles size={24} />
            </div>
            <div>
              <h4 className="font-bold text-white mb-1 uppercase tracking-wider text-sm">Luxury Gift Wrap</h4>
              <p className="text-xs leading-relaxed">Complementary premium gift wrapping on all orders.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Content */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="flex items-center gap-3 group justify-center lg:justify-start">
              <div className="w-10 h-10 bg-gradient-to-br from-[#c9a84c] to-[#e8c97a] rounded-full flex items-center justify-center shadow-lg shadow-gold/20">
                <span className="font-display font-bold text-[#1a0a2e] text-xl">P</span>
              </div>
              <span className="font-display font-bold text-2xl text-[#c9a84c] tracking-tight uppercase">
                The Perfume Store
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-sm text-center lg:text-left">
              Ghana's premier destination for luxury fragrances. We curate only the finest authentic scents from iconic fashion houses and niche artisanal perfumers across the globe.
            </p>
            <div className="flex items-center justify-center lg:justify-start gap-4 pt-2">
              <a href="#" className="w-10 h-10 flex items-center justify-center bg-[#2d1554] hover:bg-[#c9a84c] hover:text-[#1a0a2e] rounded-full transition-all border border-[rgba(201,168,76,0.1)]" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center bg-[#2d1554] hover:bg-[#c9a84c] hover:text-[#1a0a2e] rounded-full transition-all border border-[rgba(201,168,76,0.1)]" aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center bg-[#2d1554] hover:bg-[#c9a84c] hover:text-[#1a0a2e] rounded-full transition-all border border-[rgba(201,168,76,0.1)]" aria-label="Twitter">
                <Twitter size={18} />
              </a>
            </div>
          </div>

          <div className="lg:col-span-1 hidden lg:block" />

          {/* Links Columns */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-[0.2em] text-[10px]">Collection</h4>
              <ul className="space-y-4">
                {footerLinks.shop.map(link => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-xs hover:text-[#c9a84c] transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-[0.2em] text-[10px]">Client Care</h4>
              <ul className="space-y-4">
                {footerLinks.support.map(link => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-xs hover:text-[#c9a84c] transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1">
              <h4 className="font-bold text-white mb-6 uppercase tracking-[0.2em] text-[10px]">Concierge</h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-xs">
                  <Mail size={14} className="text-[#c9a84c]" />
                  <a href={`mailto:${email}`} className="hover:text-[#c9a84c]">{email}</a>
                </li>
                <li className="flex items-center gap-3 text-xs">
                  <Phone size={14} className="text-[#c9a84c]" />
                  <a href={`tel:${phone.replace(/\s+/g, '')}`} className="hover:text-[#c9a84c]">{phone}</a>
                </li>
                <li className="flex items-start gap-3 text-xs">
                  <MapPin size={14} className="text-[#c9a84c] mt-0.5 shrink-0" />
                  <span>East Legon, Private Showroom<br />Accra, Ghana</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Bar */}
      <div className="border-t border-[rgba(201,168,76,0.1)] bg-[#130624]">
        <div className="container-custom py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[10px] text-gold-pale/40 uppercase tracking-widest font-medium">
            © {currentYear} The Perfume Store Ghana. All Rights Reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-[10px] uppercase tracking-widest hover:text-[#c9a84c] transition-colors">Privacy</Link>
            <Link href="/terms" className="text-[10px] uppercase tracking-widest hover:text-[#c9a84c] transition-colors">Terms</Link>
            <Link href="/shipping" className="text-[10px] uppercase tracking-widest hover:text-[#c9a84c] transition-colors">Shipping</Link>
          </div>
          <div className="flex items-center gap-4">
            <CreditCard size={20} className="text-gold-pale/20" />
            <span className="text-[10px] uppercase tracking-widest text-gold-pale/20 border border-[rgba(201,168,76,0.1)] px-2 py-1 rounded">SSL Secure</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
