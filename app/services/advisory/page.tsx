'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function AdvisoryPage() {
  const brandColors = { primary: '#D54022', accent: '#F3BC48', lightBg: '#F6F1E8', white: '#FFFFFF' };

  return (
    <div className="min-h-screen" style={{ backgroundColor: brandColors.lightBg }}>
      <Navbar />
      <div className="pt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6" style={{ color: brandColors.primary }}>
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <TrendingUp className="w-16 h-16 mb-4" style={{ color: brandColors.accent }} />
            <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brandColors.primary }}>Advisory Services</h1>
            <p className="text-gray-600 mb-4">Expert guidance on investment readiness, risk assessment, and stakeholder engagement across multi-industry projects.</p>
            <p className="text-gray-600">TechFuse Advisory helps transform project concepts into investor-ready, bankable business cases with full financial structuring and due diligence support.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
