'use client';

import Link from 'next/link';
import { ArrowLeft, Rocket, Handshake, Network, Globe, Target, BarChart } from 'lucide-react';

export default function BusinessDevelopmentPage() {
  const brandColors = {
    primary: '#D54022',
    accent: '#F3BC48',
    lightBg: '#F6F1E8',
    emancipation: '#6B2D8B',
    white: '#FFFFFF',
    dark: '#333333'
  };

  const bdServices = [
    {
      icon: <Rocket className="w-10 h-10" />,
      title: 'Market Entry Strategy',
      description: 'Developing comprehensive market entry plans for businesses expanding into new territories or sectors.'
    },
    {
      icon: <Handshake className="w-10 h-10" />,
      title: 'Partnership Development',
      description: 'Identifying and securing strategic partnerships that drive growth and create mutual value.'
    },
    {
      icon: <Network className="w-10 h-10" />,
      title: 'Investor Relations',
      description: 'Building and maintaining relationships with potential investors, financial institutions, and funding partners.'
    },
    {
      icon: <Globe className="w-10 h-10" />,
      title: 'International Expansion',
      description: 'Supporting cross-border business development with expertise in African and international markets.'
    },
    {
      icon: <Target className="w-10 h-10" />,
      title: 'Deal Structuring',
      description: 'Structuring complex deals including joint ventures, SPVs, and public-private partnerships.'
    },
    {
      icon: <BarChart className="w-10 h-10" />,
      title: 'Revenue Optimization',
      description: 'Identifying opportunities to maximize revenue streams and improve commercial outcomes.'
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: brandColors.primary }}>Business Development</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Driving growth through strategic partnerships, market expansion, and innovative deal structures that unlock 
              value across infrastructure, education, and mining sectors.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bdServices.map((service, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="mb-4" style={{ color: brandColors.primary }}>
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: brandColors.primary }}>{service.title}</h3>
                <p className="text-gray-600 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-gradient-to-r p-8 rounded-2xl shadow-lg text-white text-center" style={{ background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.emancipation})` }}>
            <h2 className="text-2xl font-bold mb-4">Ready to Grow Your Business?</h2>
            <p className="mb-6">Let's discuss how TechFuse can help you achieve your business development goals.</p>
            <Link
              href="/about/contact"
              className="inline-block bg-white px-6 py-3 rounded-lg font-semibold transition hover:bg-gray-100"
              style={{ color: brandColors.primary }}
            >
              Contact Our Team
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
