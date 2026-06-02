'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  const brandColors = {
    primary: '#D54022',
    section: '#888888',
    white: '#FFFFFF',
  };

  return (
    <footer className="text-white py-12 mt-12" style={{ backgroundColor: brandColors.section }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Column 1 */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Image src="/logo.png" alt="Logo" width={32} height={32} />
              <span className="font-bold text-white">Techfuse Holdings</span>
            </div>
            <p className="text-sm text-gray-300">From Feasibility to Funding to First Revenue.</p>
            <p className="text-xs text-gray-400 mt-4">© 2026 Techfuse Holdings Limited</p>
          </div>

          {/* Column 2 - Consulting */}
          <div>
            <h4 className="font-semibold text-white mb-3">Consulting</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/servicesconsult" className="text-gray-300 hover:text-white">Infrastructure Gap Management</Link></li>
              <li><Link href="/servicesconsult" className="text-gray-300 hover:text-white">Project Funding & Modelling</Link></li>
              <li><Link href="/servicesconsult" className="text-gray-300 hover:text-white">Digital Transformation</Link></li>
              <li><Link href="/servicesconsult" className="text-gray-300 hover:text-white">EPC & Procurement</Link></li>
            </ul>
          </div>

          {/* Column 3 - Advisory */}
          <div>
            <h4 className="font-semibold text-white mb-3">Advisory</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/servicesadvisory" className="text-gray-300 hover:text-white">Board & Executive Strategy</Link></li>
              <li><Link href="/servicesadvisory" className="text-gray-300 hover:text-white">Project Governance</Link></li>
              <li><Link href="/servicesadvisory" className="text-gray-300 hover:text-white">Due Diligence & Compliance</Link></li>
              <li><Link href="/servicesadvisory" className="text-gray-300 hover:text-white">PPPs & Turnaround</Link></li>
            </ul>
          </div>

          {/* Column 4 - Contact */}
          <div>
            <h4 className="font-semibold text-white mb-3">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="mailto:joey@techfuse.co.za" className="text-gray-300 hover:text-white">joey@techfuse.co.za</a></li>
              <li><a href="tel:+27878217338" className="text-gray-300 hover:text-white">+27 87 821 7338</a></li>
              <li className="text-gray-300">Pretoria, South Africa</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Techfuse Holdings. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
