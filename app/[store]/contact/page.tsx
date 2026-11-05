import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { getTables, getStoreOrNull } from '@/lib/stores/config';
import { Phone, Mail, MapPin, MessageCircle, Clock, Facebook, Instagram, Music2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { notFound } from 'next/navigation';
import { formatPhoneForGH } from '@/lib/utils';

interface PageProps {
  params: Promise<{ store: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { store: storeSlug } = await params;
  const store = getStoreOrNull(storeSlug);
  if (!store) return { title: 'Contact Us' };
  return {
    title: `Contact Us | ${store.name}`,
    description: `Get in touch with ${store.name} for orders, inquiries, or support.`,
  };
}

export const revalidate = 60; // Refresh settings every minute

export default async function ContactPage({ params }: PageProps) {
  const { store: storeSlug } = await params;
  const store = getStoreOrNull(storeSlug);
  if (!store) notFound();

  const t = getTables(storeSlug);
  const supabase = await createClient();
  const { data: settings } = await supabase.from(t.storeSettings).select('*').single();

  const primaryPhone = settings?.primary_phone || store.contact.primaryPhone;
  const secondaryPhone =
    (settings?.enable_backup_phone ? settings?.backup_admin_phone : null) ||
    store.contact.secondaryPhone;
  const email = settings?.support_email || store.contact.supportEmail;
  const whatsapp = settings?.whatsapp_phone || store.contact.whatsappPhone;
  const address = store.contact.addressLine;
  const cityLine = `${store.contact.city}, ${store.contact.country}`;
  const mapQuery = store.contact.mapQuery || `${address}, ${cityLine}`;

  // Helper to normalise Ghanaian numbers for href="tel:..."
  const cleanPhone = (phone: string) => phone ? `+${formatPhoneForGH(phone)}` : '#';

  return (
    <div className="bg-secondary-50 min-h-screen">

      {/* 1. Header */}
      <div className="bg-brand-deep text-white py-16 md:py-24 text-center">
        <div className="container-custom">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-gold mb-3">
            {store.tagline}
          </p>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Get in Touch</h1>
          <p className="text-lg text-brand-cream/80 max-w-2xl mx-auto">
            Have a question about an order, or looking for a specific fragrance? Our team is here
            to help you find it.
          </p>
        </div>
      </div>

      <div className="container-custom -mt-10 pb-20">

        {/* 2. Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">

          {/* Card: Call */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-secondary-200 text-center flex flex-col items-center hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4">
              <Phone size={28} />
            </div>
            <h3 className="text-xl font-bold text-secondary-900 mb-2">Call Us</h3>
            <p className="text-secondary-500 text-sm mb-6">Mon-Sat from 8am to 8pm</p>
            <div className="space-y-2">
              <a href={`tel:${cleanPhone(primaryPhone)}`} className="block text-lg font-bold text-secondary-900 hover:text-primary-600">
                {primaryPhone}
              </a>
              {secondaryPhone && (
                <a href={`tel:${cleanPhone(secondaryPhone)}`} className="block text-sm font-medium text-secondary-500 hover:text-primary-600">
                  {secondaryPhone}
                </a>
              )}
            </div>
          </div>

          {/* Card: WhatsApp */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-secondary-200 text-center flex flex-col items-center hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <MessageCircle size={28} />
            </div>
            <h3 className="text-xl font-bold text-secondary-900 mb-2">Chat Live</h3>
            <p className="text-secondary-500 text-sm mb-6">Fastest response time</p>
            <a
              href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hello ${store.name}`)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-[#25D366] hover:bg-[#20BA5A] border-none text-white">
                Chat on WhatsApp
              </Button>
            </a>
          </div>

          {/* Card: Email */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-secondary-200 text-center flex flex-col items-center hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <Mail size={28} />
            </div>
            <h3 className="text-xl font-bold text-secondary-900 mb-2">Email Support</h3>
            <p className="text-secondary-500 text-sm mb-6">For bulk orders & inquiries</p>
            {email ? (
              <a href={`mailto:${email}`} className="text-lg font-bold text-secondary-900 hover:text-blue-600 break-all">
                {email}
              </a>
            ) : (
              <p className="text-sm text-secondary-500">Email coming soon — please call or WhatsApp.</p>
            )}
          </div>
        </div>

        {/* 3. Location & Map */}
        <div className="bg-white rounded-2xl border border-secondary-200 overflow-hidden flex flex-col lg:flex-row h-auto lg:h-[450px]">
          {/* Info Side */}
          <div className="p-8 lg:p-12 lg:w-1/3 flex flex-col justify-center bg-secondary-50">
            <div className="space-y-8">
              <div>
                <h3 className="flex items-center gap-2 font-bold text-lg text-secondary-900 mb-2">
                  <MapPin className="text-primary-600" /> Visit Our Store
                </h3>
                <p className="text-secondary-600 leading-relaxed">
                  {address},<br />{cityLine}
                </p>
              </div>

              <div>
                <h3 className="flex items-center gap-2 font-bold text-lg text-secondary-900 mb-2">
                  <Clock className="text-primary-600" /> Opening Hours
                </h3>
                <ul className="text-secondary-600 text-sm space-y-1">
                  <li className="flex justify-between w-40"><span>Mon - Fri:</span> <span>9am - 8pm</span></li>
                  <li className="flex justify-between w-40"><span>Saturday:</span> <span>10am - 9pm</span></li>
                  <li className="flex justify-between w-40"><span>Sunday:</span> <span>12pm - 6pm</span></li>
                </ul>
              </div>

              {/* Socials */}
              {(store.socials.instagram || store.socials.facebook || store.socials.tiktok) && (
                <div className="pt-4">
                  <p className="text-sm font-bold text-secondary-900 mb-3">Follow Us</p>
                  <div className="flex gap-4">
                    {store.socials.instagram && (
                      <a href={store.socials.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-white border border-secondary-200 rounded-lg hover:border-primary-500 hover:text-primary-600 transition-colors" aria-label="Instagram">
                        <Instagram size={18} />
                      </a>
                    )}
                    {store.socials.facebook && (
                      <a href={store.socials.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-white border border-secondary-200 rounded-lg hover:border-primary-500 hover:text-primary-600 transition-colors" aria-label="Facebook">
                        <Facebook size={18} />
                      </a>
                    )}
                    {store.socials.tiktok && (
                      <a href={store.socials.tiktok} target="_blank" rel="noopener noreferrer" className="p-2 bg-white border border-secondary-200 rounded-lg hover:border-primary-500 hover:text-primary-600 transition-colors" aria-label="TikTok">
                        <Music2 size={18} />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Map Side */}
          <div className="lg:w-2/3 h-[300px] lg:h-full bg-secondary-200 relative">
            <iframe
              src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`${store.name} location`}
            ></iframe>
          </div>
        </div>

      </div>
    </div>
  );
}
