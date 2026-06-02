'use client';

import Link from 'next/link';
import { ArrowLeft, Leaf, Droplets, Trees, Recycle } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function EnvirogreenPage() {
  const brandColors = { primary: '#D54022', lightBg: '#F6F1E8', white: '#FFFFFF' };

  return (
    <div className="min-h-screen" style={{ backgroundColor: brandColors.lightBg }}>
      <Navbar />
      <div className="pt-16"><div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-6" style={{ color: brandColors.primary }}><ArrowLeft className="w-4 h-4" /> Back to Home</Link>
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
          <Leaf className="w-16 h-16 mx-auto mb-4" style={{ color: brandColors.primary }} />
          <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brandColors.primary }}>Envirogreen Foundation</h1>
          <p className="text-gray-600 mb-6">Committed to environmental sustainability and green initiatives across South Africa.</p>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div><Droplets className="w-8 h-8 mx-auto mb-2" style={{ color: brandColors.primary }} /><p className="font-semibold">Water Conservation</p></div>
            <div><Trees className="w-8 h-8 mx-auto mb-2" style={{ color: brandColors.primary }} /><p className="font-semibold">Reforestation</p></div>
            <div><Recycle className="w-8 h-8 mx-auto mb-2" style={{ color: brandColors.primary }} /><p className="font-semibold">Waste Management</p></div>
          </div>
        </div>
      </div></div>
    </div>
  );
}
