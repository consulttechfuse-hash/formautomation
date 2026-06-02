'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, GitBranch } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function BusinessDevelopmentPage() {
  const brandColors = { primary: '#D54022', emancipation: '#6B2D8B', lightBg: '#F6F1E8', white: '#FFFFFF' };

  return (
    <div className="min-h-screen" style={{ backgroundColor: brandColors.lightBg }}>
      <Navbar />
      <div className="pt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6" style={{ color: brandColors.primary }}>
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <GitBranch className="w-16 h-16 mb-4" style={{ color: brandColors.emancipation }} />
            <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brandColors.primary }}>Business Development</h1>
            <p className="text-gray-600 mb-4">Strategic partnership development, market expansion, and deal structuring for sustainable growth.</p>
            <p className="text-gray-600">TechFuse Business Development drives growth through strategic partnerships, market expansion, and innovative deal structures that unlock value across sectors.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
