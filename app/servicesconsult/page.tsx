'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Briefcase, TrendingUp, Cpu, FileText, Globe, Shield } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useState, useEffect } from 'react';

export default function ConsultingPage() {
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
    { id: 1, image: '/servconsult1.jpg', alt: 'Consulting Services' },
    { id: 2, image: '/servconsult2.jpg', alt: 'Project Management' },
    { id: 3, image: '/servconsult3.jpg', alt: 'Infrastructure Development' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const coreAreas = [
    { icon: <TrendingUp className="w-6 h-6" />, title: 'Infrastructure Gap Management', desc: 'Bulk road, water, sewage, integrated housing, fiber, data centres, and solar plants.' },
    { icon: <FileText className="w-6 h-6" />, title: 'Project Funding & Financial Modelling', desc: 'Bankable business cases, debt/equity structuring, and full financial analysis.' },
    { icon: <Cpu className="w-6 h-6" />, title: 'Digital Transformation', desc: 'IMS/EPC/5G build strategies, carrier cloud core hybrids, access network evolution.' },
    { icon: <Briefcase className="w-6 h-6" />, title: 'EPC & Procurement', desc: 'RFQ / RFI / RFC drafting, vendor adjudication, contract schedules, technical compliance.' },
    { icon: <Globe className="w-6 h-6" />, title: 'Macro-Economic Development', desc: 'Cross-border trade corridors, smart city development, industrial growth frameworks.' },
    { icon: <Shield className="w-6 h-6" />, title: 'Risk & Compliance', desc: 'AML, FATF, GAAP, territory due diligence, and fraud prevention.' },
  ];

  const engagements = [
    { value: 'ZAR 5 Billion', desc: 'infrastructure GAPS project – full funding sourcing and business development' },
    { value: 'US$ 4.5 Billion', desc: 'ICT Fiber Low LSM project (South Africa) – pending central bank due diligence' },
    { value: 'US$ 75 Billion', desc: 'Malawi Macro-Economic Business Build – tender and project structuring' },
    { value: 'Green Carbon Credit', desc: 'Project Management' },
    { value: 'Direct Foreign Investment', desc: 'funding modelling for SADC projects' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: brandColors.lightBg }}>
      <Navbar />
      <div className="pt-16">
        {/* Hero Slider */}
        <div className="relative h-[500px] overflow-hidden">
          {slides.map((slide, index) => (
            <div key={slide.id} className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === index ? 'opacity-100' : 'opacity-0'}`}>
              <Image src={slide.image} alt={slide.alt} fill className="object-cover" />
              <div className="absolute inset-0 bg-black/50"></div>
              <div className="absolute inset-0 flex items-center justify-center text-center text-white px-4">
                <div className="max-w-4xl mx-auto">
                  <h1 className="text-5xl md:text-6xl font-bold mb-4">Consulting</h1>
                  <p className="text-xl">Professional Expertise – End-to-end consulting for complex, multi-sector projects</p>
                </div>
              </div>
            </div>
          ))}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
            {slides.map((_, index) => (
              <button key={index} onClick={() => setCurrentSlide(index)} className={`w-3 h-3 rounded-full transition-all ${currentSlide === index ? 'bg-white w-6' : 'bg-white/50'}`} />
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Introduction */}
          <div className="text-center mb-12">
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We deliver end-to-end consulting for complex, multi-sector projects. Our approach combines technical engineering, 
              commercial structuring, and direct funding mechanisms.
            </p>
          </div>

          {/* Core Delivery Areas */}
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: brandColors.primary }}>Core Delivery Areas</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {coreAreas.map((area, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="mb-3" style={{ color: brandColors.primary }}>{area.icon}</div>
                <h3 className="text-xl font-bold mb-2" style={{ color: brandColors.primary }}>{area.title}</h3>
                <p className="text-gray-600">{area.desc}</p>
              </div>
            ))}
          </div>

          {/* Recent Consulting Engagements */}
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: brandColors.primary }}>Recent Consulting Engagements</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-12">
            {engagements.map((eng, idx) => (
              <div key={idx} className="bg-white rounded-lg p-4 shadow border-l-4" style={{ borderLeftColor: brandColors.primary }}>
                <div className="text-2xl font-bold" style={{ color: brandColors.primary }}>{eng.value}</div>
                <p className="text-gray-600">{eng.desc}</p>
              </div>
            ))}
          </div>

          {/* Quote */}
          <div className="bg-gradient-to-r p-8 rounded-2xl text-white text-center" style={{ background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.emancipation})` }}>
            <p className="text-xl italic">"We don't produce reports that sit on shelves. We produce executable, funded outcomes."</p>
          </div>
        </div>
      </div>
    </div>
  );
}
