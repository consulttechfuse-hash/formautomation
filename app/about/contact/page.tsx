'use client';

import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function ContactPage() {
  const brandColors = { primary: '#D54022', lightBg: '#F6F1E8', white: '#FFFFFF' };

  return (
    <div className="min-h-screen" style={{ backgroundColor: brandColors.lightBg }}>
      <Navbar />
      <div className="pt-16"><div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-6" style={{ color: brandColors.primary }}><ArrowLeft className="w-4 h-4" /> Back to Home</Link>
        <div className="bg-white rounded-2xl p-8 shadow-lg"><h1 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: brandColors.primary }}>Contact Us</h1>
          <div className="space-y-4">
            <div className="flex items-center gap-3"><MapPin className="w-5 h-5" style={{ color: brandColors.primary }} /><span>132 2nd Street, Randtjiespark, Midrand, Tshwane, South Africa</span></div>
            <div className="flex items-center gap-3"><Mail className="w-5 h-5" style={{ color: brandColors.primary }} /><a href="mailto:info@techfuseconsult.online">info@techfuseconsult.online</a></div>
            <div className="flex items-center gap-3"><Phone className="w-5 h-5" style={{ color: brandColors.primary }} /><a href="tel:+27878217338">+27 87 821 7338</a></div>
          </div>
        </div>
      </div></div>
    </div>
  );
}
