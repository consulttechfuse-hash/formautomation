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
  TrendingUp, Activity, Sprout, Eye, Compass, Info, Settings, Layers,
  DollarSign, CreditCard, Lock, Zap, Gift, HelpCircle
} from 'lucide-react';

export default function NpoPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('home');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [donationFrequency, setDonationFrequency] = useState('once');
  const [partnerView, setPartnerView] = useState<'schools' | 'corporates'>('schools');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState('');

  const brandColors = {
    primary: '#D54022',
    secondary: '#F3BC48',
    lightBg: '#F6F1E8',
    dark: '#333333',
    white: '#FFFFFF',
  };

  // Enlarged logo size (60% larger)
  const logoSize = { width: 52, height: 52 };

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    
    // Rotate partner view every 60 seconds
    const interval = setInterval(() => {
      setPartnerView(prev => prev === 'schools' ? 'corporates' : 'schools');
    }, 60000);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
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
      body: JSON.stringify(formData),
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

  const donorImages = [
    '/images/donor1.jpg', '/images/donor2.jpg', '/images/donor3.jpg', '/images/donor4.jpg', '/images/donor5.jpg'
  ];
  
  const donorNames = ['The Smith Family', 'ABC Corporate', 'John & Mary Foundation', 'TechFuse Cares', 'Community Trust'];

  const schoolsList = [
    'Eersterust High School', 'Dr. W.F. Nkomo Secondary', 'Pretoria Technical High', 'Hoërskool Gerrit Maritz', 'Pretoria High School for Girls'
  ];
  
  const corporatesList = [
    'TechFuse Holdings', 'Standard Bank', 'MTN Foundation', 'Anglo American', 'Discovery Health'
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: brandColors.lightBg }}>
      {/* Navigation - Same as homepage */}
      <nav className="fixed top-0 w-full z-50 shadow-md" style={{ backgroundColor: brandColors.white }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative" style={{ width: logoSize.width, height: logoSize.height }}>
                <Image src="/logo.png" alt="TechFuse Consulting Logo" width={logoSize.width} height={logoSize.height} className="object-contain" priority />
              </div>
              <span className="font-bold text-xl text-gray-800">TechFuse Holdings</span>
              <span className="text-xs text-gray-500 hidden sm:block">consult.consume</span>
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-gray-700 hover:text-primary">Home</Link>
              <Link href="/envirogreen" className="text-gray-700 hover:text-primary">EnviroGreen</Link>
              <Link href="/form-automation" className="text-white px-4 py-2 rounded-lg transition hover:opacity-90" style={{ backgroundColor: brandColors.primary }}>Form Automation</Link>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">{mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t p-4 space-y-2">
            <Link href="/" className="block py-2" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link href="/envirogreen" className="block py-2" onClick={() => setMobileMenuOpen(false)}>EnviroGreen</Link>
            <Link href="/form-automation" className="block py-2 font-medium" style={{ color: brandColors.primary }}>Form Automation →</Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-[60vh] flex items-center justify-center pt-16 bg-gradient-to-r" style={{ background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})` }}>
        <div className="relative z-20 text-center text-white px-4 max-w-4xl mx-auto py-20">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">DLCF Foundation</h1>
          <p className="text-xl md:text-2xl mb-6">Making a difference in someone's life by giving them hope. Prayer changes things but your actions are the answer to those prayers.</p>
          <button onClick={() => scrollToSection('#get-involved')} className="px-8 py-3 rounded-full font-semibold transition hover:opacity-90" style={{ backgroundColor: brandColors.white, color: brandColors.primary }}>DONATE NOW</button>
        </div>
      </section>

      {/* Donate Now Section - Above Contact Form */}
      <section id="get-involved" className="py-16 px-4" style={{ backgroundColor: brandColors.white }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <Heart className="w-12 h-12 mx-auto mb-4" style={{ color: brandColors.primary }} />
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brandColors.primary }}>Make a Donation</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Your contribution will enable our Next Generation Of Professionals to reach their goals and dreams.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Donation Form - Professional Style */}
            <div className="bg-gray-50 rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-bold mb-4" style={{ color: brandColors.primary }}>Donation Amount</h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {['100', '250', '500', '1000', '2500', '5000'].map((amount) => (
                  <button key={amount} onClick={() => setDonationAmount(amount)} className={`py-3 rounded-lg border-2 transition-all ${donationAmount === amount ? 'bg-green-600 text-white border-green-600' : 'border-gray-300 hover:border-green-600'}`}>R{amount}</button>
                ))}
                <div className="col-span-2"><input type="number" placeholder="Other Amount (ZAR)" className="w-full p-3 border rounded-lg" onChange={(e) => setDonationAmount(e.target.value)} /></div>
              </div>
              <div className="flex gap-4 mb-6"><button onClick={() => setDonationFrequency('once')} className={`flex-1 py-2 rounded-lg ${donationFrequency === 'once' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>Once-off</button><button onClick={() => setDonationFrequency('monthly')} className={`flex-1 py-2 rounded-lg ${donationFrequency === 'monthly' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>Monthly</button></div>
              <button onClick={handleDonate} className="w-full py-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2" style={{ backgroundColor: brandColors.primary }}><CreditCard className="w-5 h-5" /> Donate R{donationAmount || '0'} {donationFrequency === 'monthly' ? '/month' : ''}</button>
              <p className="text-xs text-gray-500 text-center mt-4 flex items-center justify-center gap-1"><Lock className="w-3 h-3" /> Secure payment via PayFast / Yoco</p>
            </div>
            
            {/* Contact Form - Same as Homepage */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border">
              <h3 className="text-xl font-bold mb-4" style={{ color: brandColors.primary }}>Contact Information</h3>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <input type="text" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
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

      {/* Community Outreach Section */}
      <section className="py-20 px-4" style={{ backgroundColor: brandColors.lightBg }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brandColors.primary }}>Community Outreach</h2>
              <p className="text-gray-700 mb-4">We connect talent with opportunity and enhance your capabilities for success.</p>
              <p className="text-gray-700 mb-4">Our effective training programmes bridge the gap between education, entrepreneurship and employment. By doing this, we increase each individual's effectiveness in employability and entrepreneurship.</p>
              <p className="text-gray-700">Our modern, innovative training programmes are also essential for skills development. We believe in developing skills that are hard to replace and impossible to ignore.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br rounded-2xl h-48 flex items-center justify-center text-white" style={{ background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})` }}><Image src="/images/community1.jpg" alt="Community" width={200} height={200} className="object-cover rounded-2xl w-full h-full" onError={(e) => { e.currentTarget.style.display = 'none'; }} /><span className="absolute text-white font-bold">Image 1</span></div>
              <div className="bg-gradient-to-br rounded-2xl h-48 flex items-center justify-center text-white" style={{ background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})` }}><Image src="/images/community2.jpg" alt="Community" width={200} height={200} className="object-cover rounded-2xl w-full h-full" onError={(e) => { e.currentTarget.style.display = 'none'; }} /><span className="absolute text-white font-bold">Image 2</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Partnerships Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Handshake className="w-12 h-12 mx-auto mb-4" style={{ color: brandColors.primary }} />
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brandColors.primary }}>Our Partners</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Our programmes are run and supported by amazing partners who share our values and make the magic happen.</p>
          </div>
          
          {/* Donor Slider */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-center mb-8" style={{ color: brandColors.primary }}>Thank You to All Our Donors</h3>
            <p className="text-center text-gray-500 mb-8">God bless you.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {donorNames.map((name, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-6 shadow-lg text-center transition-transform hover:scale-105">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-2xl font-bold" style={{ background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})` }}>{name.charAt(0)}</div>
                  <p className="font-semibold">{name}</p>
                  <p className="text-xs text-gray-500">Supporter</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Rotating Partner Schools/Corporates */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="text-center mb-6">
              <div className="inline-flex gap-2 p-1 bg-gray-100 rounded-lg">
                <button onClick={() => setPartnerView('schools')} className={`px-4 py-2 rounded-lg transition ${partnerView === 'schools' ? 'text-white' : 'text-gray-600'}`} style={{ backgroundColor: partnerView === 'schools' ? brandColors.primary : 'transparent' }}>Schools</button>
                <button onClick={() => setPartnerView('corporates')} className={`px-4 py-2 rounded-lg transition ${partnerView === 'corporates' ? 'text-white' : 'text-gray-600'}`} style={{ backgroundColor: partnerView === 'corporates' ? brandColors.primary : 'transparent' }}>Corporates</button>
              </div>
            </div>
            <h3 className="text-xl font-bold text-center mb-6" style={{ color: brandColors.primary }}>Meet Our Partners - {partnerView === 'schools' ? 'Educational Institutions' : 'Corporate Partners'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(partnerView === 'schools' ? schoolsList : corporatesList).map((partner, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"><School className="w-5 h-5" style={{ color: brandColors.primary }} /><span>{partner}</span></div>
              ))}
            </div>
            <p className="text-center text-gray-400 text-sm mt-4">View changes every 60 seconds</p>
          </div>
        </div>
      </section>

      {/* Youth Development - Changemakers */}
      <section className="py-20 px-4" style={{ backgroundColor: brandColors.lightBg }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Zap className="w-12 h-12 mx-auto mb-4" style={{ color: brandColors.primary }} />
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brandColors.primary }}>Youth Development – Changemakers</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Empowering our youth to become leaders of tomorrow</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center"><Activity className="w-12 h-12 mx-auto mb-4" style={{ color: brandColors.primary }} /><h3 className="text-xl font-bold mb-2">Sports Development</h3><p className="text-gray-600">Identifying and nurturing athletic talent through structured programmes.</p></div>
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center"><Star className="w-12 h-12 mx-auto mb-4" style={{ color: brandColors.primary }} /><h3 className="text-xl font-bold mb-2">Talent Search</h3><p className="text-gray-600">Discovering hidden potential in arts, music, and leadership.</p></div>
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center"><Book className="w-12 h-12 mx-auto mb-4" style={{ color: brandColors.primary }} /><h3 className="text-xl font-bold mb-2">Academic Excellence</h3><p className="text-gray-600">Scholarships and tutoring for academic achievers.</p></div>
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center"><Heart className="w-12 h-12 mx-auto mb-4" style={{ color: brandColors.primary }} /><h3 className="text-xl font-bold mb-2">Life Skills</h3><p className="text-gray-600">Leadership, financial literacy, and career guidance.</p></div>
          </div>
        </div>
      </section>

      {/* Programmes Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border-t-4" style={{ borderTopColor: brandColors.primary }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${brandColors.primary}20` }}><Calendar className="w-8 h-8" style={{ color: brandColors.primary }} /></div>
              <h3 className="text-xl font-bold mb-2">DLCF Matric Ball</h3>
              <p className="text-gray-600">On 30th November 2024, we hosted a Matric Ball for students of both High Schools in Eersterust, Pretoria. We aim to do this annually and welcome Sponsors and Donors.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg border-t-4" style={{ borderTopColor: brandColors.secondary }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${brandColors.secondary}20` }}><Book className="w-8 h-8" style={{ color: brandColors.secondary }} /></div>
              <h3 className="text-xl font-bold mb-2">DLCF School Items Drive</h3>
              <p className="text-gray-600">Our School Items Drive became a vehicle of change in the community of Eersterust, Pretoria. Our goal is to reach more communities.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg border-t-4" style={{ borderTopColor: brandColors.primary }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${brandColors.primary}20` }}><Heart className="w-8 h-8" style={{ color: brandColors.primary }} /></div>
              <h3 className="text-xl font-bold mb-2">DLCF Drug Rehabilitation</h3>
              <p className="text-gray-600">Our Drug Rehabilitation Programme aims to restore and reintegrate drug users back into society.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg border-t-4" style={{ borderTopColor: brandColors.secondary }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${brandColors.secondary}20` }}><Shield className="w-8 h-8" style={{ color: brandColors.secondary }} /></div>
              <h3 className="text-xl font-bold mb-2">GBV Prevention</h3>
              <p className="text-gray-600">Our Gender Based Violence Prevention Programme is geared towards our youth, ensuring they are equipped with the right tools to navigate life.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg border-t-4 col-span-2" style={{ borderTopColor: brandColors.primary }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${brandColors.primary}20` }}><Gift className="w-8 h-8" style={{ color: brandColors.primary }} /></div>
              <h3 className="text-xl font-bold mb-2">General Donations Drive</h3>
              <p className="text-gray-600">Make a difference in someone's life by giving them hope. Prayer changes things but your actions are the answer to those prayers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4" style={{ backgroundColor: brandColors.dark }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div><div className="flex items-center gap-2 mb-4"><Heart className="w-8 h-8 text-red-500" /><span className="text-white font-bold">DLCF Foundation</span></div><p className="text-gray-400 text-sm">Making a difference in someone's life by giving them hope.</p><p className="text-gray-500 text-xs mt-4">© 2026 DLCF Foundation. All Rights Reserved.</p></div>
            <div><h4 className="text-white font-semibold mb-4">Quick Links</h4><ul className="space-y-2 text-sm"><li><button onClick={() => scrollToSection('#get-involved')} className="text-gray-400 hover:text-white">Donate</button></li><li><Link href="/envirogreen" className="text-gray-400 hover:text-white">EnviroGreen</Link></li><li><Link href="/" className="text-gray-400 hover:text-white">TechFuse Home</Link></li></ul></div>
            <div><h4 className="text-white font-semibold mb-4">Programmes</h4><ul className="space-y-2 text-sm"><li className="text-gray-400">Matric Ball</li><li className="text-gray-400">School Items Drive</li><li className="text-gray-400">Drug Rehabilitation</li><li className="text-gray-400">GBV Prevention</li></ul></div>
            <div><h4 className="text-white font-semibold mb-4">Contact</h4><p className="text-gray-400 text-sm">Email: info@dlcf.org.za</p><p className="text-gray-400 text-sm">Phone: +27 87 821 7338</p><p className="text-gray-400 text-sm">Pretoria, South Africa</p></div>
          </div>
        </div>
      </footer>

      {/* Back to Top */}
      {showBackToTop && (<button onClick={scrollToTop} className="fixed bottom-8 right-8 p-3 rounded-full shadow-lg text-white transition hover:opacity-90 z-50" style={{ backgroundColor: brandColors.primary }}><ArrowUp className="w-5 h-5" /></button>)}
    </div>
  );
}
