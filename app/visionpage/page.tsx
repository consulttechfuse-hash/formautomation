'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Eye, Target, TrendingUp, Users, Globe } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useState, useEffect } from 'react';

export default function VisionPage() {
  const brandColors = {
    primary: '#D54022',
    accent: '#F3BC48',
    lightBg: '#F6F1E8',
    emancipation: '#6B2D8B',
    white: '#FFFFFF',
    dark: '#333333'
  };

  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { id: 1, image: '/vision1.jpg', alt: 'Our Vision' },
    { id: 2, image: '/vision2.jpg', alt: 'Future Outlook' },
    { id: 3, image: '/vision3.jpg', alt: '2036 Horizon' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const visionBreakdown = [
    { term: '"Most trusted architect"', explanation: 'We don\'t just advise; we design, structure, and own execution. Trust is earned through delivered outcomes, not reports.' },
    { term: '"Transformative infrastructure"', explanation: 'Projects that fundamentally change economic landscapes: bulk roads, water, sewage, housing, fiber, data centres, energy, and mining.' },
    { term: '"Economic development"', explanation: 'Beyond construction—job creation, skills transfer, local enterprise development, and sustainable GDP growth.' },
    { term: '"Across Africa"', explanation: 'Pan-African focus: SADC, East Africa, West Africa. Each market respected for its unique political, regulatory, and cultural context.' },
  ];

  const tenYearTargets = [
    { metric: 'Geographic Presence', target: 'Active in 15+ African nations with regional hubs across Africa' },
    { metric: 'Project Value Facilitated', target: 'Cumulative US$ 500 Billion+ in infrastructure and digital transformation projects' },
    { metric: 'Community Impact', target: '5+ million people directly benefiting from housing, water, energy, and connectivity projects' },
    { metric: 'Funding Network', target: '50+ strategic funding partners including DFIs, commercial banks, and family offices' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: brandColors.white }}>
      <Navbar />
      <div className="pt-16">
        <div className="relative h-[450px] overflow-hidden">
          {slides.map((slide, index) => (
            <div key={slide.id} className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === index ? 'opacity-100' : 'opacity-0'}`}>
              <div className="relative w-full h-full">
                <Image src={slide.image} alt={slide.alt} fill priority={index === 0} className="object-cover" />
                <div className="absolute inset-0 bg-black/50"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center text-center text-white px-4">
                <div className="max-w-4xl mx-auto">
                  <Eye className="w-16 h-16 mx-auto mb-4" />
                  <h1 className="text-5xl md:text-6xl font-bold mb-4">Our Vision</h1>
                  <p className="text-xl">North Star • Guiding Beacon • 2036 Horizon</p>
                </div>
              </div>
            </div>
          ))}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
            {slides.map((_, index) => (
              <button key={index} onClick={() => setCurrentSlide(index)} className={`w-3 h-3 rounded-full transition-all ${currentSlide === index ? 'bg-white w-6' : 'bg-white/50'}`} />
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <p className="text-2xl italic font-light text-gray-700 max-w-3xl mx-auto">
              "To be the most trusted architect of transformative infrastructure and economic development across Africa, bridging the gap between capital, capability, and community impact."
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {visionBreakdown.map((item, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-2" style={{ color: brandColors.primary }}>{item.term}</h3>
                <p className="text-gray-600">{item.explanation}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r p-8 rounded-2xl text-white mb-12" style={{ background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.emancipation})` }}>
            <h2 className="text-2xl font-bold mb-4">The 10-Year Target (2036 Horizon)</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {tenYearTargets.map((target, idx) => (
                <div key={idx}>
                  <p className="font-bold text-lg">{target.metric}</p>
                  <p className="text-white/80 text-sm">{target.target}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4" style={{ color: brandColors.primary }}>BHAG (Big Hairy Audacious Goal)</h2>
            <p className="text-gray-700 italic">
              By 2036, Techfuse Holdings will have directly facilitated the completion of 50 major infrastructure projects across Africa, 
              mobilized US$ 50 Billion in funding, and created measurable socio-economic upliftment for 10 million people, while operating 
              as a fully employee-owned trust that reinvests 30% of profits into African community foundations.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
