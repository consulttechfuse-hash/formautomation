'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, Building2, Briefcase, Award, Cpu, Network } from 'lucide-react';

export default function FounderPage() {
  const brandColors = {
    primary: '#D54022',
    accent: '#F3BC48',
    lightBg: '#F6F1E8',
    emancipation: '#6B2D8B',
    white: '#FFFFFF',
    dark: '#333333'
  };

  const experience = [
    {
      period: '2020 – Present',
      role: 'Founder & Principal Advisor',
      company: 'TechFuse Holdings',
      icon: <Briefcase className="w-6 h-6" />,
      description: 'Established TechFuse Holdings to provide professional advisory and business development services across multi-industry projects. Actively involved in a R5B infrastructure build-out (Central Karoo), a R1B education initiative, and a large-scale mining greenfields project in Limpopo.'
    },
    {
      period: 'Multisource Telecoms / rain group',
      role: 'Bi-Dev & Business Unit Manager',
      company: 'XConnect SA',
      icon: <Network className="w-6 h-6" />,
      description: 'Business development and business unit management within the rain group ecosystem, driving commercial growth and cross-sector integration strategies.'
    },
    {
      period: 'Core Networks Era',
      role: 'Product & Sales Management / Chief Engineer',
      company: 'Huawei Technologies',
      icon: <Cpu className="w-6 h-6" />,
      description: 'Product and Sales Management across Core Networks — Mobile, IP Fixed, and FMC. Key customers included Telkom Mobile, Neotel/Liquid, Angola Telecoms, Unitel, Movicel, and Gateway. Also served as Chief Engineer for the Southern Africa regional office.'
    },
    {
      period: '5 Years',
      role: 'Least Cost Routing Specialist',
      company: 'NashuaMobile (Contracting)',
      icon: <Award className="w-6 h-6" />,
      description: 'Specialist contracting in least cost routing, optimising telecommunications routing to reduce costs and improve network efficiency.'
    },
    {
      period: '20 Years',
      role: 'Digital & Data Switching',
      company: 'SA Post Office · Telkom SA',
      icon: <Calendar className="w-6 h-6" />,
      description: 'Two decades in the digital and data switching sector across South Africa\'s leading telecommunications institutions — building the foundational ICT expertise that underpins TechFuse\'s advisory capability today.'
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: brandColors.lightBg }}>
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link href="/about" className="inline-flex items-center gap-2 mb-6" style={{ color: brandColors.primary }}>
            <ArrowLeft className="w-4 h-4" /> Back to About
          </Link>

          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: brandColors.primary }}>The Founder</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              25+ Years ICT Leadership — A career built across South Africa's most significant telecommunications and technology institutions.
            </p>
          </div>

          {/* Timeline / Experience */}
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 w-0.5 h-full bg-gray-300 hidden md:block"></div>

            <div className="space-y-8">
              {experience.map((exp, idx) => (
                <div key={idx} className={`relative flex flex-col md:flex-row ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  {/* Timeline Dot */}
                  <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 w-4 h-4 rounded-full z-10" style={{ backgroundColor: brandColors.primary }}></div>
                  
                  {/* Content */}
                  <div className={`ml-16 md:ml-0 md:w-1/2 ${idx % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-3 mb-3">
                        <div style={{ color: brandColors.primary }}>{exp.icon}</div>
                        <span className="text-sm font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: brandColors.lightBg, color: brandColors.primary }}>
                          {exp.period}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mb-1" style={{ color: brandColors.primary }}>{exp.role}</h3>
                      <p className="text-gray-600 font-medium mb-3">{exp.company}</p>
                      <p className="text-gray-500">{exp.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-center mb-8" style={{ color: brandColors.primary }}>Legacy of Excellence</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold" style={{ color: brandColors.primary }}>25+</div>
                <div className="text-gray-500">Years ICT Experience</div>
              </div>
              <div>
                <div className="text-4xl font-bold" style={{ color: brandColors.primary }}>20+</div>
                <div className="text-gray-500">Years at Telkom/Post Office</div>
              </div>
              <div>
                <div className="text-4xl font-bold" style={{ color: brandColors.primary }}>5+</div>
                <div className="text-gray-500">Countries Served</div>
              </div>
              <div>
                <div className="text-4xl font-bold" style={{ color: brandColors.primary }}>R6B+</div>
                <div className="text-gray-500">Project Value</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
