import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { Phone, Mail, MapPin, MessageCircle, Clock, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import Button from '@/components/ui/Button';

export const metadata = {
  title: 'Contact Us | LiquorShop Ghana',
  description: 'Get in touch with us for orders, inquiries, or support.',
};

export const revalidate = 60; // Refresh settings every minute

export default async function ContactPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from('store_settings').select('*').single();

  // Helper to clean phone for href="tel:..."
  const cleanPhone = (phone: string) => phone ? `+${phone.replace(/\D/g, '')}` : '#';

  return (
    <div className="bg-secondary-50 min-h-screen">
      
      {/* 1. Header */}
      <div className="bg-secondary-900 text-white py-16 md:py-24 text-center">
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Get in Touch</h1>
          <p className="text-lg text-secondary-300 max-w-2xl mx-auto">
            Have a question about an order, or looking for a specific bottle? 
            Our team is here to help you stock your cellar.
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
              <a href={`tel:${cleanPhone(settings?.primary_phone)}`} className="block text-lg font-bold text-secondary-900 hover:text-primary-600">
                {settings?.primary_phone || 'Not Available'}
              </a>
              {settings?.enable_backup_phone && settings?.backup_admin_phone && (
                 <a href={`tel:${cleanPhone(settings.backup_admin_phone)}`} className="block text-sm font-medium text-secondary-500 hover:text-primary-600">
                   {settings.backup_admin_phone}
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
              href={`https://wa.me/${settings?.whatsapp_phone}?text=Hello%20LiquorShop`} 
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
            <a href={`mailto:${settings?.support_email}`} className="text-lg font-bold text-secondary-900 hover:text-blue-600 break-all">
              {settings?.admin_alert_email || 'support@liquorshop.gh'}
            </a>
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
                  123 Independence Avenue,<br/>
                  Ridge, Accra, Ghana.
                </p>
                <p className="text-sm font-mono text-secondary-500 mt-2">GPS: GA-000-0000</p>
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
              <div className="pt-4">
                <p className="text-sm font-bold text-secondary-900 mb-3">Follow Us</p>
                <div className="flex gap-4">
                  {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                    <a key={i} href="#" className="p-2 bg-white border border-secondary-200 rounded-lg hover:border-primary-500 hover:text-primary-600 transition-colors">
                      <Icon size={18} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Map Side */}
          <div className="lg:w-2/3 h-[300px] lg:h-full bg-secondary-200 relative">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3970.970146376045!2d-0.1870!3d5.5760!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdf9a57f6d78775%3A0x6a0c32607873273e!2sAccra%2C%20Ghana!5e0!3m2!1sen!2sgh!4v1700000000000!5m2!1sen!2sgh" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>

      </div>
    </div>
  );
}