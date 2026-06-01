'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, Briefcase, Award, Cpu, Network } from 'lucide-react';

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
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 shadow-md" style={{ backgroundColor: brandColors.white }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative w-8 h-8">
                <Image src="/logo.png" alt="Logo" width={32} height={32} className="object-contain" />
              </div>
              <span className="font-bold text-xl text-gray-800">TechFuse Consulting</span>
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/services" className="text-gray-700 hover:text-primary">Services</Link>
              <Link href="/#projects" className="text-gray-700 hover:text-primary">Projects</Link>
              <Link href="/about/vision" className="text-gray-700 hover:text-primary">About</Link>
              <Link href="/about/founder" className="text-gray-700 hover:text-primary" style={{ color: brandColors.primary }}>Founder</Link>
              <Link href="/foundation/envirogreen" className="text-gray-700 hover:text-primary">Foundation</Link>
              <Link href="/form-automation" className="text-white px-4 py-2 rounded-lg" style={{ backgroundColor: brandColors.primary }}>
                Form Automation
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: brandColors.primary }}>The Founder</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              25+ Years ICT Leadership — A career built across South Africa's most significant telecommunications and technology institutions.
            </p>
          </div>

          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 w-0.5 h-full bg-gray-300 hidden md:block"></div>
            <div className="space-y-8">
              {experience.map((exp, idx) => (
                <div key={idx} className={`relative flex flex-col md:flex-row ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 w-4 h-4 rounded-full z-10" style={{ backgroundColor: brandColors.primary }}></div>
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

          {/* Stats */}
          <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div><div className="text-4xl font-bold" style={{ color: brandColors.primary }}>25+</div><div className="text-gray-500">Years Experience</div></div>
              <div><div className="text-4xl font-bold" style={{ color: brandColors.primary }}>3</div><div className="text-gray-500">Active Projects</div></div>
              <div><div className="text-4xl font-bold" style={{ color: brandColors.primary }}>R6B+</div><div className="text-gray-500">Project Value</div></div>
              <div><div className="text-4xl font-bold" style={{ color: brandColors.primary }}>100%</div><div className="text-gray-500">Advisory Focus</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
