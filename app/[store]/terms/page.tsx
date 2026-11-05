import React from 'react';
import Link from 'next/link';
import { getStoreOrNull } from '@/lib/stores/config';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ store: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { store: storeSlug } = await params;
  const store = getStoreOrNull(storeSlug);
  if (!store) return { title: 'Terms of Service' };
  return {
    title: `Terms of Service | ${store.name}`,
    description: `Rules and regulations for using ${store.name}.`,
  };
}

export default async function TermsPage({ params }: PageProps) {
  const { store: storeSlug } = await params;
  const store = getStoreOrNull(storeSlug);
  if (!store) notFound();

  return (
    <div className="bg-secondary-50 min-h-screen py-12 md:py-20 px-4">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-16 rounded-2xl shadow-sm border border-secondary-200">

        <div className="mb-12 text-center border-b border-secondary-100 pb-8">
          <h1 className="text-3xl md:text-5xl font-display font-bold text-secondary-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-secondary-500 font-medium">Effective Date: January 1, 2026</p>
        </div>

        <div className="prose prose-lg prose-slate max-w-none
          prose-headings:font-display prose-headings:font-bold prose-headings:text-secondary-900
          prose-a:text-primary-600 hover:prose-a:text-primary-700
          prose-li:marker:text-secondary-400
        ">
          <h3>1. About Us</h3>
          <p>
            {store.name} operates an online store for {store.businessType.toLowerCase()}.
            By accessing this website or placing an order, you agree to these terms.
          </p>

          <h3>2. Products & Availability</h3>
          <p>
            Product packaging, labels, and bottle shapes may vary from the images shown due to
            manufacturer updates. All products are subject to availability, and we may limit
            quantities on wholesale or promotional orders.
          </p>

          <h3>3. Pricing & Payment</h3>
          <ul>
            <li>All prices are in <strong>Ghana Cedis (GH₵)</strong>.</li>
            <li>We reserve the right to change prices at any time without notice.</li>
            <li>For <strong>Manual Mobile Money</strong> payments, orders are not confirmed until the funds are received and verified by our team.</li>
            <li>&ldquo;Pay Excluding Delivery&rdquo; orders are subject to a final delivery quote which must be accepted before dispatch.</li>
          </ul>

          <h3>4. Delivery Policy</h3>
          <p>
            Delivery times are estimates. While we aim for same-day delivery within Accra, traffic
            and weather conditions may cause delays. We are not liable for delays caused by force
            majeure.
          </p>

          <h3>5. Returns & Refunds</h3>
          <p>Because fragrance is a personal-care product, we accept returns <strong>only</strong> when:</p>
          <ul>
            <li>The wrong item was delivered.</li>
            <li>The item arrived damaged or the seal was broken on arrival.</li>
          </ul>
          <p>
            Please inspect your order immediately upon delivery. For hygiene reasons we cannot
            accept returns for opened or used products, or for change of mind. See our{' '}
            <Link href={`/${storeSlug}/faq`}>FAQ</Link> for more details.
          </p>

          <h3>6. Wholesale Orders</h3>
          <p>
            Wholesale and bulk pricing is available on request. Wholesale orders may require a
            deposit and are subject to separate lead times confirmed by our team.
          </p>

          <h3>7. Governing Law</h3>
          <p>
            These terms shall be governed by and construed in accordance with the laws of the
            Republic of Ghana.
          </p>
        </div>

      </div>
    </div>
  );
}
