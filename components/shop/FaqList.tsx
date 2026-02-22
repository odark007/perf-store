'use client';

import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import { faqData } from '@/lib/data/faqs';
import Button from '@/components/ui/Button';
import Link from 'next/link';

const FaqList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  // Filter Logic
  const filteredFaqs = faqData.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="max-w-3xl mx-auto">
      
      {/* Search Bar */}
      <div className="relative mb-12">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={20} className="text-secondary-400" />
        </div>
        <input 
          type="text" 
          placeholder="Search for answers (e.g. 'Delivery', 'MoMo')..." 
          className="w-full pl-12 pr-4 py-4 bg-white border border-secondary-200 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-lg"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Accordion List */}
      <div className="space-y-4">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => (
            <div 
              key={faq.id} 
              className={`
                bg-white border rounded-xl overflow-hidden transition-all duration-300
                ${openId === faq.id ? 'border-primary-200 shadow-md ring-1 ring-primary-100' : 'border-secondary-200 hover:border-secondary-300'}
              `}
            >
              <button
                onClick={() => toggleAccordion(faq.id)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className={`font-bold text-lg ${openId === faq.id ? 'text-primary-700' : 'text-secondary-900'}`}>
                  {faq.question}
                </span>
                {openId === faq.id ? (
                  <ChevronUp className="text-primary-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="text-secondary-400 flex-shrink-0" />
                )}
              </button>
              
              {/* Answer */}
              <div 
                className={`
                  overflow-hidden transition-all duration-300 ease-in-out
                  ${openId === faq.id ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}
                `}
              >
                <div className="p-5 pt-0 text-secondary-600 leading-relaxed border-t border-secondary-50 mt-2">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))
        ) : (
          /* Empty State */
          <div className="text-center py-12 bg-secondary-50 rounded-xl border border-dashed border-secondary-200">
            <h3 className="text-lg font-bold text-secondary-900 mb-2">No results found</h3>
            <p className="text-secondary-500 mb-6">
              We couldn't find an answer matching "{searchTerm}".
            </p>
            <Link href="/contact">
              <Button variant="outline" leftIcon={<MessageCircle size={18} />}>
                Contact Support
              </Button>
            </Link>
          </div>
        )}
      </div>

    </div>
  );
};

export default FaqList;