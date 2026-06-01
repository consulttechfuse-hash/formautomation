'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, Target, Lightbulb, Users, TrendingUp, Award } from 'lucide-react';

export default function AdvisoryPage() {
  const brandColors = {
    primary: '#D54022',
    accent: '#F3BC48',
    lightBg: '#F6F1E8',
    emancipation: '#6B2D8B',
    white: '#FFFFFF',
    dark: '#333333'
  };

  const advisoryServices = [
    {
      icon: <Shield className="w-10 h-10" />,
      title: 'Strategic Advisory',
      description: 'High-level strategic guidance for complex multi-industry projects, helping clients navigate regulatory frameworks, market dynamics, and investment landscapes.'
    },
    {
      icon: <Target className="w-10 h-10" />,
      title: 'Investment Readiness',
      description: 'Preparing projects and businesses for investor engagement, including due diligence preparation, valuation optimization, and pitch development.'
    },
    {
      icon: <Lightbulb className="w-10 h-10" />,
      title: 'Risk & Opportunity Assessment',
      description: 'Comprehensive risk profiling and opportunity identification across infrastructure, education, and mining sectors.'
    },
    {
      icon: <Users className="w-10 h-10" />,
      title: 'Stakeholder Engagement',
      description: 'Managing relationships with government bodies, community stakeholders, and strategic partners to ensure project alignment and support.'
    },
    {
      icon: <TrendingUp className="w-10 h-10" />,
      title: 'Growth Strategy Development',
      description: 'Tailored growth strategies for businesses seeking to expand into new markets or scale existing operations.'
    },
    {
      icon: <Award className="w-10 h-10" />,
      title: 'Governance & Compliance',
      description: 'Ensuring projects meet regulatory requirements and governance standards across multiple jurisdictions.'
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: brandColors.primary }}>Advisory Services</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Expert guidance to navigate complex business landscapes, secure investments, and achieve sustainable growth 
              across infrastructure, education, and mining sectors.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advisoryServices.map((service, idx) => (
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

          <div className="mt-12 bg-white rounded-2xl p-8 shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4" style={{ color: brandColors.primary }}>Why Choose TechFuse Advisory?</h2>
            <div className="grid md:grid-cols-4 gap-6 mt-6">
              <div>
                <div className="text-3xl font-bold" style={{ color: brandColors.primary }}>25+</div>
                <div className="text-gray-500">Years Experience</div>
              </div>
              <div>
                <div className="text-3xl font-bold" style={{ color: brandColors.primary }}>R6B+</div>
                <div className="text-gray-500">Project Value</div>
              </div>
              <div>
                <div className="text-3xl font-bold" style={{ color: brandColors.primary }}>3</div>
                <div className="text-gray-500">Active Projects</div>
              </div>
              <div>
                <div className="text-3xl font-bold" style={{ color: brandColors.primary }}>100%</div>
                <div className="text-gray-500">Advisory Focus</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
