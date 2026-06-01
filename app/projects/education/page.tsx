'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, MapPin, Calendar, Users, GraduationCap, BookOpen } from 'lucide-react';

export default function EducationPage() {
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

          <div className="relative w-full h-[400px] rounded-2xl overflow-hidden mb-8">
            <Image
              src="/images/projects/education.jpg"
              alt="Education Career Guide"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white">Education Career Guide</h1>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
                <h2 className="text-2xl font-bold mb-4" style={{ color: brandColors.primary }}>Project Overview</h2>
                <p className="text-gray-600 mb-6">
                  TechFuse is actively involved in a <strong>R1 Billion Career Guide Distribution programme</strong> reaching 
                  every public primary and secondary school in South Africa. Powered by Crowd-Sponsorship with a rich value 
                  chain across advertising, organic marketing, and national event exposure.
                </p>
                <p className="text-gray-600 mb-4">
                  The 13-Volume Career Guide (IPR) is owned by the Product Owner and Founder, <strong>Alba Delport</strong>.
                </p>

                <h3 className="text-xl font-bold mb-4" style={{ color: brandColors.primary }}>Reach & Impact</h3>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold" style={{ color: brandColors.primary }}>20,894</div>
                    <div className="text-sm text-gray-500">Total Institutions</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold" style={{ color: brandColors.primary }}>188,063</div>
                    <div className="text-sm text-gray-500">UCG Sets</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold" style={{ color: brandColors.primary }}>11M+</div>
                    <div className="text-sm text-gray-500">Learners Reached</div>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-4" style={{ color: brandColors.primary }}>Communities Reached</h3>
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">Farm Communities</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">Rural Schools</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">Urban & Suburban Institutions</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold mb-4" style={{ color: brandColors.primary }}>Investment Opportunity</h2>
                <p className="text-gray-600 mb-4">
                  Inviting CSI & Crowd-Sponsors to invest in youth development. Give learners a fair chance to discover 
                  career opportunities through real, structured guidance.
                </p>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="font-semibold" style={{ color: brandColors.primary }}>🤝 Partner with us to transform education in South Africa</p>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
                <h3 className="text-lg font-bold mb-4" style={{ color: brandColors.primary }}>Project Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" style={{ color: brandColors.primary }} />
                    <span><strong>Total Value:</strong> R1 Billion</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" style={{ color: brandColors.primary }} />
                    <span><strong>Format:</strong> 13-Volume Career Guide</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" style={{ color: brandColors.primary }} />
                    <span><strong>Coverage:</strong> National (South Africa)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" style={{ color: brandColors.primary }} />
                    <span><strong>Target:</strong> All public schools</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold mb-4" style={{ color: brandColors.primary }}>Sponsorship Opportunities</h3>
                <p className="text-gray-600 mb-4">Become a CSI or Crowd-Sponsor today.</p>
                <a
                  href="/about/contact"
                  className="block text-center text-white py-3 rounded-lg transition hover:opacity-90"
                  style={{ backgroundColor: brandColors.primary }}
                >
                  Become a Sponsor
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
