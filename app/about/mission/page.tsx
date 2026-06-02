'use client';

import Link from 'next/link';
import { ArrowLeft, Target } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function MissionPage() {
  const brandColors = { primary: '#D54022', lightBg: '#F6F1E8', white: '#FFFFFF' };

  return (
    <div className="min-h-screen" style={{ backgroundColor: brandColors.lightBg }}>
      <Navbar />
      <div className="pt-16"><div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-6" style={{ color: brandColors.primary }}><ArrowLeft className="w-4 h-4" /> Back to Home</Link>
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
          <Target className="w-16 h-16 mx-auto mb-4" style={{ color: brandColors.primary }} />
          <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brandColors.primary }}>Our Mission</h1>
          <p className="text-gray-600 text-lg leading-relaxed">To provide expert advisory and business development services that transform complex opportunities into bankable outcomes, creating lasting value for investors, communities, and stakeholders across Africa.</p>
        </div>
      </div></div>
    </div>
  );
}
