'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Briefcase, Calendar, Award, Cpu, Network, ExternalLink, FileText } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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
    { period: '2020 – Present', role: 'Founder & Principal Advisor', company: 'TechFuse Holdings', icon: <Briefcase className="w-6 h-6" />, desc: 'Established TechFuse Holdings to provide professional advisory and business development services across multi-industry projects. Actively involved in a R5B infrastructure build-out (Central Karoo), a R1B education initiative, and a large-scale mining greenfields project in Limpopo.' },
    { period: 'Multisource Telecoms / rain', role: 'Bi-Dev & Business Unit Manager', company: 'XConnect SA', icon: <Network className="w-6 h-6" />, desc: 'Business development and business unit management within the rain group ecosystem, driving commercial growth and cross-sector integration strategies.' },
    { period: 'Core Networks Era', role: 'Product & Sales Management / Chief Engineer', company: 'Huawei Technologies', icon: <Cpu className="w-6 h-6" />, desc: 'Product and Sales Management across Core Networks — Mobile, IP Fixed, and FMC. Key customers included Telkom Mobile, Neotel/Liquid, Angola Telecoms, Unitel, Movicel, and Gateway. Also served as Chief Engineer for the Southern Africa regional office.' },
    { period: '5 Years', role: 'Least Cost Routing Specialist', company: 'NashuaMobile (Contracting)', icon: <Award className="w-6 h-6" />, desc: 'Specialist contracting in least cost routing, optimising telecommunications routing to reduce costs and improve network efficiency.' },
    { period: '20 Years', role: 'Digital & Data Switching', company: 'SA Post Office · Telkom SA', icon: <Calendar className="w-6 h-6" />, desc: 'Two decades in the digital and data switching sector across South Africa\'s leading telecommunications institutions — building the foundational ICT expertise that underpins TechFuse\'s advisory capability today.' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: brandColors.lightBg }}>
      <Navbar />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6" style={{ color: brandColors.primary }}>
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          {/* Leadership Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.emancipation})` }}>
                <span className="text-white text-3xl font-bold">J</span>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold" style={{ color: brandColors.primary }}>Joey Gouws</h1>
                <p className="text-xl text-gray-600">Managing Director – TechFuse Holdings</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: brandColors.primary }}>Leadership Profile</h3>
                <p className="text-gray-600">30+ years in telecoms, infrastructure, and business development across Africa</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: brandColors.primary }}>Key Expertise</h3>
                <p className="text-gray-600">Fixed Telecoms, Digital Switching, GSM, LCR, and Core Networks expert. Extensive experience in project funding, DFI engagements, and instrument monetization.</p>
              </div>
            </div>
          </div>

          {/* Career Timeline */}
          <div className="relative mb-12">
            <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 w-0.5 h-full bg-gray-300 hidden md:block"></div>
            {experience.map((exp, idx) => (
              <div key={idx} className={`relative flex flex-col md:flex-row mb-8 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 w-4 h-4 rounded-full z-10" style={{ backgroundColor: brandColors.primary }}></div>
                <div className={`ml-16 md:ml-0 md:w-1/2 ${idx % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div style={{ color: brandColors.primary }}>{exp.icon}</div>
                      <span className="text-sm font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: brandColors.lightBg, color: brandColors.primary }}>{exp.period}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-1" style={{ color: brandColors.primary }}>{exp.role}</h3>
                    <p className="text-gray-600 font-medium mb-3">{exp.company}</p>
                    <p className="text-gray-500">{exp.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="bg-gradient-to-r p-8 rounded-2xl text-white text-center mb-12" style={{ background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.emancipation})` }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div><div className="text-4xl font-bold">30+</div><div className="text-white/80">Years Experience</div></div>
              <div><div className="text-4xl font-bold">25+</div><div className="text-white/80">Years ICT</div></div>
              <div><div className="text-4xl font-bold">3</div><div className="text-white/80">Active Projects</div></div>
              <div><div className="text-4xl font-bold">R6B+</div><div className="text-white/80">Project Value</div></div>
            </div>
          </div>

          {/* NEW: Career and Business Profile Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-8 h-8" style={{ color: brandColors.primary }} />
              <h2 className="text-2xl md:text-3xl font-bold" style={{ color: brandColors.primary }}>Career and Business Profile</h2>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              View my complete executive business profile, including detailed career history, project portfolio, core competencies, 
              strategic goals, and a short introductory video.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/about/founder/cv" 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold transition hover:opacity-90"
                style={{ backgroundColor: brandColors.primary }}
              >
                View Full Profile <ExternalLink className="w-4 h-4" />
              </Link>
              <a 
                href="https://www.youtube.com/shorts/aPZamF45VzU" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border-2 font-semibold transition hover:bg-gray-50"
                style={{ borderColor: brandColors.primary, color: brandColors.primary }}
              >
                Watch Intro Video →
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
