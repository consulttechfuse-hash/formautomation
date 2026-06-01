'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown, ChevronRight, Mail, Phone, MapPin } from 'lucide-react';

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Brand colors - matching existing system
  const brandColors = {
    primary: '#1e40af',      // Dark blue (from existing system)
    primaryLight: '#3b82f6',  // Light blue (from existing system)
    secondary: '#10b981',     // Green (from existing system)
    accent: '#f59e0b',        // Orange
    dark: '#1f2937',
    light: '#f3f4f6',
    gradientStart: '#1e3a8a', // Darker blue
    gradientEnd: '#2563eb'    // Medium blue
  };

  const slides = [
    { title: 'CONSULT.CONSUME', subtitle: 'We provide Outsource Managed Services for Project and Business development across Multi-Industries', highlight: 'commanding the attention of global investors.', cta: 'Explore Opportunities' },
    { title: 'Infrastructure Leadership', subtitle: 'Leading the R5 Billion Central Karoo development with 6 integrated GAPs', highlight: 'Seeking long-term investors for 25-Year FBOOT term.', cta: 'View Infrastructure' },
    { title: 'Education Transformation', subtitle: 'R1 Billion Career Guide Distribution programme reaching every public school in South Africa', highlight: '11M+ learners to be reached.', cta: 'Partner With Us' },
    { title: 'Mining Excellence', subtitle: '1.2 Billion metric tonnes in-situ coal reserve in Limpopo', highlight: 'Open to various deal structures.', cta: 'Invest Now' },
  ];

  const stats = [
    { value: 'R5B', label: 'Infrastructure Build-Out' },
    { value: 'R1B', label: 'Education Project' },
    { value: '25+', label: 'Years ICT Experience' },
    { value: 'R6B+', label: 'Combined Project Value' },
  ];

  const services = [
    { title: 'Project Development & Execution', desc: 'End-to-end advisory and management of complex multi-industry projects from concept through to successful delivery.' },
    { title: 'Bankable Business Development', desc: 'Transforming project concepts into investor-ready, bankable business cases with full financial structuring.' },
    { title: 'Financial Metrics & Analysis', desc: 'Rigorous financial modelling, project valuation, ROI analysis, and metrics reporting.' },
    { title: 'Marketing & Brand Strategy', desc: 'Strategic brand positioning, marketing frameworks, and go-to-market strategies.' },
    { title: 'Multi-Industry Integration', desc: 'Vertical and horizontal integration strategy across diverse sectors.' },
    { title: 'ICT Sector Specialist', desc: 'Over 25 years of deep ICT expertise applied where it matters most.' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: brandColors.primary }}>
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <span className="font-bold text-xl text-gray-800">TechFuse Consulting</span>
              <span className="text-xs text-gray-500 hidden sm:block">consult.consume</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="relative group">
                <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 py-2">
                  <span>Services</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute top-full left-0 w-56 bg-white shadow-lg rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <Link href="/services/consulting" className="block px-4 py-2 hover:bg-gray-100">Consulting</Link>
                  <Link href="/services/advisory" className="block px-4 py-2 hover:bg-gray-100">Advisory</Link>
                  <Link href="/services/business-development" className="block px-4 py-2 hover:bg-gray-100">Business Development</Link>
                </div>
              </div>

              <div className="relative group">
                <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 py-2">
                  <span>Projects</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute top-full left-0 w-56 bg-white shadow-lg rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <Link href="/projects/mining" className="block px-4 py-2 hover:bg-gray-100">Mining</Link>
                  <Link href="/projects/education" className="block px-4 py-2 hover:bg-gray-100">Education</Link>
                  <Link href="/projects/infrastructure" className="block px-4 py-2 hover:bg-gray-100">Infrastructure</Link>
                </div>
              </div>

              <div className="relative group">
                <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 py-2">
                  <span>About</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute top-full left-0 w-56 bg-white shadow-lg rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <Link href="/about/vision" className="block px-4 py-2 hover:bg-gray-100">Vision</Link>
                  <Link href="/about/mission" className="block px-4 py-2 hover:bg-gray-100">Mission</Link>
                  <Link href="/about/contact" className="block px-4 py-2 hover:bg-gray-100">Contact Us</Link>
                </div>
              </div>

              <div className="relative group">
                <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 py-2">
                  <span>Foundation</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute top-full left-0 w-56 bg-white shadow-lg rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <Link href="/foundation/envirogreen" className="block px-4 py-2 hover:bg-gray-100">Envirogreen</Link>
                  <Link href="/foundation/npo" className="block px-4 py-2 hover:bg-gray-100">NPO</Link>
                </div>
              </div>

              <Link href="/form-automation" className="text-white px-4 py-2 rounded-lg transition" style={{ backgroundColor: brandColors.primary }}>
                Form Automation
              </Link>
            </div>

            {/* Mobile menu button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-2 space-y-2">
              <div className="py-1">
                <button onClick={() => setActiveDropdown(activeDropdown === 'services' ? null : 'services')} className="flex justify-between items-center w-full py-2">
                  Services <ChevronDown className="w-4 h-4" />
                </button>
                {activeDropdown === 'services' && (
                  <div className="pl-4 space-y-2">
                    <Link href="/services/consulting" className="block py-1">Consulting</Link>
                    <Link href="/services/advisory" className="block py-1">Advisory</Link>
                    <Link href="/services/business-development" className="block py-1">Business Development</Link>
                  </div>
                )}
              </div>
              <div className="py-1">
                <button onClick={() => setActiveDropdown(activeDropdown === 'projects' ? null : 'projects')} className="flex justify-between items-center w-full py-2">
                  Projects <ChevronDown className="w-4 h-4" />
                </button>
                {activeDropdown === 'projects' && (
                  <div className="pl-4 space-y-2">
                    <Link href="/projects/mining" className="block py-1">Mining</Link>
                    <Link href="/projects/education" className="block py-1">Education</Link>
                    <Link href="/projects/infrastructure" className="block py-1">Infrastructure</Link>
                  </div>
                )}
              </div>
              <Link href="/about/vision" className="block py-2">About</Link>
              <Link href="/about/contact" className="block py-2">Contact</Link>
              <Link href="/foundation/envirogreen" className="block py-2">Foundation</Link>
              <Link href="/form-automation" className="block py-2 font-medium" style={{ color: brandColors.primary }}>Form Automation →</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Slider Section */}
      <section className="relative h-screen pt-16 overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === index ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${brandColors.gradientStart}, ${brandColors.gradientEnd})` }}>
              <div className="absolute inset-0 bg-black/30"></div>
            </div>
            <div className="relative h-full flex items-center justify-center text-center text-white px-4">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-5xl md:text-7xl font-bold mb-4">{slide.title}</h1>
                <p className="text-xl md:text-2xl mb-4">{slide.subtitle}</p>
                <p className="text-lg md:text-xl text-blue-200 mb-8">{slide.highlight}</p>
                <button className="bg-white text-blue-900 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition">
                  {slide.cta}
                </button>
              </div>
            </div>
          </div>
        ))}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-2">
          {slides.map((_, index) => (
            <button key={index} onClick={() => setCurrentSlide(index)} className={`w-3 h-3 rounded-full transition-all ${currentSlide === index ? 'bg-white w-6' : 'bg-white/50'}`} />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16" style={{ backgroundColor: brandColors.light }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, idx) => (
              <div key={idx}>
                <div className="text-4xl md:text-5xl font-bold mb-2" style={{ color: brandColors.primary }}>{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brandColors.primary }}>Professional Advisory &<br />Business Development</h2>
              <p className="text-gray-600 mb-6">TechFuse Holdings is a professional advisory and business development firm operating under the brand Consult.Consume. We are not an ICT service provider — we are an active participant and advisory partner across three high-value, multi-industry projects spanning infrastructure, education, and mining.</p>
              <p className="text-gray-600 mb-6">Our founder brings over 25 years of deep ICT sector experience — from SA Post Office and Telkom SA, through Huawei Technologies at Chief Engineer level, to XConnect SA business development. That expertise is the engine behind TechFuse's ability to evaluate, structure, and drive complex projects to bankable outcomes.</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-4" style={{ color: brandColors.primary }}>Who We Serve</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4" style={{ color: brandColors.primary }} /> Infrastructure Developers</li>
                <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4" style={{ color: brandColors.primary }} /> Education Sector Partners</li>
                <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4" style={{ color: brandColors.primary }} /> Mining & Resources Investors</li>
                <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4" style={{ color: brandColors.primary }} /> Government & Municipalities</li>
                <li className="flex items-center gap-2"><ChevronRight className="w-4 h-4" style={{ color: brandColors.primary }} /> CSI & Crowd-Sponsors</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20" style={{ backgroundColor: brandColors.light }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brandColors.primary }}>What We Offer</h2>
            <p className="text-gray-600">Professional advisory and business development services across multi-industry projects</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-gray-500">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brandColors.primary }}>Active Projects</h2>
            <p className="text-gray-600">Our project portfolio across infrastructure, education, and mining</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Infrastructure Project */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border-t-4" style={{ borderTopColor: brandColors.primary }}>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Infrastructure Build-Out</h3>
                <p className="text-gray-500 text-sm mb-4">Central Karoo | R5 Billion | 25-Year FBOOT</p>
                <p className="text-gray-600 mb-4">6 integrated GAPs including water bulk, sewer, energy, roads, fibre, and housing.</p>
                <button className="text-sm font-semibold" style={{ color: brandColors.primary }}>Learn More →</button>
              </div>
            </div>

            {/* Education Project */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border-t-4" style={{ borderTopColor: brandColors.secondary }}>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Education Career Guide</h3>
                <p className="text-gray-500 text-sm mb-4">South Africa | R1 Billion | 13-Volume Guide</p>
                <p className="text-gray-600 mb-4">Reaching 20,894 schools, 11M+ learners across all provinces.</p>
                <button className="text-sm font-semibold" style={{ color: brandColors.secondary }}>Learn More →</button>
              </div>
            </div>

            {/* Mining Project */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border-t-4" style={{ borderTopColor: brandColors.accent }}>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Mining Greenfields</h3>
                <p className="text-gray-500 text-sm mb-4">Limpopo | 1.2 Billion Mt | Coal</p>
                <p className="text-gray-600 mb-4">ESKOM tender, 52MMt supply over 30 years, international opportunities.</p>
                <button className="text-sm font-semibold" style={{ color: brandColors.accent }}>Learn More →</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20" style={{ backgroundColor: brandColors.light }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brandColors.primary }}>Get In Touch</h2>
              <p className="text-gray-600 mb-8">Ready to transform your project? Reach out and let's discuss how TechFuse can support your goals.</p>
              <div className="space-y-4">
                <div className="flex items-center gap-3"><MapPin className="w-5 h-5" style={{ color: brandColors.primary }} /><span>132 2nd Street, Randtjiespark, Midrand, Tshwane, South Africa</span></div>
                <div className="flex items-center gap-3"><Mail className="w-5 h-5" style={{ color: brandColors.primary }} /><a href="mailto:info@techfuseconsult.online">info@techfuseconsult.online</a></div>
                <div className="flex items-center gap-3"><Phone className="w-5 h-5" style={{ color: brandColors.primary }} /><a href="tel:+27101234567">+27 (0) 10 123 4567</a></div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-md text-center">
              <p className="text-gray-500 mb-4">Contact form is being prepared.</p>
              <p className="text-sm text-gray-400">For now, please email us directly at <a href="mailto:info@techfuseconsult.online" className="font-semibold" style={{ color: brandColors.primary }}>info@techfuseconsult.online</a></p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-white py-12" style={{ backgroundColor: brandColors.dark }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: brandColors.primary }}>
                  <span className="text-white font-bold text-xl">T</span>
                </div>
                <span className="font-bold text-white">TechFuse Consulting</span>
              </div>
              <p className="text-sm text-gray-400">Professional advisory and business development firm operating under the brand Consult.Consume.</p>
            </div>
            <div><h4 className="text-white font-semibold mb-4">Quick Links</h4><ul className="space-y-2 text-sm"><li><Link href="/form-automation" className="text-gray-400 hover:text-white">Form Automation</Link></li><li><Link href="/services/consulting" className="text-gray-400 hover:text-white">Consulting</Link></li><li><Link href="/projects/infrastructure" className="text-gray-400 hover:text-white">Projects</Link></li></ul></div>
            <div><h4 className="text-white font-semibold mb-4">Projects</h4><ul className="space-y-2 text-sm"><li><Link href="/projects/infrastructure" className="text-gray-400 hover:text-white">Infrastructure Build-Out</Link></li><li><Link href="/projects/education" className="text-gray-400 hover:text-white">Education Career Guide</Link></li><li><Link href="/projects/mining" className="text-gray-400 hover:text-white">Mining Greenfields</Link></li></ul></div>
            <div><h4 className="text-white font-semibold mb-4">Foundation</h4><ul className="space-y-2 text-sm"><li><Link href="/foundation/envirogreen" className="text-gray-400 hover:text-white">Envirogreen</Link></li><li><Link href="/foundation/npo" className="text-gray-400 hover:text-white">NPO Initiatives</Link></li></ul></div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} TechFuse Consulting. All rights reserved. | Consult.Consume</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
