'use client';

import Link from 'next/link';
import { ArrowLeft, Briefcase, Calendar, Award, Cpu, Network } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function FounderPage() {
  const brandColors = { primary: '#D54022', accent: '#F3BC48', lightBg: '#F6F1E8', white: '#FFFFFF' };
  const experience = [
    { period: '2020 – Present', role: 'Founder & Principal Advisor', company: 'TechFuse Holdings', icon: <Briefcase className="w-6 h-6" />, desc: 'Established TechFuse Holdings to provide professional advisory and business development services across multi-industry projects.' },
    { period: 'Multisource Telecoms / rain', role: 'Bi-Dev & Business Unit Manager', company: 'XConnect SA', icon: <Network className="w-6 h-6" />, desc: 'Business development and business unit management within the rain group ecosystem.' },
    { period: 'Core Networks Era', role: 'Chief Engineer', company: 'Huawei Technologies', icon: <Cpu className="w-6 h-6" />, desc: 'Product and Sales Management across Core Networks — Mobile, IP Fixed, and FMC.' },
    { period: '5 Years', role: 'Least Cost Routing Specialist', company: 'NashuaMobile', icon: <Award className="w-6 h-6" />, desc: 'Specialist contracting in least cost routing, optimising telecommunications routing.' },
    { period: '20 Years', role: 'Digital & Data Switching', company: 'SA Post Office · Telkom SA', icon: <Calendar className="w-6 h-6" />, desc: 'Building the foundational ICT expertise that underpins TechFuse\'s advisory capability today.' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: brandColors.lightBg }}>
      <Navbar />
      <div className="pt-16"><div className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-6" style={{ color: brandColors.primary }}><ArrowLeft className="w-4 h-4" /> Back to Home</Link>
        <div className="text-center mb-12"><h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: brandColors.primary }}>The Founder</h1><p className="text-xl text-gray-600">25+ Years ICT Leadership across South Africa's most significant telecommunications institutions</p></div>
        <div className="relative"><div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 w-0.5 h-full bg-gray-300 hidden md:block"></div>
        {experience.map((exp, idx) => (<div key={idx} className={`relative flex flex-col md:flex-row ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
          <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 w-4 h-4 rounded-full z-10" style={{ backgroundColor: brandColors.primary }}></div>
          <div className={`ml-16 md:ml-0 md:w-1/2 ${idx % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
            <div className="bg-white rounded-2xl p-6 shadow-lg"><div className="flex items-center gap-3 mb-3"><div style={{ color: brandColors.primary }}>{exp.icon}</div><span className="text-sm font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: brandColors.lightBg, color: brandColors.primary }}>{exp.period}</span></div>
            <h3 className="text-xl font-bold mb-1" style={{ color: brandColors.primary }}>{exp.role}</h3><p className="text-gray-600 font-medium mb-3">{exp.company}</p><p className="text-gray-500">{exp.desc}</p></div>
          </div>
        </div>))}</div>
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg"><div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div><div className="text-4xl font-bold" style={{ color: brandColors.primary }}>25+</div><div className="text-gray-500">Years Experience</div></div>
          <div><div className="text-4xl font-bold" style={{ color: brandColors.primary }}>3</div><div className="text-gray-500">Active Projects</div></div>
          <div><div className="text-4xl font-bold" style={{ color: brandColors.primary }}>R6B+</div><div className="text-gray-500">Project Value</div></div>
          <div><div className="text-4xl font-bold" style={{ color: brandColors.primary }}>100%</div><div className="text-gray-500">Advisory Focus</div></div>
        </div></div>
      </div></div>
    </div>
  );
}
