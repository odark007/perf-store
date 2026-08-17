import React from 'react';

export const metadata = {
  title: 'Privacy Policy | LiquorShop Ghana',
  description: 'How we collect, use, and protect your data.',
};

export default function PrivacyPage() {
  return (
    <div className="bg-secondary-50 min-h-screen py-12 md:py-20 px-4">
      {/* Document Container */}
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-16 rounded-2xl shadow-sm border border-secondary-200">
        
        {/* Header (Centered) */}
        <div className="mb-12 text-center border-b border-secondary-100 pb-8">
          <h1 className="text-3xl md:text-5xl font-display font-bold text-secondary-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-secondary-500 font-medium">Effective Date: January 1, 2026</p>
        </div>

        {/* Content (Left Aligned for readability) */}
        <div className="prose prose-lg prose-slate max-w-none 
          prose-headings:font-display prose-headings:font-bold prose-headings:text-secondary-900
          prose-a:text-primary-600 hover:prose-a:text-primary-700
          prose-li:marker:text-secondary-400
        ">
          <h3>1. Introduction</h3>
          <p>
            Welcome to LiquorShop. We respect your privacy and are committed to protecting your personal data in compliance with the <strong>Data Protection Act, 2012 (Act 843)</strong> of the Republic of Ghana. This policy explains how we handle your information when you use our website and services.
          </p>

          <h3>2. Information We Collect</h3>
          <p>We collect necessary information to process your orders and ensure legal compliance:</p>
          <ul>
            <li><strong>Personal Details:</strong> Name, phone number (primary and backup), and email address.</li>
            <li><strong>Delivery Data:</strong> Physical address, Ghana Post GPS address, and delivery instructions.</li>
            <li><strong>Age Verification:</strong> Data confirming you are 18 years or older (stored via cookies/local storage).</li>
            <li><strong>Transaction Data:</strong> Order details, purchase history, and payment references.</li>
          </ul>
          <p>
            <strong>Note:</strong> We <strong>do not</strong> store your credit card or mobile money PINs. All payments are processed securely via <strong>Paystack</strong>.
          </p>

          <h3>3. How We Use Your Data</h3>
          <p>We use your data to:</p>
          <ul>
            <li>Process and deliver your orders via our riders.</li>
            <li>Send transactional updates (Order received, dispatched, delivered) via SMS (Arkesel) and Email.</li>
            <li>Verify your age to comply with Ghanaian liquor laws.</li>
            <li>Improve our store inventory based on popular products.</li>
          </ul>

          <h3>4. Data Sharing</h3>
          <p>We strictly do not sell your data. However, we share necessary details with trusted partners:</p>
          <ul>
            <li><strong>Logistics Partners:</strong> Delivery riders receive your name, phone number, and location to fulfill the order.</li>
            <li><strong>Payment Processors:</strong> Paystack processes your payments securely.</li>
            <li><strong>Communication Providers:</strong> Arkesel (SMS) and EmailJS (Email) facilitate our alerts.</li>
          </ul>

          <h3>5. Cookies & Local Storage</h3>
          <p>
            We use local storage to verify your age (so you don't have to verify every time you visit) and to persist your Shopping Cart contents. By using our site, you consent to this essential data usage.
          </p>

          <h3>6. Contact Us</h3>
          <p>
            If you have questions about your data or wish to request deletion of your account, please contact us at <a href="mailto:admin@liquorshop.gh">admin@liquorshop.gh</a>.
          </p>
        </div>

      </div>
    </div>
  );
}