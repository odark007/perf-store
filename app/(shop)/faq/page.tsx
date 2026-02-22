import React from 'react';
import FaqList from '@/components/shop/FaqList';
import { faqData } from '@/lib/data/faqs';

export const metadata = {
  title: 'Frequently Asked Questions | LiquorShop Ghana',
  description: 'Find answers about delivery, payments, returns, and bulk orders.',
};

export default function FaqPage() {
  
  // JSON-LD Schema for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqData.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-secondary-50 pb-20">
      
      {/* 1. Hero */}
      <section className="bg-secondary-900 text-white py-16 md:py-24 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
          How can we help?
        </h1>
        <p className="text-lg text-secondary-300 max-w-2xl mx-auto">
          Answers to common questions about our products, delivery, and services.
        </p>
      </section>

      {/* 2. List Content */}
      <section className="container-custom -mt-8 relative z-10">
        <FaqList />
      </section>

      {/* 3. SEO Schema Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}