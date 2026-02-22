'use client';

import React from 'react';
import Link from 'next/link';
import {
  Package,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { StoreSettings } from '@/lib/types';

// Add Props Interface
interface FooterProps {
  settings?: StoreSettings | null;
}

const Footer: React.FC<FooterProps> = ({ settings }) => {
  const currentYear = new Date().getFullYear();

  // Fallbacks if DB is empty
  const phone = settings?.primary_phone || '+233 24 400 0000';
  const email = settings?.support_email || 'info@liquorshop.gh';

  // Clean phone for href (remove spaces)
  const telLink = `tel:${phone.replace(/\s+/g, '')}`;

  return (
    <footer className="bg-secondary-900 text-white mt-auto">

      {/* Main Footer */}
      <div className="container-custom py-12 md:py-16">
        <div className="flex flex-col lg:grid lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Column 1: Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
              <Package className="text-primary-500 group-hover:rotate-12 transition-transform duration-300" size={32} />
              <div>
                <h3 className="text-xl font-display font-bold">LiquorShop</h3>
                <p className="text-xs text-secondary-400">Premium Selection</p>
              </div>
            </Link>

            <p className="text-secondary-300 text-sm mb-6 max-w-sm">
              Ghana's premier online destination for premium wines, spirits, and craft beers.
              Delivering excellence since 2024.
            </p>

            {/* Age Verification Reminder */}
            <div className="flex items-start gap-2 p-3 bg-secondary-800 rounded-lg border border-secondary-700 mb-6">
              <ShieldCheck className="text-amber-500 flex-shrink-0 mt-0.5" size={18} />
              <div className="text-xs text-secondary-300">
                <p className="font-semibold text-white mb-1">18+ Only</p>
                <p>You must be of legal drinking age to purchase alcohol. Drink responsibly.</p>
              </div>
            </div>

            {/* Contact Info (Dynamic) */}
            <div className="space-y-3">
              <a
                href={telLink}
                className="flex items-center gap-2 text-sm text-secondary-300 hover:text-primary-500 transition-colors"
              >
                <Phone size={16} />
                <span>{phone}</span>
              </a>
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-2 text-sm text-secondary-300 hover:text-primary-500 transition-colors"
              >
                <Mail size={16} />
                <span>{email}</span>
              </a>
              <div className="flex items-start gap-2 text-sm text-secondary-300">
                <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                <span>123 Independence Ave, Accra, Ghana</span>
              </div>
            </div>
          </div>

          {/* Links Wrapper: 3 Columns on Mobile & Desktop */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 lg:col-span-3 w-full">

            {/* Column 2: Shop */}
            <div>
              <h4 className="font-display font-semibold text-lg mb-4">Shop</h4>
              <ul className="space-y-3">
                {[
                  { label: 'All Products', href: '/shop' },
                  { label: 'Beer', href: '/shop?category=beer' },
                  { label: 'Wine', href: '/shop?category=wine' },
                  { label: 'Spirits', href: '/shop?category=spirits' },
                  { label: 'Soft Drinks', href: '/shop?category=soft-drinks' },
                ].map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-secondary-300 hover:text-primary-500 transition-colors inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Support*/}
            <div>
              <h4 className="font-display font-semibold text-lg mb-4">Support</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Contact Us', href: '/contact' },
                  { label: 'FAQs', href: '/faq' },
                  { label: 'Shipping Info', href: '/faq' }, // Point to FAQ for now
                  { label: 'Returns Policy', href: '/faq' }, // Point to FAQ for now

                ].map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-secondary-300 hover:text-primary-500 transition-colors inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Legal (CLEANED) */}
            <div>
              <h4 className="font-display font-semibold text-lg mb-4">Legal</h4>
              <ul className="space-y-3">
                {[
                  { label: 'About Us', href: '/about' },
                  { label: 'Blog', href: '/blog' },
                  { label: 'Privacy Policy', href: '/privacy' },
                  { label: 'Terms', href: '/terms' }, // Shortened for mobile fit
                  { label: 'Admin', href: '/auth/login' }, // Shortened for mobile fit
                ].map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-secondary-300 hover:text-primary-500 transition-colors inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-12 pt-8 border-t border-secondary-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            <div>
              <p className="text-sm text-secondary-400 mb-3">We Accept</p>
              <div className="flex items-center gap-4 flex-wrap">

                {/* Paystack */}
                <div className="flex items-center gap-2 px-4 py-2 bg-secondary-800 rounded-lg border border-secondary-700">
                  <CreditCard size={20} className="text-primary-500" />
                  <span className="text-sm font-medium">Paystack</span>
                </div>

                {/* MTN Mobile Money */}
                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500 rounded-lg">
                  <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center">
                    <span className="text-yellow-500 text-xs font-bold">M</span>
                  </div>
                  <span className="text-sm font-semibold text-black">MTN MoMo</span>
                </div>

                {/* Cash on Delivery */}
                <div className="flex items-center gap-2 px-4 py-2 bg-secondary-800 rounded-lg border border-secondary-700">
                  <span className="text-sm font-medium">Cash on Delivery</span>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <p className="text-sm text-secondary-400 mb-3">Connect With Us</p>
              <div className="flex items-center gap-3">
                {[
                  { Icon: Facebook, href: '#', label: 'Facebook' },
                  { Icon: Twitter, href: '#', label: 'Twitter' },
                  { Icon: Instagram, href: '#', label: 'Instagram' },
                  { Icon: Linkedin, href: '#', label: 'LinkedIn' },
                ].map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-secondary-800 hover:bg-primary-600 rounded-lg transition-colors"
                    aria-label={label}
                  >
                    <Icon size={20} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-secondary-800 bg-secondary-950">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm text-secondary-400">
            <p>
              &copy; {currentYear} LiquorShop. All rights reserved.
            </p>
            <p className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-accent-500" />
              Secure Shopping · SSL Encrypted
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;