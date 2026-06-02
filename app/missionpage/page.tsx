'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Target, Briefcase, Heart, TrendingUp, Shield, Rocket } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useState, useEffect } from 'react';

export default function MissionPage() {
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
    { id: 1, image: '/mission1.jpg', alt: 'Our Mission' },
    { id: 2, image: '/mission2.jpg', alt: 'How We Deliver' },
    { id: 3, image: '/mission3.jpg', alt: 'Execution Excellence' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const missionComponents = [
    { icon: <Briefcase className="w-6 h-6" />, title: 'Bankable', desc: 'Every solution we deliver is structured to attract debt, equity, or development finance – no academic exercises' },
    { icon: <TrendingUp className="w-6 h-6" />, title: 'Executable', desc: 'We provide project management, governance, and hands-on implementation, not just recommendations' },
    { icon: <Rocket className="w-6 h-6" />, title: 'Funded', desc: 'We source and structure capital – DFIs, commercial banks, instrument monetization, direct investment' },
    { icon: <Shield className="w-6 h-6" />, title: 'Multi-Sector', desc: 'Telecoms + energy + mining + housing + agriculture + water + roads – integrated under one roof' },
  ];

  const kpis = [
    { metric: 'Revenue', target2026: 'US$ 2M', target2028: 'US$ 10M' },
    { metric: 'Project Value Under Management', target2026: 'US$ 5Bn', target2028: 'US$ 20Bn' },
    { metric: 'Community Beneficiaries', target2026: '1,000', target2028: '10,000' },
    { metric: 'Jobs Created', target2026: '500', target2028: '5,000' },
    { metric: 'New Markets Entered', target2026: '1', target2028: '3' },
    { metric: 'Delivery On-Time/On-Budget', target2026: '80%', target2028: '90%' },
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
                  <Target className="w-16 h-16 mx-auto mb-4" />
                  <h1 className="text-5xl md:text-6xl font-bold mb-4">Our Mission</h1>
                  <p className="text-xl">How We Deliver • Today • Action-Oriented</p>
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
              "To deliver bankable, executable, and funded solutions for complex multi-sector projects by integrating deep technical expertise, strategic advisory, and direct funding mechanisms."
            </p>
            <p className="text-lg font-medium mt-4" style={{ color: brandColors.primary }}>We don't produce reports that sit on shelves. We produce outcomes.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {missionComponents.map((comp, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="mb-3 flex justify-center" style={{ color: brandColors.primary }}>{comp.icon}</div>
                <h3 className="text-xl font-bold mb-2" style={{ color: brandColors.primary }}>{comp.title}</h3>
                <p className="text-gray-600 text-sm">{comp.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 rounded-2xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-center mb-6" style={{ color: brandColors.primary }}>How We Measure Success – KPIs</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Metric</th>
                    <th className="text-left p-3">Target (2026)</th>
                    <th className="text-left p-3">Target (2028)</th>
                  </tr>
                </thead>
                <tbody>
                  {kpis.map((kpi, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-3 font-medium">{kpi.metric}</td>
                      <td className="p-3">{kpi.target2026}</td>
                      <td className="p-3">{kpi.target2028}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-gradient-to-r p-8 rounded-2xl text-white" style={{ background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.emancipation})` }}>
            <h2 className="text-2xl font-bold mb-4 text-center">Our Core Focus</h2>
            <p className="text-center mb-4">Why We Exist: <strong>To accelerate Africa's infrastructure transformation by solving the funding and execution gap that leaves bankable projects unrealized</strong></p>
            <p className="text-center">Our Superior Skill: <strong>Integrating technical engineering, strategic advisory, and direct funding mechanisms across multiple sectors simultaneously</strong></p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
