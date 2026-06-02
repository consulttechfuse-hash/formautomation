'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Briefcase } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function ConsultingPage() {
  const brandColors = { primary: '#D54022', lightBg: '#F6F1E8', white: '#FFFFFF' };

  return (
    <div className="min-h-screen" style={{ backgroundColor: brandColors.lightBg }}>
      <Navbar />
      <div className="pt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6" style={{ color: brandColors.primary }}>
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <Briefcase className="w-16 h-16 mb-4" style={{ color: brandColors.primary }} />
            <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brandColors.primary }}>Consulting Services</h1>
            <p className="text-gray-600 mb-4">Strategic advisory and project development services to transform complex opportunities into bankable outcomes.</p>
            <p className="text-gray-600">TechFuse Consulting provides end-to-end advisory and management of complex multi-industry projects from concept through to successful delivery.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
