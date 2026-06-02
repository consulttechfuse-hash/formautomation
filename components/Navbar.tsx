'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ChevronDown } from 'lucide-react';

const brandColors = {
  primary: '#D54022',
  white: '#FFFFFF',
};

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const navItems = [
    {
      name: 'Services',
      dropdown: [
        { name: 'Consulting', path: '/servicesconsult' },
        { name: 'Advisory', path: '/servicesadvisory' },
        { name: 'Business Development', path: '/servicesbizdev' },
      ]
    },
    {
      name: 'Projects',
      dropdown: [
        { name: 'Mining', path: '/mining' },
        { name: 'Education', path: '/education' },
        { name: 'Infrastructure', path: '/infrastructure' },
      ]
    },
    {
      name: 'About',
      dropdown: [
        { name: 'About Us', path: '/aboutus' },
        { name: 'Vision', path: '/visionpage' },
        { name: 'Mission', path: '/missionpage' },
        { name: 'Founder', path: '/about/founder' },
        { name: 'Contact', path: '/about/contact' },
      ]
    },
    {
      name: 'Foundation',
      dropdown: [
        { name: 'Envirogreen', path: '/envirogreen' },
        { name: 'NPO', path: '/npo' },
      ]
    },
  ];

  const handleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  return (
    <nav className="fixed top-0 w-full z-50 shadow-md" style={{ backgroundColor: brandColors.white }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Slogan Only - No Company Name */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-10 h-10">
              <Image src="/logo.png" alt="TechFuse Consulting Logo" width={40} height={40} className="object-contain" priority />
            </div>
            <span className="text-xs text-gray-500 hidden sm:block">consult.consume</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <div key={item.name} className="relative group">
                <button className="flex items-center space-x-1 text-gray-700 hover:text-primary py-2">
                  <span>{item.name}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute top-full left-0 w-56 bg-white shadow-lg rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  {item.dropdown.map((subItem) => (
                    <Link key={subItem.name} href={subItem.path} className="block px-4 py-2 hover:bg-gray-100">
                      {subItem.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <Link href="/form-automation" className="text-white px-4 py-2 rounded-lg transition hover:opacity-90" style={{ backgroundColor: brandColors.primary }}>
              Form Automation
            </Link>
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-2 space-y-2">
            {navItems.map((item) => (
              <div key={item.name}>
                <button onClick={() => handleDropdown(item.name)} className="flex justify-between items-center w-full py-2 text-gray-700">
                  {item.name}
                  <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === item.name ? 'rotate-180' : ''}`} />
                </button>
                {openDropdown === item.name && (
                  <div className="pl-4 space-y-2">
                    {item.dropdown.map((subItem) => (
                      <Link key={subItem.name} href={subItem.path} className="block py-1 text-gray-600" onClick={() => setMobileMenuOpen(false)}>
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link href="/form-automation" className="block py-2 font-medium" style={{ color: brandColors.primary }} onClick={() => setMobileMenuOpen(false)}>
              Form Automation →
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
