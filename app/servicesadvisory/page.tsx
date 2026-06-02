'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Users, Building2, FileCheck, Handshake, BarChart3, Heart } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useState, useEffect } from 'react';

export default function AdvisoryPage() {
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
    { id: 1, image: '/servadvise1.jpg', alt: 'Advisory Services' },
    { id: 2, image: '/servadvise2.jpg', alt: 'Strategic Counsel' },
    { id: 3, image: '/servadvise3.jpg', alt: 'Board Advisory' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const capabilities = [
    { icon: <Users className="w-6 h-6" />, title: 'Board & Executive Strategy', desc: 'Short- to long-term value creation, flight plans, and strategic planning for board approval.' },
    { icon: <Building2 className="w-6 h-6" />, title: 'Project Governance', desc: 'OKR / KPI management, dashboards, EXCO reporting, and board pack preparation.' },
    { icon: <FileCheck className="w-6 h-6" />, title: 'Due Diligence & Compliance', desc: 'Territory legal, AML / FATF / GAAP, instrument fraud prevention, and investor-grade due diligence.' },
    { icon: <Handshake className="w-6 h-6" />, title: 'Public-Private Partnerships', desc: 'Government licence development, central bank engagements, and donor coordination.' },
    { icon: <BarChart3 className="w-6 h-6" />, title: 'Turnaround & Exit Advisory', desc: 'Management buy-outs, shareholder presentations, and clean handover execution.' },
    { icon: <Heart className="w-6 h-6" />, title: 'Socio-Economic Advisory', desc: 'eWaste solutions, early childhood development (ECD), smart energy, and smart agriculture.' },
  ];

  const mandates = [
    { title: 'Rehoboth Mining & Resources', desc: '1.2 billion ton coal reserve, ESKOM tender shortlist (54 million metric tons over 35 years)' },
    { title: 'IBATUR Education', desc: 'UCG-CAREERS-AFRICA digital career guidance platform' },
    { title: 'Government of Lesotho', desc: 'First Fixed Mobile Network License Operator Development' },
    { title: 'Rain Mobile', desc: 'Pre-acquisition proof-of-concept and LTE strategy' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: brandColors.lightBg }}>
      <Navbar />
      <div className="pt-16">
        <div className="relative h-[500px] overflow-hidden">
          {slides.map((slide, index) => (
            <div key={slide.id} className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === index ? 'opacity-100' : 'opacity-0'}`}>
              <Image src={slide.image} alt={slide.alt} fill className="object-cover" />
              <div className="absolute inset-0 bg-black/50"></div>
              <div className="absolute inset-0 flex items-center justify-center text-center text-white px-4">
                <div className="max-w-4xl mx-auto">
                  <h1 className="text-5xl md:text-6xl font-bold mb-4">Advisory</h1>
                  <p className="text-xl">Strategic Counsel – Trusted advisors to boards, government entities, and project owners</p>
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
          <div className="text-center mb-12">
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We act as trusted advisors to boards, government entities, and project owners. Our advisory work bridges 
              technical feasibility, political economy, and capital execution.
            </p>
          </div>

          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: brandColors.primary }}>Core Capabilities</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {capabilities.map((cap, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="mb-3" style={{ color: brandColors.primary }}>{cap.icon}</div>
                <h3 className="text-xl font-bold mb-2" style={{ color: brandColors.primary }}>{cap.title}</h3>
                <p className="text-gray-600">{cap.desc}</p>
              </div>
            ))}
          </div>

          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: brandColors.primary }}>Selected Advisory Mandates</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {mandates.map((mandate, idx) => (
              <div key={idx} className="bg-white rounded-lg p-6 shadow border-l-4" style={{ borderLeftColor: brandColors.primary }}>
                <h3 className="text-xl font-bold mb-2" style={{ color: brandColors.primary }}>{mandate.title}</h3>
                <p className="text-gray-600">{mandate.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r p-8 rounded-2xl text-white text-center" style={{ background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.emancipation})` }}>
            <p className="text-xl italic">"We sit beside decision-makers. We don't sell opinions. We sell de-risked execution."</p>
          </div>
        </div>
      </div>
    </div>
  );
}
