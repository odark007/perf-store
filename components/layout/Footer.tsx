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
  CreditCard,
  Smartphone,
  Battery,
  Music2
} from 'lucide-react';
import { StoreSettings } from '@/lib/types';
import { getStoreOrNull, STORES, DEFAULT_STORE_SLUG } from '@/lib/stores/config';
import { formatPhoneForGH } from '@/lib/utils';

interface FooterProps {
  settings?: StoreSettings | null;
  storeSlug?: string;
}

const Footer: React.FC<FooterProps> = ({ settings, storeSlug = DEFAULT_STORE_SLUG }) => {
  const currentYear = new Date().getFullYear();
  const store = getStoreOrNull(storeSlug) ?? STORES[DEFAULT_STORE_SLUG];
  storeSlug = store.slug;
  const isToyShop = store.isToy;

  // DB settings win; the store registry is the safe fallback.
  const phone = settings?.primary_phone || store.contact.primaryPhone;
  const email = settings?.support_email || store.contact.supportEmail;
  const address = `${store.contact.addressLine}, ${store.contact.city}, ${store.contact.country}`;

  // =========================================================================
  // TOY SHOP FOOTER
  // =========================================================================
  if (isToyShop) {
    const toyFooterLinks = {
      shop: [
        { label: 'All Toys', href: `/${storeSlug}/shop` },
        { label: 'RC Vehicles', href: `/${storeSlug}/shop?category=rc-vehicles` },
        { label: 'Robotics', href: `/${storeSlug}/shop?category=robotics` },
        { label: 'Camera & VR', href: `/${storeSlug}/shop?category=camera-vr` },
        { label: 'App-Controlled', href: `/${storeSlug}/shop?category=app-controlled` },
        { label: 'AI-Powered', href: `/${storeSlug}/shop?category=ai-powered` },
      ],
      support: [
        { label: 'Track Order', href: `/${storeSlug}/account/history` },
        { label: 'Shipping & Returns', href: `/${storeSlug}/shipping` },
        { label: 'Warranty Lookup', href: `/${storeSlug}/warranty` },
        { label: 'FAQ', href: `/${storeSlug}/faq` },
        { label: 'Contact Us', href: `/${storeSlug}/contact` },
      ],
      company: [
        { label: 'Our Story', href: `/${storeSlug}/about` },
        { label: 'Safety Standards', href: `/${storeSlug}/safety` },
        { label: 'Terms of Service', href: `/${storeSlug}/terms` },
        { label: 'Privacy Policy', href: `/${storeSlug}/privacy` },
      ]
    };

    return (
      <footer className="bg-[#23213d] text-[#e4e2f5] mt-auto font-body">
        {/* Trust Signals */}
        <div className="border-b border-[#3b3859]">
          <div className="container-custom py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-[#2e2a4d] border border-[#3e3a63]">
              <ShieldCheck size={26} className="text-[#4fd6ae] shrink-0" />
              <div>
                <h4 className="font-bold text-white text-sm">Safety Certified</h4>
                <p className="text-[11px] text-[#b7b3dd]">ASTM & CPSIA safety standard compliant.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-[#2e2a4d] border border-[#3e3a63]">
              <Smartphone size={26} className="text-[#7be8ff] shrink-0" />
              <div>
                <h4 className="font-bold text-white text-sm">App Compatible</h4>
                <p className="text-[11px] text-[#b7b3dd]">iOS & Android companion apps included.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-[#2e2a4d] border border-[#3e3a63]">
              <Battery size={26} className="text-[#8c7ef6] shrink-0" />
              <div>
                <h4 className="font-bold text-white text-sm">Battery Included</h4>
                <p className="text-[11px] text-[#b7b3dd]">Rechargeable toys ship ready to play.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-[#2e2a4d] border border-[#3e3a63]">
              <Truck size={26} className="text-[#ff8f66] shrink-0" />
              <div>
                <h4 className="font-bold text-white text-sm">Transparent Shipping</h4>
                <p className="text-[11px] text-[#b7b3dd]">Real box weights shown before checkout.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="container-custom py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Brand Column */}
            <div className="lg:col-span-5 space-y-4">
              <Link href={`/${storeSlug}`} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8c7ef6] to-[#7be8ff] flex items-center justify-center">
                  <div className="w-3 h-3 bg-[#23213d] rounded-sm animate-pulse" />
                </div>
                <span className="font-bold text-xl text-white tracking-tight font-display">
                  {store.shortName}
                </span>
              </Link>
              <p className="text-xs leading-relaxed max-w-sm text-[#b7b3dd]">
                {store.description}
              </p>
              <div className="flex items-center gap-3 pt-2">
                {store.socials.instagram && (
                  <a href={store.socials.instagram} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-[#2e2a4d] hover:bg-[#8c7ef6] hover:text-white grid place-items-center text-[#b7b3dd] transition-all" aria-label="Instagram">
                    <Instagram size={16} />
                  </a>
                )}
                {store.socials.facebook && (
                  <a href={store.socials.facebook} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-[#2e2a4d] hover:bg-[#8c7ef6] hover:text-white grid place-items-center text-[#b7b3dd] transition-all" aria-label="Facebook">
                    <Facebook size={16} />
                  </a>
                )}
                {store.socials.tiktok && (
                  <a href={store.socials.tiktok} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-[#2e2a4d] hover:bg-[#8c7ef6] hover:text-white grid place-items-center text-[#b7b3dd] transition-all" aria-label="TikTok">
                    <Music2 size={16} />
                  </a>
                )}
                {store.socials.x && (
                  <a href={store.socials.x} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-[#2e2a4d] hover:bg-[#8c7ef6] hover:text-white grid place-items-center text-[#b7b3dd] transition-all" aria-label="X">
                    <Twitter size={16} />
                  </a>
                )}
              </div>
            </div>

            {/* Links Columns */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div>
                <h5 className="font-mono text-[11px] uppercase tracking-widest text-[#9b96c9] mb-4">Shop</h5>
                <ul className="space-y-2.5 text-xs text-[#cfcbec]">
                  {toyFooterLinks.shop.map(link => (
                    <li key={link.label}>
                      <Link href={link.href} className="hover:text-white transition-colors">{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="font-mono text-[11px] uppercase tracking-widest text-[#9b96c9] mb-4">Support</h5>
                <ul className="space-y-2.5 text-xs text-[#cfcbec]">
                  {toyFooterLinks.support.map(link => (
                    <li key={link.label}>
                      <Link href={link.href} className="hover:text-white transition-colors">{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <h5 className="font-mono text-[11px] uppercase tracking-widest text-[#9b96c9] mb-4">Contact</h5>
                <ul className="space-y-2.5 text-xs text-[#cfcbec]">
                  <li className="flex items-center gap-2">
                    <Mail size={13} className="text-[#8c7ef6]" />
                    <a href={`mailto:${email}`} className="hover:text-white truncate">{email}</a>
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone size={13} className="text-[#8c7ef6]" />
                    <a href={`tel:${phone.replace(/\s+/g, '')}`} className="hover:text-white">{phone}</a>
                  </li>
                  <li className="flex items-start gap-2">
                    <MapPin size={13} className="text-[#8c7ef6] mt-0.5 shrink-0" />
                    <span>Accra, Ghana</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#3b3859] py-6">
          <div className="container-custom flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#8a86b8]">
            <p>© {currentYear} {store.shortName}. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href={`/${storeSlug}/privacy`} className="hover:text-white">Privacy</Link>
              <Link href={`/${storeSlug}/terms`} className="hover:text-white">Terms</Link>
              <Link href={`/${storeSlug}/shipping`} className="hover:text-white">Shipping</Link>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // =========================================================================
  // PERFUME STORE FOOTER (Original luxury style)
  // =========================================================================
  const perfumeFooterLinks = {
    shop: [
      { label: 'All Fragrances', href: `/${storeSlug}/shop` },
      { label: "Men's Fragrances", href: `/${storeSlug}/shop?category=mens` },
      { label: "Women's Fragrances", href: `/${storeSlug}/shop?category=womens` },
      { label: 'Unisex & Niche', href: `/${storeSlug}/shop?category=unisex` },
      { label: 'Gift Sets', href: `/${storeSlug}/specials/gift-sets` },
      { label: 'Body Mists', href: `/${storeSlug}/shop?category=body-mists` },
    ],
    support: [
      { label: 'Track Order', href: `/${storeSlug}/account/history` },
      { label: 'Shipping Policy', href: `/${storeSlug}/shipping` },
      { label: 'Returns & Exchanges', href: `/${storeSlug}/returns` },
      { label: 'FAQ', href: `/${storeSlug}/faq` },
      { label: 'Contact Us', href: `/${storeSlug}/contact` },
    ],
    company: [
      { label: 'Our Story', href: `/${storeSlug}/about` },
      { label: 'The Scent Journal', href: `/${storeSlug}/blog` },
      { label: 'Authenticity Guarantee', href: `/${storeSlug}/authenticity` },
      { label: 'Terms of Service', href: `/${storeSlug}/terms` },
      { label: 'Privacy Policy', href: `/${storeSlug}/privacy` },
    ]
  };

  const genericFooterLinks = {
    shop: [
      { label: 'All Products', href: `/${storeSlug}/shop` },
      { label: 'Electronics', href: `/${storeSlug}/shop?category=electronics` },
      { label: 'Home & Living', href: `/${storeSlug}/shop?category=home-living` },
      { label: 'Beauty & Fragrance', href: `/${storeSlug}/shop?category=beauty-fragrance` },
      { label: 'New Arrivals', href: `/${storeSlug}/shop?category=new-arrivals` },
      { label: 'Deals', href: `/${storeSlug}/shop?category=deals` },
    ],
    support: [
      { label: 'Track Order', href: `/${storeSlug}/account/history` },
      { label: 'Shipping Policy', href: `/${storeSlug}/shipping` },
      { label: 'Returns & Exchanges', href: `/${storeSlug}/returns` },
      { label: 'FAQ', href: `/${storeSlug}/faq` },
      { label: 'Contact Us', href: `/${storeSlug}/contact` },
    ],
    company: [
      { label: 'Our Story', href: `/${storeSlug}/about` },
      { label: 'Blog', href: `/${storeSlug}/blog` },
      { label: 'Terms of Service', href: `/${storeSlug}/terms` },
      { label: 'Privacy Policy', href: `/${storeSlug}/privacy` },
    ]
  };

  const footerLinks = store.isPerfume ? perfumeFooterLinks : genericFooterLinks;

  return (
    <footer className="bg-brand-deep text-brand-subtle border-t border-brand-border mt-auto font-body">
      {/* 1. Value Props / Trust Signals */}
      <div className="border-b border-brand-border">
        <div className="container-custom py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
            <div className="p-3 bg-brand-mid rounded-lg text-brand-gold">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-white mb-1 uppercase tracking-wider text-sm">100% Authentic</h4>
              <p className="text-xs leading-relaxed">Direct from authorized luxury distributors worldwide.</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
            <div className="p-3 bg-brand-mid rounded-lg text-brand-gold">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-white mb-1 uppercase tracking-wider text-sm">Swift Delivery</h4>
              <p className="text-xs leading-relaxed">Same-day delivery within Accra for orders before 2PM.</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
            <div className="p-3 bg-brand-mid rounded-lg text-brand-gold">
              <RotateCcw size={24} />
            </div>
            <div>
              <h4 className="font-bold text-white mb-1 uppercase tracking-wider text-sm">Easy Returns</h4>
              <p className="text-xs leading-relaxed">7-day hassle-free return policy on sealed products.</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
            <div className="p-3 bg-brand-mid rounded-lg text-brand-gold">
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
            <Link href={`/${storeSlug}`} className="flex items-center gap-3 group justify-center lg:justify-start">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-gold to-brand-gold-light rounded-full flex items-center justify-center shadow-lg shadow-brand-gold/20">
                <span className="font-display font-bold text-brand-deep text-xl">{store.monogram}</span>
              </div>
              <span className="font-display font-bold text-2xl text-brand-gold tracking-tight uppercase">
                {store.shortName}
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-sm text-center lg:text-left">
              {store.description}
            </p>
            <div className="flex items-center justify-center lg:justify-start gap-4 pt-2">
              {store.socials.instagram && (
                <a href={store.socials.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center bg-brand-mid hover:bg-brand-gold hover:text-brand-deep rounded-full transition-all border border-brand-border" aria-label="Instagram">
                  <Instagram size={18} />
                </a>
              )}
              {store.socials.facebook && (
                <a href={store.socials.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center bg-brand-mid hover:bg-brand-gold hover:text-brand-deep rounded-full transition-all border border-brand-border" aria-label="Facebook">
                  <Facebook size={18} />
                </a>
              )}
              {store.socials.tiktok && (
                <a href={store.socials.tiktok} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center bg-brand-mid hover:bg-brand-gold hover:text-brand-deep rounded-full transition-all border border-brand-border" aria-label="TikTok">
                  <Music2 size={18} />
                </a>
              )}
              {store.socials.x && (
                <a href={store.socials.x} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center bg-brand-mid hover:bg-brand-gold hover:text-brand-deep rounded-full transition-all border border-brand-border" aria-label="X">
                  <Twitter size={18} />
                </a>
              )}
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
                    <Link href={link.href} className="text-xs hover:text-brand-gold transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-[0.2em] text-[10px]">Client Care</h4>
              <ul className="space-y-4">
                {footerLinks.support.map(link => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-xs hover:text-brand-gold transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1">
              <h4 className="font-bold text-white mb-6 uppercase tracking-[0.2em] text-[10px]">Concierge</h4>
              <ul className="space-y-4">
                {email && (
                  <li className="flex items-center gap-3 text-xs">
                    <Mail size={14} className="text-brand-gold" />
                    <a href={`mailto:${email}`} className="hover:text-brand-gold">{email}</a>
                  </li>
                )}
                <li className="flex items-center gap-3 text-xs">
                  <Phone size={14} className="text-brand-gold" />
                  <a href={`tel:+${formatPhoneForGH(phone)}`} className="hover:text-brand-gold">{phone}</a>
                </li>
                {store.contact.secondaryPhone && (
                  <li className="flex items-center gap-3 text-xs">
                    <Phone size={14} className="text-brand-gold" />
                    <a href={`tel:+${formatPhoneForGH(store.contact.secondaryPhone)}`} className="hover:text-brand-gold">
                      {store.contact.secondaryPhone}
                    </a>
                  </li>
                )}
                <li className="flex items-start gap-3 text-xs">
                  <MapPin size={14} className="text-brand-gold mt-0.5 shrink-0" />
                  <span>{address}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Bar */}
      <div className="border-t border-brand-border bg-brand-deep">
        <div className="container-custom py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[10px] text-brand-gold-pale/40 uppercase tracking-widest font-medium">
            © {currentYear} {store.name}. All Rights Reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href={`/${storeSlug}/privacy`} className="text-[10px] uppercase tracking-widest hover:text-brand-gold transition-colors">Privacy</Link>
            <Link href={`/${storeSlug}/terms`} className="text-[10px] uppercase tracking-widest hover:text-brand-gold transition-colors">Terms</Link>
            <Link href={`/${storeSlug}/shipping`} className="text-[10px] uppercase tracking-widest hover:text-brand-gold transition-colors">Shipping</Link>
          </div>
          <div className="flex items-center gap-4">
            <CreditCard size={20} className="text-brand-gold-pale/20" />
            <span className="text-[10px] uppercase tracking-widest text-brand-gold-pale/20 border border-brand-border px-2 py-1 rounded">SSL Secure</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
