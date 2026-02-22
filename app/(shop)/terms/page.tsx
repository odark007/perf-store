import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | LiquorShop Ghana',
  description: 'Rules and regulations for using our platform.',
};

export default function TermsPage() {
  return (
    <div className="bg-secondary-50 min-h-screen py-12 md:py-20 px-4">
      {/* Document Container */}
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-16 rounded-2xl shadow-sm border border-secondary-200">
        
        {/* Header (Centered) */}
        <div className="mb-12 text-center border-b border-secondary-100 pb-8">
          <h1 className="text-3xl md:text-5xl font-display font-bold text-secondary-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-secondary-500 font-medium">Effective Date: January 1, 2026</p>
        </div>

        {/* Content (Left Aligned for readability) */}
        <div className="prose prose-lg prose-slate max-w-none 
          prose-headings:font-display prose-headings:font-bold prose-headings:text-secondary-900
          prose-a:text-primary-600 hover:prose-a:text-primary-700
          prose-li:marker:text-secondary-400
        ">
          <h3>1. Age Restriction</h3>
          <p>
            By accessing this website, you certify that you are at least <strong>18 years of age</strong>. It is illegal in Ghana to sell alcohol to minors.
          </p>
          <div className="bg-red-50 p-6 border-l-4 border-red-500 rounded-r-lg my-6 not-prose">
            <p className="text-red-900 font-medium">
              <strong>Important:</strong> Our delivery riders reserve the right to request a valid Government ID upon delivery. If the recipient appears to be under 18 and cannot provide ID, the delivery will be refused and a refund processed minus delivery fees.
            </p>
          </div>

          <h3>2. Products & Availability</h3>
          <p>
            While we strive for accuracy, product packaging (labels, bottle shapes) may sometimes vary from the images shown on the website due to manufacturer updates. Vintages for wines may change based on stock availability.
          </p>

          <h3>3. Pricing & Payment</h3>
          <ul>
            <li>All prices are in <strong>Ghana Cedis (GH₵)</strong>.</li>
            <li>We reserve the right to change prices at any time without notice.</li>
            <li>For <strong>Manual Mobile Money</strong> payments, orders are not confirmed until the funds are received and verified by our team.</li>
            <li>"Pay Excluding Delivery" orders are subject to a final delivery quote which must be accepted before dispatch.</li>
          </ul>

          <h3>4. Delivery Policy</h3>
          <p>
            Delivery times are estimates. While we aim for same-day delivery within Accra, traffic and weather conditions may cause delays. We are not liable for delays caused by force majeure.
          </p>
          <p>
            <strong>Right to Refuse:</strong> Riders may refuse delivery to individuals who appear visibly intoxicated or are abusive.
          </p>

          <h3>5. Returns & Refunds</h3>
          <p>
            Due to the nature of beverages, we accept returns <strong>only</strong> under the following conditions:
          </p>
          <ul>
            <li>The wrong item was delivered.</li>
            <li>The bottle was broken or seal damaged <strong>upon arrival</strong>.</li>
          </ul>
          <p>
            You must inspect your order immediately upon delivery. Once the rider leaves, we cannot accept returns for opened bottles or "change of mind". Please review our <Link href="/faq">FAQ</Link> for more details.
          </p>

          <h3>6. Governing Law</h3>
          <p>
            These terms shall be governed by and construed in accordance with the laws of the Republic of Ghana.
          </p>
        </div>

      </div>
    </div>
  );
}