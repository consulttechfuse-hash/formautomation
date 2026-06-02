'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Briefcase, TrendingUp, BarChart3, Megaphone, GitBranch, Cpu } from 'lucide-react';

export default function ServicesPage() {
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
      title: 'Consulting',
      description: 'Strategic advisory and project development services to transform complex opportunities into bankable outcomes.',
      icon: <Briefcase className="w-12 h-12" />,
      link: '/services/consulting',
      image: '/images/services/services1.jpg'
    },
    {
      title: 'Advisory',
      description: 'Expert guidance on investment readiness, risk assessment, and stakeholder engagement across multi-industry projects.',
      icon: <TrendingUp className="w-12 h-12" />,
      link: '/services/advisory',
      image: '/images/services/services2.jpg'
    },
    {
      title: 'Business Development',
      description: 'Strategic partnership development, market expansion, and deal structuring for sustainable growth.',
      icon: <GitBranch className="w-12 h-12" />,
      link: '/services/business-development',
      image: '/images/services/services3.jpg'
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
              
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/services" className="text-gray-700 hover:text-primary" style={{ color: brandColors.primary }}>Services</Link>
              <Link href="/#projects" className="text-gray-700 hover:text-primary">Projects</Link>
              <Link href="/about/vision" className="text-gray-700 hover:text-primary">About</Link>
              <Link href="/about/founder" className="text-gray-700 hover:text-primary">Founder</Link>
              <Link href="/foundation/envirogreen" className="text-gray-700 hover:text-primary">Foundation</Link>
              <Link href="/form-automation" className="text-white px-4 py-2 rounded-lg" style={{ backgroundColor: brandColors.primary }}>
                Form Automation
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: brandColors.primary }}>Our Services</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              TechFuse Holdings delivers professional advisory and business development services across multi-industry projects — 
              bringing the depth of experience needed to convert complex opportunities into bankable outcomes.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, idx) => (
              <Link href={service.link} key={idx}>
                <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer h-full">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="bg-white/90 rounded-full p-4">
                        <div style={{ color: brandColors.primary }}>{service.icon}</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-2" style={{ color: brandColors.primary }}>{service.title}</h3>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <div className="flex items-center gap-2 font-semibold" style={{ color: brandColors.primary }}>
                      Learn More <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Stats Section */}
          <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold" style={{ color: brandColors.primary }}>25+</div>
                <div className="text-gray-500">Years Experience</div>
              </div>
              <div>
                <div className="text-4xl font-bold" style={{ color: brandColors.primary }}>3</div>
                <div className="text-gray-500">Active Projects</div>
              </div>
              <div>
                <div className="text-4xl font-bold" style={{ color: brandColors.primary }}>R6B+</div>
                <div className="text-gray-500">Project Value</div>
              </div>
              <div>
                <div className="text-4xl font-bold" style={{ color: brandColors.primary }}>100%</div>
                <div className="text-gray-500">Advisory Focus</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
