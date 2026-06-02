'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Menu, X, ChevronDown, Heart, Handshake, Briefcase, GraduationCap,
  Leaf, Globe, Factory, Users, Target, BookOpen, Star, HardHat,
  HeartPulse, Brain, ArrowUp, Award, Truck, Recycle, Droplets,
  Trees, Sun, Shield, Book, User, FileText, CheckCircle, Sparkles,
  Baby, School, Home, Building, Calendar, Mail, Phone, MapPin, Send,
  TrendingUp, Activity, Sprout, Eye, Compass
} from 'lucide-react';

export default function EnvirogreenPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [donationFrequency, setDonationFrequency] = useState('once');

  const brandColors = {
    primary: '#2E7D32',
    secondary: '#4CAF50',
    accent: '#FFC107',
    light: '#F5F5F5',
    dark: '#333333',
    white: '#FFFFFF',
  };

  const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'Vision & Mission', href: '#vision-mission' },
    { name: 'What We Do', href: '#programmes' },
    { name: 'Specialist', href: '#specialist' },
    { name: 'Location', href: '#location' },
    { name: 'Our Team', href: '#team' },
    { name: 'Business Model', href: '#business-model' },
    { name: 'Projects', href: '#projects' },
    { name: 'Get Involved', href: '#get-involved' },
    { name: 'Contact', href: '#contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
      for (const item of navItems) {
        const element = document.getElementById(item.href.substring(1));
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(item.href.substring(1));
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollToSection = (href: string) => {
    document.getElementById(href.substring(1))?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: brandColors.white }}>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 shadow-md" style={{ backgroundColor: brandColors.white }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg" style={{ color: brandColors.primary }}>EnviroGreen</span>
                <span className="text-xs text-gray-500 block">and Foundation NPO</span>
              </div>
            </Link>
            <div className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => (
                <button key={item.name} onClick={() => scrollToSection(item.href)} className={`text-sm transition-colors ${activeSection === item.href.substring(1) ? 'font-bold' : 'text-gray-600 hover:text-green-600'}`} style={{ color: activeSection === item.href.substring(1) ? brandColors.primary : undefined }}>{item.name}</button>
              ))}
            </div>
            <div className="hidden md:flex items-center space-x-3">
              <button className="px-4 py-2 rounded-lg text-white transition hover:opacity-90" style={{ backgroundColor: brandColors.primary }}>DONATE NOW</button>
              <button className="px-4 py-2 rounded-lg border-2 transition hover:bg-gray-50" style={{ borderColor: brandColors.primary, color: brandColors.primary }}>PARTNER WITH US</button>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">{mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t p-4 space-y-2">
            {navItems.map((item) => (<button key={item.name} onClick={() => scrollToSection(item.href)} className="block w-full text-left py-2 text-gray-600">{item.name}</button>))}
            <button className="w-full py-2 rounded-lg text-white mt-2" style={{ backgroundColor: brandColors.primary }}>DONATE NOW</button>
            <button className="w-full py-2 rounded-lg border-2 mt-2" style={{ borderColor: brandColors.primary, color: brandColors.primary }}>PARTNER WITH US</button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center pt-16 bg-gradient-to-r from-green-800 to-green-600">
        <div className="relative z-20 text-center text-white px-4 max-w-4xl mx-auto py-20">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Building Sustainable Futures – One Child, One Community, One Ecosystem at a Time</h1>
          <p className="text-xl md:text-2xl mb-8">EnviroGreen and Foundation implements conservation, protection, and recovery of natural resources through Early Childhood Development and Ecological Economics.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="px-8 py-3 rounded-full font-semibold transition hover:opacity-90 bg-yellow-500 text-green-900">EXPLORE OUR PROGRAMMES</button>
            <button className="px-8 py-3 rounded-full font-semibold border-2 border-white transition hover:bg-white hover:text-green-800">SUPPORT OUR MISSION</button>
          </div>
          <div className="flex flex-wrap gap-6 justify-center mt-12">
            <div className="flex items-center gap-2"><Award className="w-5 h-5" /><span className="text-sm">Registered NPO</span></div>
            <div className="flex items-center gap-2"><FileText className="w-5 h-5" /><span className="text-sm">SARS Tax-Deductible</span></div>
            <div className="flex items-center gap-2"><Shield className="w-5 h-5" /><span className="text-sm">Level 1 B-BBEE</span></div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section id="vision-mission" className="py-20 px-4" style={{ backgroundColor: brandColors.light }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12"><Eye className="w-12 h-12 mx-auto mb-4" style={{ color: brandColors.primary }} /><h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brandColors.primary }}>Our Vision & Mission</h2></div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg"><h3 className="text-2xl font-bold mb-4" style={{ color: brandColors.secondary }}>Vision Statement</h3><p className="text-gray-700">To provide an Economic Impact Environmental Program, bringing sustainable solutions through Early Childhood Development Programs and Low Economic Household Programs.</p></div>
            <div className="bg-white rounded-2xl p-8 shadow-lg"><h3 className="text-2xl font-bold mb-4" style={{ color: brandColors.secondary }}>Mission Statement</h3><p className="text-gray-700">To educate and inform individuals to reach their full potential through outstanding quality service. We believe the quality of all living environments can always be improved, starting with our Children.</p></div>
          </div>
          <div className="mt-8 bg-gradient-to-r p-6 rounded-2xl text-white text-center" style={{ background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})` }}><p className="text-lg italic">"This is our Foundation Mantra and Conviction, and it will remain as our corporate culture."</p></div>
        </div>
      </section>

      {/* Core Programmes */}
      <section id="programmes" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12"><h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brandColors.primary }}>What We Do – Core Programmes</h2></div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg"><GraduationCap className="w-12 h-12 mb-4" style={{ color: brandColors.primary }} /><h3 className="text-xl font-bold mb-2">Foundation & Educational</h3><p className="text-gray-600">Early learning programs customized with social and community capacity building.</p><ul className="mt-4 space-y-1 text-sm text-gray-500"><li>✓ Feeding programs</li><li>✓ Educational tools supply</li><li>✓ School girl sanitary wear</li></ul></div>
            <div className="bg-white rounded-2xl p-6 shadow-lg"><Leaf className="w-12 h-12 mb-4" style={{ color: brandColors.primary }} /><h3 className="text-xl font-bold mb-2">Environmental & Eco-system</h3><p className="text-gray-600">Comprehensive Environmental Programs and Management Service Portfolios.</p><ul className="mt-4 space-y-1 text-sm text-gray-500"><li>✓ Community farming</li><li>✓ Circular Economic establishment</li></ul></div>
            <div className="bg-white rounded-2xl p-6 shadow-lg"><Star className="w-12 h-12 mb-4" style={{ color: brandColors.primary }} /><h3 className="text-xl font-bold mb-2">Specialist Programming</h3><p className="text-gray-600">Targeted interventions for sustainable community development.</p><ul className="mt-4 space-y-1 text-sm text-gray-500"><li>✓ Smart Green Programs</li><li>✓ Smart Recycling</li><li>✓ OHS Coaching</li></ul></div>
          </div>
        </div>
      </section>

      {/* Specialist Services */}
      <section id="specialist" className="py-20 px-4" style={{ backgroundColor: brandColors.light }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12"><Star className="w-12 h-12 mx-auto mb-4" style={{ color: brandColors.primary }} /><h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brandColors.primary }}>Specialist Products & Services</h2></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {['First Aid Courses', 'Fire Fighting Courses', 'Health and Safety Courses', 'CPR, AED & Choking Courses', 'Specialised Courses'].map((course, idx) => (<div key={idx} className="bg-white rounded-xl p-6 shadow-lg flex items-start gap-4"><HeartPulse className="w-6 h-6 mt-1" style={{ color: brandColors.primary }} /><div><h3 className="font-bold">{course}</h3><p className="text-gray-500 text-sm">Professional training and certification</p></div></div>))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section id="location" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12"><MapPin className="w-12 h-12 mx-auto mb-4" style={{ color: brandColors.primary }} /><h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brandColors.primary }}>Where We Operate</h2></div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center"><MapPin className="w-16 h-16 mx-auto mb-4" style={{ color: brandColors.primary }} /><h3 className="text-xl font-bold mb-2">Northern Cape, South Africa</h3><p className="text-gray-600">Based in Upington, serving the Northern Cape region.</p></div>
            <div className="bg-white rounded-2xl p-8 shadow-lg"><h3 className="text-xl font-bold mb-4" style={{ color: brandColors.primary }}>Our Response</h3><p className="text-gray-600">EnviroGreen Foundation is embarking on a massive campaign to raise awareness on the rights of children as articulated in the Children's Act.</p><div className="bg-red-50 p-4 rounded-lg mt-4"><p className="text-red-700 text-sm">Despite best efforts, children still remain vulnerable to abuse, neglect, and exploitation.</p></div></div>
          </div>
        </div>
      </section>

      {/* Business Model */}
      <section id="business-model" className="py-20 px-4" style={{ backgroundColor: brandColors.light }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12"><Building className="w-12 h-12 mx-auto mb-4" style={{ color: brandColors.primary }} /><h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brandColors.primary }}>Our Business Model – Tri-Sector Engagement</h2></div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center border-t-4" style={{ borderTopColor: brandColors.primary }}><Building className="w-16 h-16 mx-auto mb-4" style={{ color: brandColors.primary }} /><h3 className="text-xl font-bold mb-2">Government</h3><p className="text-gray-600">Co-operative Engagement – Ensuring compliance and laws are enforced.</p></div>
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center border-t-4" style={{ borderTopColor: brandColors.secondary }}><Briefcase className="w-16 h-16 mx-auto mb-4" style={{ color: brandColors.secondary }} /><h3 className="text-xl font-bold mb-2">Business</h3><p className="text-gray-600">Invested Interest – Creating green investment opportunities.</p></div>
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center border-t-4" style={{ borderTopColor: brandColors.accent }}><Users className="w-16 h-16 mx-auto mb-4" style={{ color: brandColors.accent }} /><h3 className="text-xl font-bold mb-2">Communities</h3><p className="text-gray-600">Sustainable Economics – Protecting the most vulnerable.</p></div>
          </div>
        </div>
      </section>

      {/* Youth Programmes */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto"><h2 className="text-3xl font-bold text-center mb-12" style={{ color: brandColors.primary }}>Youth Programmes</h2><div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center"><Activity className="w-12 h-12 mx-auto mb-4" style={{ color: brandColors.primary }} /><h3 className="text-xl font-bold mb-2">Sport & Social</h3><p className="text-gray-600">Diverting social ills through healthy body conditioning.</p></div>
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center"><Brain className="w-12 h-12 mx-auto mb-4" style={{ color: brandColors.primary }} /><h3 className="text-xl font-bold mb-2">Psychological Services</h3><p className="text-gray-600">Mental support and capacity building for body, mind, and soul.</p></div>
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center"><GraduationCap className="w-12 h-12 mx-auto mb-4" style={{ color: brandColors.primary }} /><h3 className="text-xl font-bold mb-2">Study Bursaries</h3><p className="text-gray-600">Providing raw academic talent a chance to further their career.</p></div>
        </div></div>
      </section>

      {/* Our Team */}
      <section id="team" className="py-20 px-4" style={{ backgroundColor: brandColors.light }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12"><Users className="w-12 h-12 mx-auto mb-4" style={{ color: brandColors.primary }} /><h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brandColors.primary }}>Our Leadership Team</h2></div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg"><div className="w-24 h-24 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-2xl font-bold mb-4" style={{ background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})` }}>J</div><h3 className="text-xl font-bold">Joey Gouws</h3><p className="text-green-600 mb-2">Managing Director</p><p className="text-gray-600">30+ years ICT industry specialist. Ecological and Environmental challenges are of high importance.</p><a href="mailto:joey@envirogreen.co.za" className="text-sm text-green-600 mt-2 inline-block">joey@envirogreen.co.za</a></div>
            <div className="bg-white rounded-2xl p-8 shadow-lg"><div className="w-24 h-24 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-2xl font-bold mb-4" style={{ background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})` }}>L</div><h3 className="text-xl font-bold">Lucrecia Van Wyk</h3><p className="text-green-600 mb-2">Operations Director</p><p className="text-gray-600">ECD Specialist Consultant. Specialising in curriculum development, assess and moderate accredited programs.</p><a href="mailto:lucrecia@envirogreen.co.za" className="text-sm text-green-600 mt-2 inline-block">lucrecia@envirogreen.co.za</a></div>
          </div>
        </div>
      </section>

      {/* Projects & Impact */}
      <section id="projects" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12"><Target className="w-12 h-12 mx-auto mb-4" style={{ color: brandColors.primary }} /><h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brandColors.primary }}>Our Projects & Impact</h2></div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">{[{ value: '0000', label: 'Children Reached' }, { value: '00', label: 'Communities Served' }, { value: '0000', label: 'Trees Planted' }, { value: '000', label: 'Teachers Trained' }, { value: '00', label: 'Schools Partnered' }].map((stat, idx) => (<div key={idx} className="bg-white rounded-xl p-4 text-center shadow"><div className="text-2xl font-bold" style={{ color: brandColors.primary }}>{stat.value}</div><div className="text-sm text-gray-500">{stat.label}</div></div>))}</div>
          <div className="bg-white rounded-2xl p-8 shadow-lg text-center"><h3 className="text-xl font-bold mb-2">Upington Community Project</h3><p className="text-gray-600 mb-4">Location: Northern Cape, South Africa</p><button className="px-6 py-2 rounded-lg text-white" style={{ backgroundColor: brandColors.primary }}>LEARN MORE →</button></div>
        </div>
      </section>

      {/* Get Involved */}
      <section id="get-involved" className="py-20 px-4" style={{ backgroundColor: brandColors.light }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12"><Handshake className="w-12 h-12 mx-auto mb-4" style={{ color: brandColors.primary }} /><h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brandColors.primary }}>Get Involved – Partner With Us</h2></div>
          <div className="grid md:grid-cols-4 gap-6 mb-12">{[{ icon: <Heart className="w-8 h-8" />, title: 'Donate', desc: 'Financial contributions support our ECD and environmental programmes.' }, { icon: <Handshake className="w-8 h-8" />, title: 'Partner', desc: 'Corporate partnerships for shared value initiatives.' }, { icon: <Briefcase className="w-8 h-8" />, title: 'Sponsor', desc: 'Sponsor a child\'s education or farming project.' }, { icon: <Users className="w-8 h-8" />, title: 'Volunteer', desc: 'Join our team of volunteers and coaches.' }].map((way, idx) => (<div key={idx} className="bg-white rounded-xl p-6 shadow-lg text-center"><div className="mb-3" style={{ color: brandColors.primary }}>{way.icon}</div><h3 className="text-lg font-bold mb-2">{way.title}</h3><p className="text-gray-600 text-sm">{way.desc}</p></div>))}</div>
          <div className="bg-gradient-to-r p-8 rounded-2xl text-white" style={{ background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})` }}><h3 className="text-2xl font-bold text-center mb-6">Make a Donation</h3><div className="max-w-md mx-auto space-y-4"><input type="text" placeholder="Full Name" className="w-full p-3 rounded-lg text-gray-800" /><input type="email" placeholder="Email Address" className="w-full p-3 rounded-lg text-gray-800" /><input type="tel" placeholder="Phone Number" className="w-full p-3 rounded-lg text-gray-800" /><div className="flex gap-4"><button onClick={() => setDonationAmount('100')} className={`flex-1 py-2 rounded-lg border ${donationAmount === '100' ? 'bg-white text-green-800' : 'bg-white/20'}`}>R100</button><button onClick={() => setDonationAmount('250')} className={`flex-1 py-2 rounded-lg border ${donationAmount === '250' ? 'bg-white text-green-800' : 'bg-white/20'}`}>R250</button><button onClick={() => setDonationAmount('500')} className={`flex-1 py-2 rounded-lg border ${donationAmount === '500' ? 'bg-white text-green-800' : 'bg-white/20'}`}>R500</button><button onClick={() => setDonationAmount('1000')} className={`flex-1 py-2 rounded-lg border ${donationAmount === '1000' ? 'bg-white text-green-800' : 'bg-white/20'}`}>R1000</button></div><div className="flex gap-4"><button onClick={() => setDonationFrequency('once')} className={`flex-1 py-2 rounded-lg border ${donationFrequency === 'once' ? 'bg-white text-green-800' : 'bg-white/20'}`}>Once-off</button><button onClick={() => setDonationFrequency('monthly')} className={`flex-1 py-2 rounded-lg border ${donationFrequency === 'monthly' ? 'bg-white text-green-800' : 'bg-white/20'}`}>Monthly</button></div><textarea placeholder="Dedication (Optional)" className="w-full p-3 rounded-lg text-gray-800" rows={2}></textarea><button className="w-full py-3 bg-yellow-500 text-green-900 font-bold rounded-lg">DONATE NOW</button></div></div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12"><Mail className="w-12 h-12 mx-auto mb-4" style={{ color: brandColors.primary }} /><h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brandColors.primary }}>Contact Us</h2></div>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white rounded-2xl p-8 shadow-lg"><div className="space-y-6"><div className="flex items-center gap-4"><Phone className="w-6 h-6" style={{ color: brandColors.primary }} /><div><p className="font-semibold">Phone</p><p>+27 87 821 7338</p></div></div><div className="flex items-center gap-4"><Mail className="w-6 h-6" style={{ color: brandColors.primary }} /><div><p className="font-semibold">Email</p><p>info@envirogreen.org.za</p></div></div><div className="flex items-center gap-4"><MapPin className="w-6 h-6" style={{ color: brandColors.primary }} /><div><p className="font-semibold">Address</p><p>Northern Cape, South Africa – Upington</p></div></div></div></div>
            <div className="bg-white rounded-2xl p-8 shadow-lg"><form className="space-y-4"><input type="text" placeholder="Your Name" className="w-full p-3 border rounded-lg" /><input type="email" placeholder="Your Email" className="w-full p-3 border rounded-lg" /><textarea placeholder="Your Message" rows={5} className="w-full p-3 border rounded-lg"></textarea><button className="w-full py-3 rounded-lg text-white" style={{ backgroundColor: brandColors.primary }}>SEND MESSAGE</button></form></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4" style={{ backgroundColor: brandColors.dark }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div><div className="flex items-center gap-2 mb-4"><Leaf className="w-8 h-8 text-green-500" /><span className="text-white font-bold">EnviroGreen</span><span className="text-gray-400 text-sm">and Foundation NPO</span></div><p className="text-gray-400 text-sm">Education for the Future – Protecting Our Children, Preserving Our Planet</p><p className="text-gray-500 text-xs mt-4">© 2026 EnviroGreen and Foundation. All Rights Reserved.</p></div>
            <div><h4 className="text-white font-semibold mb-4">Quick Links</h4><ul className="space-y-2 text-sm">{navItems.slice(0,5).map((item) => (<li key={item.name}><button onClick={() => scrollToSection(item.href)} className="text-gray-400 hover:text-white">{item.name}</button></li>))}</ul></div>
            <div><h4 className="text-white font-semibold mb-4">Programmes</h4><ul className="space-y-2 text-sm"><li className="text-gray-400">Early Childhood Development</li><li className="text-gray-400">Ecological Economics</li><li className="text-gray-400">Youth Development</li><li className="text-gray-400">Community Farming</li></ul></div>
            <div><h4 className="text-white font-semibold mb-4">Newsletter</h4><div className="flex"><input type="email" placeholder="Email" className="flex-1 p-2 rounded-l-lg text-gray-800" /><button className="px-4 py-2 rounded-r-lg text-white" style={{ backgroundColor: brandColors.primary }}>Subscribe</button></div><p className="text-gray-500 text-xs mt-4">NPO Registration Certificate | SARS Tax Certificate</p></div>
          </div>
        </div>
      </footer>

      {/* Back to Top */}
      {showBackToTop && (<button onClick={scrollToTop} className="fixed bottom-8 right-8 p-3 rounded-full shadow-lg text-white transition hover:opacity-90 z-50" style={{ backgroundColor: brandColors.primary }}><ArrowUp className="w-5 h-5" /></button>)}
    </div>
  );
}
