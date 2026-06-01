'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, MapPin, TrendingUp, Factory, Globe, Pickaxe } from 'lucide-react';

export default function MiningPage() {
  const brandColors = {
    primary: '#D54022',
    accent: '#F3BC48',
    lightBg: '#F6F1E8',
    emancipation: '#6B2D8B',
    white: '#FFFFFF',
    dark: '#333333'
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: brandColors.lightBg }}>
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link href="/#projects" className="inline-flex items-center gap-2 mb-6" style={{ color: brandColors.primary }}>
            <ArrowLeft className="w-4 h-4" /> Back to Projects
          </Link>

          {/* Hero Image Section */}
          <div className="relative w-full h-[400px] rounded-2xl overflow-hidden mb-8">
            <Image
              src="/images/projects/mining.jpg"
              alt="Mining Greenfields Project"
              fill
              className="object-cover"
              priority
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white">Mining Greenfields Project</h1>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
                <h2 className="text-2xl font-bold mb-4" style={{ color: brandColors.primary }}>Project Overview</h2>
                <p className="text-gray-600 mb-6">
                  Situated in the <strong>Soutpansberg of Limpopo</strong>, this greenfields coal project holds 
                  <strong> 1.2 billion in-situ metric tonnes</strong> — a giant to be unleashed. TechFuse provides 
                  professional advisory across deal structuring, investor engagement, and business development for this project.
                </p>

                <h3 className="text-xl font-bold mb-4" style={{ color: brandColors.primary }}>Key Opportunities</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Factory className="w-5 h-5 mt-0.5" style={{ color: brandColors.primary }} />
                    <div>
                      <span className="font-semibold">ESKOM Tender</span>
                      <p className="text-sm text-gray-500">Bankable off-taker · Due diligence & compliance: 3–4 months to completion</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 mt-0.5" style={{ color: brandColors.primary }} />
                    <div>
                      <span className="font-semibold">52MMt Supply</span>
                      <p className="text-sm text-gray-500">Over ~30 years across two off-takers</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 mt-0.5" style={{ color: brandColors.primary }} />
                    <div>
                      <span className="font-semibold">International Opportunities</span>
                      <p className="text-sm text-gray-500">BYO — separate SPV to be crafted</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Pickaxe className="w-5 h-5 mt-0.5" style={{ color: brandColors.primary }} />
                    <div>
                      <span className="font-semibold">Mine Contracting</span>
                      <p className="text-sm text-gray-500">First position and ROM sharing available</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold mb-4" style={{ color: brandColors.primary }}>Investment Opportunity</h2>
                <p className="text-gray-600 mb-4">
                  Open to various deal structures. Invest in the startup phase. All commercials can be discussed in detail.
                </p>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="font-semibold" style={{ color: brandColors.primary }}>💰 Flexible investment structures available</p>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
                <h3 className="text-lg font-bold mb-4" style={{ color: brandColors.primary }}>Resource Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" style={{ color: brandColors.primary }} />
                    <span><strong>In Situ Reserve:</strong> 1.2 Billion Mt</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Factory className="w-5 h-5" style={{ color: brandColors.primary }} />
                    <span><strong>Type:</strong> Coal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" style={{ color: brandColors.primary }} />
                    <span><strong>Location:</strong> Soutpansberg, Limpopo</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
                <h3 className="text-lg font-bold mb-4" style={{ color: brandColors.primary }}>Prospecting Rights</h3>
                <p className="text-gray-600">Other minerals feasibility studies underway</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold mb-4" style={{ color: brandColors.primary }}>Investor Enquiries</h3>
                <p className="text-gray-600 mb-4">Interested in this mining opportunity?</p>
                <a
                  href="/about/contact"
                  className="block text-center text-white py-3 rounded-lg transition hover:opacity-90"
                  style={{ backgroundColor: brandColors.primary }}
                >
                  Discuss Deal Structure
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
