'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Menu, X, ChevronDown, Heart, Handshake, Briefcase, GraduationCap,
  Leaf, Globe, Factory, Users, Target, BookOpen, Star, HardHat,
  HeartPulse, Brain, ArrowUp, Award, Truck, Recycle, Droplets,
  Trees, Sun, Shield, Book, User, FileText, CheckCircle, Sparkles,
  Baby, School, Home, Building, Calendar, Mail, Phone, MapPin, Send,
  TrendingUp, Activity, Sprout, Eye, Compass, CreditCard, Lock, Zap
} from 'lucide-react';

export default function EnvirogreenPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('home');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [donationFrequency, setDonationFrequency] = useState('once');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState('');

  const brandColors = {
    primary: '#2E7D32',
    secondary: '#4CAF50',
    accent: '#FFC107',
    light: '#F5F5F5',
    dark: '#1B5E20',
    white: '#FFFFFF',
  };

  const logoSize = { width: 40, height: 40 };

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollToSection = (href: string) => {
    const id = href.substring(1);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('sending');
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, to: 'envirogreen@techfuseconsult.online' }),
    });
    if (response.ok) {
      setFormStatus('success');
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setFormStatus(''), 3000);
    } else {
      setFormStatus('error');
    }
  };

  const handleDonate = () => {
    alert(`Donation of R${donationAmount || '0'} (${donationFrequency}) - Payment gateway integration coming soon.`);
  };

  const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'Our Vision', href: '#vision' },
    { name: 'Programmes', href: '#programmes' },
    { name: 'Get Involved', href: '#get-involved' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: brandColors.white }}>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 shadow-md" style={{ backgroundColor: brandColors.white }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative" style={{ width: logoSize.width, height: logoSize.height }}>
                <Image src="/logo.png" alt="TechFuse Consulting Logo" width={logoSize.width} height={logoSize.height} className="object-contain" priority />
              </div>
              
              <span className="text-xs text-gray-500 hidden sm:block">consult.consume</span>
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <button key={item.name} onClick={() => scrollToSection(item.href)} className="text-gray-700 hover:text-green-600 text-sm font-medium">
                  {item.name}
                </button>
              ))}
              <Link href="/form-automation" className="text-white px-3 py-1.5 rounded-md text-sm font-medium transition hover:opacity-90" style={{ backgroundColor: '#D54022' }}>Form Automation</Link>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">{mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t p-4 space-y-2">
            {navItems.map((item) => (<button key={item.name} onClick={() => scrollToSection(item.href)} className="block w-full text-left py-2 text-gray-600">{item.name}</button>))}
            <Link href="/form-automation" className="block py-2 font-medium" style={{ color: '#D54022' }}>Form Automation →</Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-[60vh] flex items-center justify-center pt-16" style={{ background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})` }}>
        <div className="relative z-20 text-center text-white px-4 max-w-4xl mx-auto py-20">
          <Leaf className="w-20 h-20 mx-auto mb-4" />
          <h1 className="text-4xl md:text-6xl font-bold mb-4">EnviroGreen Foundation</h1>
          <p className="text-xl md:text-2xl mb-6">Building Sustainable Futures – One Child, One Community, One Ecosystem at a Time</p>
          <button onClick={() => scrollToSection('#get-involved')} className="px-8 py-3 rounded-full font-semibold transition hover:opacity-90 bg-yellow-500 text-green-900">SUPPORT OUR MISSION</button>
        </div>
      </section>

      {/* Vision Section */}
      <section id="vision" className="py-20 px-4" style={{ backgroundColor: brandColors.light }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12"><Eye className="w-12 h-12 mx-auto mb-4" style={{ color: brandColors.primary }} /><h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brandColors.primary }}>Our Vision</h2></div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg"><h3 className="text-2xl font-bold mb-4" style={{ color: brandColors.secondary }}>Vision Statement</h3><p className="text-gray-700">To provide an Economic Impact Environmental Program, bringing sustainable solutions through Early Childhood Development Programs and Low Economic Household Programs.</p></div>
            <div className="bg-white rounded-2xl p-8 shadow-lg"><h3 className="text-2xl font-bold mb-4" style={{ color: brandColors.secondary }}>Mission Statement</h3><p className="text-gray-700">To educate and inform individuals to reach their full potential through outstanding quality service.</p></div>
          </div>
        </div>
      </section>

      {/* Programmes Section */}
      <section id="programmes" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12"><h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brandColors.primary }}>Our Programmes</h2></div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg"><GraduationCap className="w-12 h-12 mb-4" style={{ color: brandColors.primary }} /><h3 className="text-xl font-bold mb-2">Education Programmes</h3><p className="text-gray-600">Early learning programs and educational support for children.</p></div>
            <div className="bg-white rounded-2xl p-6 shadow-lg"><Leaf className="w-12 h-12 mb-4" style={{ color: brandColors.primary }} /><h3 className="text-xl font-bold mb-2">Environmental Programmes</h3><p className="text-gray-600">Community farming, recycling, and green initiatives.</p></div>
            <div className="bg-white rounded-2xl p-6 shadow-lg"><Heart className="w-12 h-12 mb-4" style={{ color: brandColors.primary }} /><h3 className="text-xl font-bold mb-2">Youth Development</h3><p className="text-gray-600">Sports, talent search, and leadership programmes.</p></div>
          </div>
        </div>
      </section>

      {/* Donate Now Section */}
      <section id="get-involved" className="py-16 px-4" style={{ backgroundColor: brandColors.white }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <Heart className="w-12 h-12 mx-auto mb-4" style={{ color: brandColors.primary }} />
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brandColors.primary }}>Support Our Mission</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Your contribution helps us protect our environment and empower our communities.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="rounded-2xl p-8 shadow-lg text-white" style={{ background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})` }}>
              <h3 className="text-xl font-bold mb-4">Donation Amount</h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {['100', '250', '500', '1000', '2500', '5000'].map((amount) => (
                  <button key={amount} onClick={() => setDonationAmount(amount)} className={`py-3 rounded-lg border-2 transition-all ${donationAmount === amount ? 'bg-white text-green-800 border-white' : 'bg-white/20 border-white/50 hover:bg-white/30'}`}>R{amount}</button>
                ))}
                <div className="col-span-2"><input type="number" placeholder="Other Amount (ZAR)" className="w-full p-3 rounded-lg text-gray-800" onChange={(e) => setDonationAmount(e.target.value)} /></div>
              </div>
              <div className="flex gap-4 mb-6"><button onClick={() => setDonationFrequency('once')} className={`flex-1 py-2 rounded-lg ${donationFrequency === 'once' ? 'bg-white text-green-800' : 'bg-white/20'}`}>Once-off</button><button onClick={() => setDonationFrequency('monthly')} className={`flex-1 py-2 rounded-lg ${donationFrequency === 'monthly' ? 'bg-white text-green-800' : 'bg-white/20'}`}>Monthly</button></div>
              <button onClick={handleDonate} className="w-full py-3 rounded-lg bg-white text-green-800 font-semibold flex items-center justify-center gap-2"><CreditCard className="w-5 h-5" /> Donate R{donationAmount || '0'} {donationFrequency === 'monthly' ? '/month' : ''}</button>
              <p className="text-xs text-center mt-4 flex items-center justify-center gap-1 text-white/80"><Lock className="w-3 h-3" /> Secure payment via PayFast / Yoco</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg border-t-4" style={{ borderTopColor: brandColors.primary }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: brandColors.primary }}>Get in Touch</h3>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <input type="text" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500" required />
                <input type="email" placeholder="Email Address" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full p-3 border rounded-lg" required />
                <textarea placeholder="Message (Optional)" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={3} className="w-full p-3 border rounded-lg"></textarea>
                <button type="submit" disabled={formStatus === 'sending'} className="w-full py-3 rounded-lg text-white transition hover:opacity-90" style={{ backgroundColor: brandColors.primary }}>{formStatus === 'sending' ? 'Sending...' : 'Send Message'}</button>
                {formStatus === 'success' && <p className="text-green-600 text-center">Message sent!</p>}
                {formStatus === 'error' && <p className="text-red-600 text-center">Failed to send. Try again.</p>}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4" style={{ backgroundColor: brandColors.light }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12"><Mail className="w-12 h-12 mx-auto mb-4" style={{ color: brandColors.primary }} /><h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brandColors.primary }}>Contact Us</h2></div>
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg"><Phone className="w-8 h-8 mb-4" style={{ color: brandColors.primary }} /><h3 className="text-xl font-bold mb-2">Phone</h3><p>+27 87 821 7338</p></div>
            <div className="bg-white rounded-2xl p-8 shadow-lg"><Mail className="w-8 h-8 mb-4" style={{ color: brandColors.primary }} /><h3 className="text-xl font-bold mb-2">Email</h3><p>envirogreen@techfuseconsult.online</p></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4" style={{ backgroundColor: brandColors.dark }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div><Leaf className="w-8 h-8 text-green-500 mb-4" /><p className="text-gray-400 text-sm">Building Sustainable Futures – One Child, One Community, One Ecosystem at a Time</p><p className="text-gray-500 text-xs mt-4">© 2026 Techfuse Holdings (Pty) Ltd. All rights reserved.</p></div>
            <div><h4 className="text-white font-semibold mb-4">Quick Links</h4><ul className="space-y-2 text-sm"><li><button onClick={() => scrollToSection('#home')} className="text-gray-400 hover:text-white">Home</button></li><li><button onClick={() => scrollToSection('#vision')} className="text-gray-400 hover:text-white">Our Vision</button></li><li><button onClick={() => scrollToSection('#programmes')} className="text-gray-400 hover:text-white">Programmes</button></li></ul></div>
            <div><h4 className="text-white font-semibold mb-4">Contact</h4><p className="text-gray-400 text-sm">Email: envirogreen@techfuseconsult.online</p><p className="text-gray-400 text-sm">Phone: +27 87 821 7338</p></div>
            <div><h4 className="text-white font-semibold mb-4">Location</h4><p className="text-gray-400 text-sm">Northern Cape, South Africa</p></div>
          </div>
        </div>
      </footer>

      {/* Back to Top */}
      {showBackToTop && (<button onClick={scrollToTop} className="fixed bottom-8 right-8 p-3 rounded-full shadow-lg text-white transition hover:opacity-90 z-50" style={{ backgroundColor: brandColors.primary }}><ArrowUp className="w-5 h-5" /></button>)}
    </div>
  );
}
