'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, MapPin, Calendar, TrendingUp } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function InfrastructurePage() {
  const brandColors = {
    primary: '#D54022',
    accent: '#F3BC48',
    lightBg: '#F6F1E8',
    emancipation: '#6B2D8B',
    white: '#FFFFFF',
    dark: '#333333'
  };

  const gaps = [
    { name: '01-GAP-WATER BULK', description: '200km Water Pipeline', value: 'R1.4B' },
    { name: '02-GAP-SEWER BULK', description: 'Sewer Treatment Plant', value: 'R1.2B' },
    { name: '03-GAP-ENERGY', description: '35MW Energy Farm (up to 100MW)', value: 'R1.2B' },
    { name: '04-GAP-ROADS', description: 'New Road Construction', value: 'R760M' },
    { name: '05-GAP-FIBRE & WIFI', description: 'Fibre Internet & Wifi + DC', value: 'R230M' },
    { name: '06-GAP-HOUSING', description: '600 Low Cost Housing Units', value: 'R160M' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: brandColors.lightBg }}>
      <Navbar />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6" style={{ color: brandColors.primary }}>
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <div className="relative w-full h-[400px] rounded-2xl overflow-hidden mb-8">
            <Image src="/images/projects/infrastructure.jpg" alt="Infrastructure Build-Out" fill className="object-cover" priority />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white">Infrastructure Build-Out</h1>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
                <h2 className="text-2xl font-bold mb-4" style={{ color: brandColors.primary }}>Project Overview</h2>
                <p className="text-gray-600 mb-6">TechFuse is the Outsource Manager for a landmark R5 billion infrastructure development in the Central Karoo. We provide professional advisory and project development across 6 integrated GAPs, seeking long-term investors for a 25-Year FBOOT term.</p>
                <h3 className="text-xl font-bold mb-4" style={{ color: brandColors.primary }}>6 Integrated GAPs</h3>
                <div className="space-y-3">
                  {gaps.map((gap, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b pb-2">
                      <div><span className="font-semibold">{gap.name}</span><p className="text-sm text-gray-500">{gap.description}</p></div>
                      <span className="font-bold" style={{ color: brandColors.primary }}>{gap.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold mb-4" style={{ color: brandColors.primary }}>Investment Opportunity</h2>
                <p className="text-gray-600 mb-4">Seeking investors for long-term yielding opportunities. The 25-Year FBOOT term offers stable returns.</p>
                <div className="bg-blue-50 p-4 rounded-lg"><p className="font-semibold" style={{ color: brandColors.primary }}>📄 Enquire for full investment prospectus</p></div>
              </div>
            </div>
            <div>
              <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
                <h3 className="text-lg font-bold mb-4" style={{ color: brandColors.primary }}>Project Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2"><TrendingUp className="w-5 h-5" style={{ color: brandColors.primary }} /><span><strong>Total Value:</strong> R5 Billion</span></div>
                  <div className="flex items-center gap-2"><Calendar className="w-5 h-5" style={{ color: brandColors.primary }} /><span><strong>Term:</strong> 25-Year FBOOT</span></div>
                  <div className="flex items-center gap-2"><MapPin className="w-5 h-5" style={{ color: brandColors.primary }} /><span><strong>Location:</strong> Central Karoo</span></div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold mb-4" style={{ color: brandColors.primary }}>Contact for Investment</h3>
                <p className="text-gray-600 mb-4">Interested in this opportunity?</p>
                <Link href="/contact" className="block text-center text-white py-3 rounded-lg transition hover:opacity-90" style={{ backgroundColor: brandColors.primary }}>Enquire Now</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
