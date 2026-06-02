'use client';

import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MapPin, Send } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useState } from 'react';

export default function ContactPage() {
  const brandColors = {
    primary: '#D54022',
    lightBg: '#F6F1E8',
    white: '#FFFFFF'
  };

  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: brandColors.lightBg }}>
      <Navbar />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6" style={{ color: brandColors.primary }}>
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h1 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: brandColors.primary }}>Get In Touch</h1>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 mt-1 flex-shrink-0" style={{ color: brandColors.primary }} />
                  <div><h3 className="font-semibold mb-1">Address</h3><p className="text-gray-600">Pretoria, South Africa</p></div>
                </div>
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 mt-1 flex-shrink-0" style={{ color: brandColors.primary }} />
                  <div><h3 className="font-semibold mb-1">Email</h3><a href="mailto:joey@techfuse.co.za" className="text-gray-600 hover:text-primary">joey@techfuse.co.za</a></div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 mt-1 flex-shrink-0" style={{ color: brandColors.primary }} />
                  <div><h3 className="font-semibold mb-1">Phone</h3><a href="tel:+27878217338" className="text-gray-600 hover:text-primary">+27 87 821 7338</a></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-6" style={{ color: brandColors.primary }}>Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Your Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 border rounded-lg" style={{ backgroundColor: brandColors.white }} required />
                <input type="email" placeholder="Your Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full p-3 border rounded-lg" required />
                <textarea placeholder="Your Message" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={5} className="w-full p-3 border rounded-lg" required />
                <button type="submit" disabled={formStatus === 'sending'} className="w-full text-white py-3 rounded-lg transition hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: brandColors.primary }}>
                  <Send className="w-4 h-4 inline mr-2" />
                  {formStatus === 'sending' ? 'Sending...' : 'Send Message'}
                </button>
                {formStatus === 'success' && <p className="text-green-600 text-center">Message sent successfully!</p>}
                {formStatus === 'error' && <p className="text-red-600 text-center">Failed to send. Please try again.</p>}
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
