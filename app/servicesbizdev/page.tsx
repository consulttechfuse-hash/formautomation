'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, TrendingUp, Users, Package, Globe, BarChart4, Rocket } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useState, useEffect } from 'react';

export default function BusinessDevelopmentPage() {
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
    { id: 1, image: '/bizdev1.jpg', alt: 'Business Development' },
    { id: 2, image: '/bizdev2.jpg', alt: 'Market Growth' },
    { id: 3, image: '/bizdev3.jpg', alt: 'Revenue Expansion' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const coreEngine = [
    { icon: <Globe className="w-6 h-6" />, title: 'Market Entry & Expansion', desc: 'Launched Least Cost Routing in South Africa, Ghana, and Botswana. Built XConnect South Africa from zero to management buy-out.' },
    { icon: <Users className="w-6 h-6" />, title: 'Sales Pipeline & Key Account Management', desc: 'Enterprise architecture, technology consulting, customer RFx success, and solution development.' },
    { icon: <Package className="w-6 h-6" />, title: 'Partner Ecosystem Development', desc: 'Middle-tier technology and hardware partnerships, bilateral opportunities, and wholesale/reseller channels.' },
    { icon: <BarChart4 className="w-6 h-6" />, title: 'Product & Portfolio Growth', desc: 'Annuity-based product creation, VAS modelling (prepaid), and data centre business plans.' },
    { icon: <TrendingUp className="w-6 h-6" />, title: 'Commodity & Trade', desc: 'LOI / FCO / contracts, trade monetization, and cross-border corridor development.' },
    { icon: <Rocket className="w-6 h-6" />, title: 'Funding-Linked Business Development', desc: 'Direct Foreign Investment modelling, instrument monetization, and self-funding structures.' },
  ];

  const trackRecord = [
    'Built XConnect South Africa sales pipeline and market exposure using the Multisource brand',
    'Upsold classic product lines: Two-Way Radio, Broadband, Call Centre Solutions, and Paging',
    'Created new annuity-based product portfolios for sustainable growth',
    'Established bilateral customer opportunities using reciprocal products and services',
    'Currently funding: 6-GAP Infrastructure (South Africa), Malawi Macro-Economic Humanitarian Project, and Coal Mining Restart (1.2 billion tons)',
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: brandColors.lightBg }}>
      <Navbar />
      <div className="pt-16">
        <div className="relative h-[500px] overflow-hidden">
          {slides.map((slide, index) => (
            <div key={slide.id} className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === index ? 'opacity-100' : 'opacity-0'}`}>
              <div className="relative w-full h-full">
                <Image src={slide.image} alt={slide.alt} fill priority={index === 0} className="object-cover" />
                <div className="absolute inset-0 bg-black/50"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center text-center text-white px-4">
                <div className="max-w-4xl mx-auto">
                  <h1 className="text-5xl md:text-6xl font-bold mb-4">Business Development</h1>
                  <p className="text-xl">Revenue & Market Growth – Building and scaling revenue pipelines across African and international markets</p>
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
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We build and scale revenue pipelines across African and international markets. Our BD methodology combines 
              opportunity hunting, relationship capital, and structured execution from lead to close.
            </p>
          </div>

          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: brandColors.primary }}>Core Engine</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {coreEngine.map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="mb-3" style={{ color: brandColors.primary }}>{item.icon}</div>
                <h3 className="text-xl font-bold mb-2" style={{ color: brandColors.primary }}>{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>

          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: brandColors.primary }}>Track Record</h2>
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-12">
            <ul className="space-y-3">
              {trackRecord.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-r p-8 rounded-2xl text-white text-center" style={{ background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.emancipation})` }}>
            <p className="text-xl italic">"We don't chase leads. We build ecosystems that generate revenue asymmetrically."</p>
          </div>
        </div>
      </div>
    </div>
  );
}
