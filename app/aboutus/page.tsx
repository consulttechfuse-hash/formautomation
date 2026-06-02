'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Eye, Target, Heart, Briefcase, TrendingUp, Globe, Shield, Users, Handshake, Leaf } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useState, useEffect } from 'react';

export default function AboutUsPage() {
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
    { id: 1, image: '/about1.jpg', alt: 'About Techfuse Holdings' },
    { id: 2, image: '/about2.jpg', alt: 'Our Mission' },
    { id: 3, image: '/about3.jpg', alt: 'Our Vision' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const coreValues = [
    { icon: <Briefcase className="w-8 h-8" />, title: 'Execution Bias', desc: 'Calculated risk-taking with mindful consideration. We ship, we deliver, we close. Analysis paralysis is not tolerated.' },
    { icon: <Heart className="w-8 h-8" />, title: 'Constructive Perseverance', desc: 'Persistent yet sensitive to stakeholders. We push through obstacles without burning relationships.' },
    { icon: <Target className="w-8 h-8" />, title: 'Opportunity Hunting', desc: 'Active pursuit of value creation. Every conversation is a potential partnership.' },
    { icon: <TrendingUp className="w-8 h-8" />, title: 'Performance-Driven', desc: 'Challenge ability through coaching, not command. KPIs are practical and ambitious.' },
    { icon: <Globe className="w-8 h-8" />, title: 'Strategic Forward Thinking', desc: 'Practical KPIs with visionary horizons. Daily actions align with 10-year targets.' },
  ];

  const strategicGoals = [
    { title: 'Scale', desc: 'Secure funding and execute a minimum of three major infrastructure projects (>US$100M each) across SADC' },
    { title: 'Expand', desc: 'Establish operational presence in two new African markets (West and East Africa)' },
    { title: 'Innovate', desc: 'Develop blockchain-enabled trade and funding instruments for wholesale enablers' },
    { title: 'Impact', desc: 'Deliver measurable socio-economic upliftment through integrated smart housing, eWaste, and agri-culture solutions' },
    { title: 'Partner', desc: 'Build a network of 10+ strategic funding partners (DFIs, commercial banks, family offices)' },
  ];

  const phases = [
    { name: 'Originate', desc: 'Identify and qualify high-impact infrastructure opportunities across Africa', duration: '1-3 months' },
    { name: 'Structure', desc: 'Develop bankable business cases, financial models, and EPC/procurement frameworks', duration: '2-6 months' },
    { name: 'Fund', desc: 'Source and structure debt/equity, instrument monetization, and DFI engagements', duration: '3-12 months' },
    { name: 'Execute', desc: 'Project management, governance, and handover to operations', duration: '12-48 months' },
    { name: 'Scale', desc: 'Replicate successful models across markets and sectors', duration: 'Ongoing' },
  ];

  const differentiators = [
    { title: 'Funding-Linked Advisory', desc: 'We don\'t just advise; we source and structure capital' },
    { title: 'Principal-to-Principal', desc: 'Direct access to decision-makers across government, central banks, and corporate boards' },
    { title: 'Multi-Sector Integration', desc: 'Telecoms, energy, mining, housing, water, roads, and agriculture under one roof' },
    { title: 'Socio-Economic Lens', desc: 'Profit with purpose; all projects include measurable community upliftment KPIs' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: brandColors.white }}>
      <Navbar />
      <div className="pt-16">
        {/* Hero Slider */}
        <div className="relative h-[500px] overflow-hidden">
          {slides.map((slide, index) => (
            <div key={slide.id} className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === index ? 'opacity-100' : 'opacity-0'}`}>
              <div className="relative w-full h-full">
                <Image src={slide.image} alt={slide.alt} fill priority={index === 0} className="object-cover" />
                <div className="absolute inset-0 bg-black/50"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center text-center text-white px-4">
                <div className="max-w-4xl mx-auto">
                  <h1 className="text-5xl md:text-6xl font-bold mb-4">About Techfuse Holdings</h1>
                  <p className="text-xl">Consulting. Advisory. Business Development. From Feasibility to Funding to First Revenue.</p>
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
          {/* Introduction */}
          <div className="text-center mb-12">
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Techfuse Holdings Limited is a consulting, advisory, and business development firm operating at the intersection 
              of infrastructure, technology, finance, and market entry across Africa and emerging markets.
            </p>
          </div>

          {/* Vision Section */}
          <div className="bg-gradient-to-r p-8 rounded-2xl text-white mb-12" style={{ background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.emancipation})` }}>
            <Eye className="w-12 h-12 mb-4" />
            <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
            <p className="text-xl italic mb-6">"To be the most trusted architect of transformative infrastructure and economic development across Africa, bridging the gap between capital, capability, and community impact."</p>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div><strong>Capital Gap</strong> - Funding where traditional finance won't go</div>
              <div><strong>Capability Gap</strong> - Technical and execution expertise on the ground</div>
              <div><strong>Community Impact Gap</strong> - Ensuring projects uplift, not displace</div>
            </div>
          </div>

          {/* Mission Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-12">
            <Target className="w-12 h-12 mb-4" style={{ color: brandColors.primary }} />
            <h2 className="text-3xl font-bold mb-4" style={{ color: brandColors.primary }}>Our Mission</h2>
            <p className="text-xl italic text-gray-700 mb-6">"To deliver bankable, executable, and funded solutions for complex multi-sector projects by integrating deep technical expertise, strategic advisory, and direct funding mechanisms."</p>
            <div className="border-t pt-4 mt-4">
              <p className="text-gray-600 font-medium">We don't produce reports that sit on shelves. We produce outcomes.</p>
            </div>
          </div>

          {/* Core Values */}
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: brandColors.primary }}>Core Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {coreValues.map((value, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="mb-3" style={{ color: brandColors.primary }}>{value.icon}</div>
                <h3 className="text-xl font-bold mb-2" style={{ color: brandColors.primary }}>{value.title}</h3>
                <p className="text-gray-600">{value.desc}</p>
              </div>
            ))}
          </div>

          {/* Strategic Goals */}
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: brandColors.primary }}>Strategic Goals (2026-2028)</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-12">
            {strategicGoals.map((goal, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-4 border-l-4" style={{ borderLeftColor: brandColors.primary }}>
                <h3 className="text-xl font-bold mb-1" style={{ color: brandColors.primary }}>{goal.title}</h3>
                <p className="text-gray-600">{goal.desc}</p>
              </div>
            ))}
          </div>

          {/* Core Strategy Phases */}
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: brandColors.primary }}>Our Core Strategy</h2>
          <div className="relative mb-12">
            <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 w-0.5 h-full bg-gray-300 hidden md:block"></div>
            {phases.map((phase, idx) => (
              <div key={idx} className={`relative flex flex-col md:flex-row mb-8 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 w-4 h-4 rounded-full z-10" style={{ backgroundColor: brandColors.primary }}></div>
                <div className="ml-12 md:ml-0 md:w-1/2 ${idx % 2 === 0 ? 'md:pr-8' : 'md:pl-8'}">
                  <div className="bg-white rounded-xl p-4 shadow">
                    <h3 className="text-xl font-bold" style={{ color: brandColors.primary }}>Phase {idx + 1}: {phase.name}</h3>
                    <p className="text-gray-600 text-sm">{phase.desc}</p>
                    <p className="text-xs text-gray-400 mt-2">Duration: {phase.duration}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Differentiation */}
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: brandColors.primary }}>Why Techfuse?</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {differentiators.map((diff, idx) => (
              <div key={idx} className="bg-gradient-to-r p-6 rounded-xl text-white" style={{ background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.emancipation})` }}>
                <h3 className="text-xl font-bold mb-2">{diff.title}</h3>
                <p className="text-white/90">{diff.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
