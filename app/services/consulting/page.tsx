'use client';

import Link from 'next/link';
import { ArrowLeft, Briefcase, TrendingUp, BarChart3, Megaphone, GitBranch, Cpu } from 'lucide-react';

export default function ConsultingPage() {
  const brandColors = {
    primary: '#D54022',
    accent: '#F3BC48',
    lightBg: '#F6F1E8',
    emancipation: '#6B2D8B',
    white: '#FFFFFF',
    dark: '#333333'
  };

  const services = [
    {
      icon: <Briefcase className="w-10 h-10" />,
      title: 'Project Development & Execution',
      description: 'End-to-end advisory and management of complex multi-industry projects from concept through to successful delivery. TechFuse bridges strategy and execution.'
    },
    {
      icon: <TrendingUp className="w-10 h-10" />,
      title: 'Project to Bankable Business Development',
      description: 'Transforming project concepts into investor-ready, bankable business cases with full financial structuring, risk profiling, and due diligence support.'
    },
    {
      icon: <BarChart3 className="w-10 h-10" />,
      title: 'Financial Project Metrics & Analysis',
      description: 'Rigorous financial modelling, project valuation, return-on-investment analysis, and metrics reporting to support confident investor decision-making.'
    },
    {
      icon: <Megaphone className="w-10 h-10" />,
      title: 'Marketing & Brand Strategy Development',
      description: 'Strategic brand positioning, marketing frameworks, and go-to-market strategies tailored to attract the right investors, partners, and stakeholders.'
    },
    {
      icon: <GitBranch className="w-10 h-10" />,
      title: 'Multi-Industry Integration Strategy',
      description: 'Vertical and horizontal integration strategy across diverse sectors — enabling cross-industry synergies, operational efficiencies, and scalable growth.'
    },
    {
      icon: <Cpu className="w-10 h-10" />,
      title: 'ICT Sector Specialist',
      description: 'Over 25 years of deep ICT expertise spanning telecommunications, data switching, core networks, and digital infrastructure — applied where it matters most.'
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: brandColors.lightBg }}>
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link href="/services" className="inline-flex items-center gap-2 mb-6" style={{ color: brandColors.primary }}>
            <ArrowLeft className="w-4 h-4" /> Back to Services
          </Link>

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: brandColors.primary }}>Professional Services</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              TechFuse Holdings delivers professional advisory and business development services across multi-industry projects — 
              bringing the depth of experience needed to convert complex opportunities into bankable outcomes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <div className="mb-4" style={{ color: brandColors.primary }}>
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: brandColors.primary }}>{service.title}</h3>
                <p className="text-gray-600 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
