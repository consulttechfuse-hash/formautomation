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

  const logoSize = { width: 48, height: 48 };

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

  const programmes = [
    { icon: <GraduationCap className="w-12 h-12" />, title: 'Foundation & Educational', description: 'Early learning and associated programs customized with social and community capacity building.', activities: ['Feeding programs', 'Educational tools supply', 'School girl sanitary wear distribution', 'Deep rural community upliftment'] },
    { icon: <Leaf className="w-12 h-12" />, title: 'Environmental & Eco-system', description: 'Comprehensive Environmental Programs and Management Service Portfolios.', activities: ['Community farming establishment', 'Circular Economic establishment', 'Deep rural community upliftment'] },
    { icon: <Star className="w-12 h-12" />, title: 'Specialist Programming', description: 'Targeted interventions for sustainable community development.', activities: ['Community self-feeding scheme programs', 'Smart Green Programs', 'Smart Recycling', 'OHS Coaching', 'Business Plans', 'Project Management'] },
  ];

  const trainingCourses = [
    { icon: <HeartPulse className="w-6 h-6" />, title: 'First Aid Courses', description: 'Comprehensive first aid training for all contexts' },
    { icon: <Activity className="w-6 h-6" />, title: 'Fire Fighting Courses', description: 'Basic to advanced fire response' },
    { icon: <HardHat className="w-6 h-6" />, title: 'Health and Safety Courses', description: 'OHS compliance and implementation' },
    { icon: <HeartPulse className="w-6 h-6" />, title: 'CPR, AED & Choking Courses', description: 'Life-saving emergency response' },
    { icon: <Star className="w-6 h-6" />, title: 'Specialised Courses', description: 'Customized programs for specific needs' },
  ];

  const youthProgrammes = [
    { icon: <Activity className="w-10 h-10" />, title: 'Youth Sport & Social Programming', description: 'Sport and related activities to divert social ills with healthy body conditioning.' },
    { icon: <Brain className="w-10 h-10" />, title: 'Youth Psychological Services', description: 'Mental support and capacity building to heal body, mind, and soul.' },
    { icon: <GraduationCap className="w-10 h-10" />, title: 'Educational & Study Bursaries', description: 'Providing raw academic talent a chance to further their career.' },
  ];

  const teamMembers = [
    { name: 'Joey Gouws', title: 'Managing Director', bio: 'ICT Industry career specialist of 30+ years and Managing Director of various businesses. Ecological and Environmental challenges are of high importance.', email: 'joey@envirogreen.co.za', initial: 'J' },
    { name: 'Lucrecia Van Wyk', title: 'Operations Director', bio: 'ECD Specialist Consultant for private and public sectors. Specialising in curriculum development, assess and moderate accredited programs.', email: 'lucrecia@envirogreen.co.za', initial: 'L' },
  ];

  const technicalSolutions = [
    { title: 'Presses', items: ['Presses for compaction', 'Portable compactor', '"Press Container"'] },
    { title: 'Shredders', items: ['Recyclable materials shredders', 'Bulky waste crushers', 'Green waste shredders'] },
    { title: 'Biogas Flares', items: ['Compact type biogas burning flares', 'Biogas wellheads', 'Condensate arrestors'] },
    { title: 'Composting', items: ['Aerobic units for vertical composting', 'Aerobic/anaerobic composting equipment'] },
    { title: 'Bins', items: ['Composting bins', 'Waste bins', 'Recycling bins'] },
    { title: 'Hospital Waste', items: ['Disinfection systems for hospital waste', 'Infectious waste treatment'] },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: brandColors.white }}>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 shadow-md" style={{ backgroundColor: brandColors.white }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative w-12 h-12">
                <Image src="/logo.png" alt="TechFuse Consulting Logo" width={48} height={48} className="object-contain" priority />
              </div>
              <span className="text-sm text-gray-500 hidden sm:block">consult.consume</span>
            </Link>
            <div className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => (
                <button key={item.name} onClick={() => scrollToSection(item.href)} className={`text-sm transition-colors ${activeSection === item.href.substring(1) ? 'font-bold' : 'text-gray-600 hover:text-green-600'}`} style={{ color: activeSection === item.href.substring(1) ? brandColors.primary : undefined }}>{item.name}</button>
              ))}
            </div>
            <div className="hidden md:flex items-center space-x-3">
              <button onClick={() => scrollToSection('#get-involved')} className="px-4 py-2 rounded-lg text-white transition hover:opacity-90" style={{ backgroundColor: brandColors.primary }}>DONATE NOW</button>
              <button onClick={() => scrollToSection('#get-involved')} className="px-4 py-2 rounded-lg border-2 transition hover:bg-gray-50" style={{ borderColor: brandColors.primary, color: brandColors.primary }}>PARTNER WITH US</button>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">{mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t p-4 space-y-2">
            {navItems.map((item) => (<button key={item.name} onClick={() => scrollToSection(item.href)} className="block w-full text-left py-2 text-gray-600">{item.name}</button>))}
            <button onClick={() => scrollToSection('#get-involved')} className="w-full py-2 rounded-lg text-white mt-2" style={{ backgroundColor: brandColors.primary }}>DONATE NOW</button>
            <button onClick={() => scrollToSection('#get-involved')} className="w-full py-2 rounded-lg border-2 mt-2" style={{ borderColor: brandColors.primary, color: brandColors.primary }}>PARTNER WITH US</button>
            <Link href="/form-automation" className="block py-2 font-medium" style={{ color: '#D54022' }} onClick={() => setMobileMenuOpen(false)}>Form Automation →</Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-[70vh] flex items-center justify-center pt-16" style={{ background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})` }}>
        <div className="relative z-20 text-center text-white px-4 max-w-4xl mx-auto py-20">
          <Leaf className="w-20 h-20 mx-auto mb-4" />
          <h1 className="text-4xl md:text-6xl font-bold mb-4">EnviroGreen Foundation</h1>
          <p className="text-xl md:text-2xl mb-6">Building Sustainable Futures – One Child, One Community, One Ecosystem at a Time</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={() => scrollToSection('#programmes')} className="px-8 py-3 rounded-full font-semibold transition hover:opacity-90 bg-yellow-500 text-green-900">EXPLORE OUR PROGRAMMES</button>
            <button onClick={() => scrollToSection('#get-involved')} className="px-8 py-3 rounded-full font-semibold border-2 border-white transition hover:bg-white hover:text-green-800">SUPPORT OUR MISSION</button>
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

      {/* Core Programmes Section */}
      <section id="programmes" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12"><h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brandColors.primary }}>What We Do – Core Programmes</h2></div>
          <div className="grid md:grid-cols-3 gap-8">{programmes.map((programme, idx) => (<div key={idx} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"><div className="mb-4" style={{ color: brandColors.primary }}>{programme.icon}</div><h3 className="text-xl font-bold mb-2" style={{ color: brandColors.primary }}>{programme.title}</h3><p className="text-gray-600 mb-4">{programme.description}</p><ul className="space-y-2">{programme.activities.map((activity, i) => (<li key={i} className="flex items-center gap-2 text-sm text-gray-600"><CheckCircle className="w-4 h-4" style={{ color: brandColors.secondary }} /> {activity}</li>))}</ul></div>))}</div>
        </div>
      </section>

      {/* Ecological Economics Section */}
      <section className="py-20 px-4" style={{ backgroundColor: brandColors.light }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div><Factory className="w-12 h-12 mb-4" style={{ color: brandColors.primary }} /><h2 className="text-3xl font-bold mb-4" style={{ color: brandColors.primary }}>Ecological Economics – Sustainable Development & Poverty Eradication</h2><p className="text-gray-700 mb-6">The purpose of our Ecological Economics strategy is to ensure a path to sustainable development and poverty eradication with the potential for new jobs and business opportunities.</p><div className="grid grid-cols-2 gap-4"><div className="flex items-center gap-2"><TrendingUp className="w-5 h-5" style={{ color: brandColors.secondary }} /><span>New job creation</span></div><div className="flex items-center gap-2"><Briefcase className="w-5 h-5" style={{ color: brandColors.secondary }} /><span>Business opportunities</span></div><div className="flex items-center gap-2"><Heart className="w-5 h-5" style={{ color: brandColors.secondary }} /><span>Improved health</span></div><div className="flex items-center gap-2"><Globe className="w-5 h-5" style={{ color: brandColors.secondary }} /><span>Sustainable resource use</span></div></div></div>
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center"><Sprout className="w-24 h-24 mx-auto mb-4" style={{ color: brandColors.primary }} /><p className="text-gray-600">Green technology and sustainable solutions for a better future</p></div>
          </div>
        </div>
      </section>

      {/* Target Areas */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12"><Target className="w-12 h-12 mx-auto mb-4" style={{ color: brandColors.primary }} /><h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brandColors.primary }}>Who We Serve – Target Areas & Groups</h2></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{['Early Childhood Development (birth to 5 years)', 'Parents combined programme', 'Ecological Economics', 'Accreditation of training providers', 'Approval of legacy learning programs'].map((item, idx) => (<div key={idx} className="flex items-center gap-3 bg-white p-4 rounded-lg shadow"><CheckCircle className="w-5 h-5" style={{ color: brandColors.secondary }} /><span>{item}</span></div>))}</div>
        </div>
      </section>

      {/* Holistic Approach */}
      <section className="py-20 px-4" style={{ backgroundColor: brandColors.light }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative w-full h-80 bg-gradient-to-br rounded-2xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})` }}><div className="text-center text-white"><Baby className="w-20 h-20 mx-auto mb-4" /><p className="text-sm">Child at the centre</p><div className="flex flex-wrap gap-4 justify-center mt-4 text-xs"><span>Family</span><span>Community</span><span>School</span><span>Health</span><span>Environment</span></div></div></div>
            <div><h2 className="text-3xl font-bold mb-4" style={{ color: brandColors.primary }}>A Holistic Approach to Child Development</h2><p className="text-gray-700 mb-6">The needs of children and their families are complex and diverse and cannot be addressed by an organisation or department working in isolation.</p><div className="grid grid-cols-2 gap-3">{['Primary health care', 'Adequate nutrition', 'Safe water', 'Basic sanitation', 'Birth registration', 'Protection from abuse', 'Psychosocial support', 'Early childhood care'].map((item, idx) => (<div key={idx} className="flex items-center gap-2"><CheckCircle className="w-4 h-4" style={{ color: brandColors.secondary }} /><span className="text-sm">{item}</span></div>))}</div></div>
          </div>
        </div>
      </section>

      {/* Green Education */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div><h2 className="text-3xl font-bold mb-4" style={{ color: brandColors.primary }}>Green Education – Smart Behaviours from an Early Age</h2><p className="text-gray-700 mb-6">We use our EPV (Environmental Program Value) program to further stimulate Early Development for Smart Green behaviours at an early stage.</p><div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg"><HeartPulse className="w-8 h-8" style={{ color: brandColors.secondary }} /><div><h3 className="font-bold">Healthy Learners</h3><p className="text-sm">Nutrition and wellness support</p></div></div></div>
            <div className="bg-gradient-to-br rounded-2xl p-8 text-white text-center" style={{ background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})` }}><Trees className="w-20 h-20 mx-auto mb-4" /><p className="text-lg">Planting seeds of knowledge for a sustainable future</p></div>
          </div>
        </div>
      </section>

      {/* Where We Operate */}
      <section id="location" className="py-20 px-4" style={{ backgroundColor: brandColors.light }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12"><MapPin className="w-12 h-12 mx-auto mb-4" style={{ color: brandColors.primary }} /><h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brandColors.primary }}>Where We Operate</h2></div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center"><MapPin className="w-16 h-16 mx-auto mb-4" style={{ color: brandColors.primary }} /><h3 className="text-xl font-bold mb-2">Northern Cape, South Africa – Upington</h3><p className="text-gray-600">The Education levels in the Northern Cape is very low. Most people have no schooling, resulting in high unemployment.</p></div>
            <div className="bg-white rounded-2xl p-8 shadow-lg"><h3 className="text-xl font-bold mb-4" style={{ color: brandColors.primary }}>Our Response</h3><p className="text-gray-600 mb-4">EnviroGreen Foundation is embarking on a massive campaign to raise awareness on the rights of children as articulated in the Children's Act.</p><div className="bg-red-50 p-4 rounded-lg"><p className="text-red-700 text-sm">Despite the best efforts, children still remain vulnerable to abuse, neglect, and exploitation.</p></div></div>
          </div>
        </div>
      </section>

      {/* Business Model */}
      <section id="business-model" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12"><Building className="w-12 h-12 mx-auto mb-4" style={{ color: brandColors.primary }} /><h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brandColors.primary }}>Our Business Model – Tri-Sector Engagement</h2></div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center border-t-4" style={{ borderTopColor: brandColors.primary }}><Building className="w-16 h-16 mx-auto mb-4" style={{ color: brandColors.primary }} /><h3 className="text-xl font-bold mb-2">Government</h3><p className="text-gray-600">Co-operative Engagement – We engage all levels of state to ensure all compliance and laws are enforced.</p></div>
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center border-t-4" style={{ borderTopColor: brandColors.secondary }}><Briefcase className="w-16 h-16 mx-auto mb-4" style={{ color: brandColors.secondary }} /><h3 className="text-xl font-bold mb-2">Business</h3><p className="text-gray-600">Invested Interest – Create interest to invest more into green solutions and environmental economic support.</p></div>
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center border-t-4" style={{ borderTopColor: brandColors.accent }}><Users className="w-16 h-16 mx-auto mb-4" style={{ color: brandColors.accent }} /><h3 className="text-xl font-bold mb-2">Communities</h3><p className="text-gray-600">Sustainable Economics – We work tirelessly to ensure the most vulnerable communities are protected.</p></div>
          </div>
        </div>
      </section>

      {/* Specialist Products & Services */}
      <section id="specialist" className="py-20 px-4" style={{ backgroundColor: brandColors.light }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12"><Star className="w-12 h-12 mx-auto mb-4" style={{ color: brandColors.primary }} /><h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brandColors.primary }}>Specialist Products & Services</h2><p className="text-gray-600">Health and Safety Training – Made Simple, Logical, and Effective</p></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">{trainingCourses.map((course, idx) => (<div key={idx} className="bg-white rounded-xl p-6 shadow-lg flex items-start gap-4"><div className="p-3 rounded-full" style={{ backgroundColor: `${brandColors.primary}20` }}>{course.icon}</div><div><h3 className="font-bold text-lg">{course.title}</h3><p className="text-gray-500 text-sm">{course.description}</p></div></div>))}</div>
          <div className="bg-white rounded-2xl p-8 shadow-lg"><h3 className="text-xl font-bold mb-4" style={{ color: brandColors.primary }}>Ecological & Environmental Technical Solutions</h3><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{technicalSolutions.map((cat, idx) => (<div key={idx}><h4 className="font-semibold mb-2">{cat.title}</h4><ul className="text-sm text-gray-600 space-y-1">{cat.items.map((item, i) => <li key={i}>• {item}</li>)}</ul></div>))}</div></div>
        </div>
      </section>

      {/* Community Farming */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-r p-8 rounded-2xl text-white text-center" style={{ background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})` }}><Sprout className="w-20 h-20 mx-auto mb-4" /><p className="text-lg">Growing Bodies Need the Best Nutrition</p></div>
            <div><h2 className="text-3xl font-bold mb-4" style={{ color: brandColors.primary }}>Community Farming & Smart Agriculture</h2><p className="text-gray-700 mb-6">It is of vital importance to ensure learners and households have access to healthy food in a sustainable manner.</p><button className="px-6 py-2 rounded-lg text-white" style={{ backgroundColor: brandColors.primary }}>VIEW OUR FARMING INITIATIVES →</button></div>
          </div>
        </div>
      </section>

      {/* Youth Programmes */}
      <section className="py-20 px-4" style={{ backgroundColor: brandColors.light }}>
        <div className="max-w-7xl mx-auto"><h2 className="text-3xl font-bold text-center mb-12" style={{ color: brandColors.primary }}>Youth Programmes</h2><div className="grid md:grid-cols-3 gap-8">{youthProgrammes.map((programme, idx) => (<div key={idx} className="bg-white rounded-2xl p-6 shadow-lg text-center"><div className="mb-4" style={{ color: brandColors.primary }}>{programme.icon}</div><h3 className="text-xl font-bold mb-2">{programme.title}</h3><p className="text-gray-600">{programme.description}</p></div>))}</div></div>
      </section>

      {/* Our Team */}
      <section id="team" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12"><Users className="w-12 h-12 mx-auto mb-4" style={{ color: brandColors.primary }} /><h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brandColors.primary }}>Our Leadership Team</h2></div>
          <div className="grid md:grid-cols-2 gap-8">{teamMembers.map((member, idx) => (<div key={idx} className="bg-white rounded-2xl p-8 shadow-lg flex gap-6"><div className="w-24 h-24 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-2xl font-bold" style={{ background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})` }}>{member.initial}</div><div><h3 className="text-xl font-bold">{member.name}</h3><p className="text-green-600 mb-2">{member.title}</p><p className="text-gray-600 text-sm">{member.bio}</p><a href={`mailto:${member.email}`} className="text-sm text-green-600 mt-2 inline-block">{member.email}</a></div></div>))}</div>
        </div>
      </section>

      {/* Projects & Impact */}
      <section id="projects" className="py-20 px-4" style={{ backgroundColor: brandColors.light }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12"><Target className="w-12 h-12 mx-auto mb-4" style={{ color: brandColors.primary }} /><h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brandColors.primary }}>Our Projects & Impact</h2></div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">{[{ value: '0000', label: 'Children Reached' }, { value: '00', label: 'Communities Served' }, { value: '0000', label: 'Trees Planted' }, { value: '000', label: 'Teachers Trained' }, { value: '00', label: 'Schools Partnered' }].map((stat, idx) => (<div key={idx} className="bg-white rounded-xl p-4 text-center shadow"><div className="text-2xl font-bold" style={{ color: brandColors.primary }}>{stat.value}</div><div className="text-sm text-gray-500">{stat.label}</div></div>))}</div>
          <div className="bg-white rounded-2xl p-8 shadow-lg text-center"><h3 className="text-xl font-bold mb-2">Upington Community Project</h3><p className="text-gray-600 mb-4">Location: Northern Cape, South Africa</p><button className="px-6 py-2 rounded-lg text-white" style={{ backgroundColor: brandColors.primary }}>READ MORE →</button></div>
        </div>
      </section>

      {/* Get Involved - Donation Section (Updated with NPO-style) */}
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
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
            <div><h4 className="text-white font-semibold mb-4">Quick Links</h4><ul className="space-y-2 text-sm"><li><button onClick={() => scrollToSection('#home')} className="text-gray-400 hover:text-white">Home</button></li><li><button onClick={() => scrollToSection('#vision-mission')} className="text-gray-400 hover:text-white">Vision & Mission</button></li><li><button onClick={() => scrollToSection('#programmes')} className="text-gray-400 hover:text-white">Programmes</button></li></ul></div>
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
