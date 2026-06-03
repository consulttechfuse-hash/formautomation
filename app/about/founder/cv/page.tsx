'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CVPage() {
  const brandColors = {
    primary: '#D54022',
    lightBg: '#F6F1E8',
    white: '#FFFFFF',
    dark: '#141414',
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: brandColors.lightBg }}>
      <Navbar />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link href="/about/founder" className="inline-flex items-center gap-2 mb-6" style={{ color: brandColors.primary }}>
            <ArrowLeft className="w-4 h-4" /> Back to Founder
          </Link>

          {/* CV Content */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <style dangerouslySetInnerHTML={{ __html: `
              *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
              :root {
                --red: #D54022;
                --red-dk: #b03318;
                --grey: #888888;
                --dark: #141414;
                --mid: #333333;
                --light: #F5F5F3;
                --border: #E2E2DF;
                --white: #FFFFFF;
              }
              .cv-container {
                font-family: 'DM Sans', sans-serif;
                background: var(--light);
                color: var(--dark);
                font-size: 14px;
                line-height: 1.7;
              }
              .hero {
                display: grid;
                grid-template-columns: 1fr 340px;
                background: var(--dark);
                min-height: 200px;
              }
              .hero-left {
                background: var(--red);
                padding: 52px 60px 48px;
                position: relative;
                overflow: hidden;
              }
              .hero-name {
                font-family: 'Cormorant Garamond', serif;
                font-size: 52px;
                font-weight: 700;
                line-height: 1.05;
                color: var(--white);
                margin-bottom: 18px;
              }
              .hero-title {
                font-size: 13.5px;
                color: rgba(255,255,255,0.78);
                font-weight: 300;
              }
              .hero-right {
                padding: 40px 36px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                gap: 12px;
                border-left: 1px solid rgba(255,255,255,0.07);
              }
              .contact-row {
                display: flex;
                align-items: flex-start;
                gap: 14px;
                font-size: 12.5px;
                color: rgba(255,255,255,0.72);
              }
              .contact-icon {
                width: 26px;
                height: 26px;
                background: rgba(213,64,34,0.3);
                border-radius: 5px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
              }
              .page-inner { max-width: 1160px; margin: 0 auto; padding: 0 36px; }
              .grid { display: grid; grid-template-columns: 1fr 296px; gap: 0; align-items: start; }
              .col-main { padding: 48px 44px 48px 0; border-right: 1px solid var(--border); }
              .col-side { padding: 48px 0 48px 36px; }
              .sec-label {
                font-size: 9.5px;
                letter-spacing: 3.5px;
                text-transform: uppercase;
                color: var(--red);
                font-weight: 600;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                gap: 14px;
              }
              .sec-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }
              .section { margin-bottom: 46px; }
              .summary-body { font-size: 14.5px; color: var(--mid); line-height: 1.8; margin-bottom: 18px; }
              .highlight-box {
                background: var(--red);
                color: var(--white);
                padding: 18px 24px;
                font-size: 13px;
              }
              .comp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
              .comp-card {
                background: var(--white);
                border: 1px solid var(--border);
                border-top: 3px solid var(--red);
                padding: 20px 22px;
              }
              .comp-card h4 { font-size: 10.5px; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 600; margin-bottom: 14px; }
              .comp-card ul { list-style: none; }
              .comp-card li { font-size: 12.5px; color: #555; padding-left: 16px; position: relative; margin-bottom: 6px; }
              .comp-card li::before { content: '—'; position: absolute; left: 0; color: var(--red); }
              .phases { border: 1px solid var(--border); }
              .phase { display: grid; grid-template-columns: 52px 1fr; border-bottom: 1px solid var(--border); }
              .phase-num { background: var(--red); color: white; font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
              .phase-body { padding: 14px 18px; }
              .phase-title { font-size: 12px; font-weight: 600; margin-bottom: 3px; }
              .phase-desc { font-size: 12px; color: #555; }
              .career-item { display: grid; grid-template-columns: 168px 1fr; gap: 0; padding-bottom: 22px; margin-bottom: 22px; border-bottom: 1px solid var(--border); }
              .career-period { font-size: 10.5px; color: var(--red); font-weight: 600; margin-bottom: 5px; text-transform: uppercase; }
              .career-company { font-size: 13px; font-weight: 600; margin-bottom: 3px; }
              .career-role { font-size: 11.5px; color: var(--grey); font-style: italic; }
              .career-detail { font-size: 13px; color: #444; line-height: 1.7; }
              .proj-table { width: 100%; border-collapse: collapse; font-size: 12px; }
              .proj-table thead tr { background: var(--dark); color: white; }
              .proj-table th { padding: 11px 14px; text-align: left; font-size: 10.5px; text-transform: uppercase; }
              .proj-table td { padding: 10px 14px; border-bottom: 1px solid var(--border); color: #444; }
              .proj-table .budget { color: var(--red); font-weight: 600; }
              .side-card { background: white; border: 1px solid var(--border); padding: 22px; margin-bottom: 18px; }
              .side-card-title { font-size: 9.5px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--red); font-weight: 600; padding-bottom: 12px; margin-bottom: 16px; border-bottom: 1px solid var(--border); }
              .brand-card { background: var(--dark); color: white; padding: 28px 24px; margin-bottom: 18px; }
              .brand-logo { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 700; }
              .brand-sub { font-size: 9.5px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-bottom: 20px; padding-bottom: 18px; border-bottom: 1px solid rgba(255,255,255,0.08); }
              .brand-row-label { font-size: 9px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--red); font-weight: 600; margin-bottom: 6px; }
              .brand-row-text { font-size: 12px; color: rgba(255,255,255,0.68); }
              .val-item { display: flex; gap: 11px; margin-bottom: 13px; }
              .val-dot { width: 6px; height: 6px; background: var(--red); border-radius: 50%; flex-shrink: 0; margin-top: 6px; }
              .val-text { font-size: 12.5px; color: #333; }
              .val-name { font-weight: 600; }
              .tags { display: flex; flex-wrap: wrap; gap: 5px; }
              .tag { font-size: 11px; background: var(--light); border: 1px solid var(--border); color: #555; padding: 3px 10px; border-radius: 2px; }
              .video-container {
                position: relative;
                padding-bottom: 56.25%;
                height: 0;
                overflow: hidden;
                max-width: 100%;
                background: #000;
                margin-bottom: 20px;
              }
              .video-container iframe {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border: 0;
              }
              @media (max-width: 768px) {
                .hero { grid-template-columns: 1fr; }
                .hero-right { border-left: none; border-top: 1px solid rgba(255,255,255,0.1); }
                .grid { grid-template-columns: 1fr; }
                .col-main { border-right: none; padding-right: 0; }
                .col-side { padding-left: 0; }
                .career-item { grid-template-columns: 1fr; gap: 8px; }
              }
            ` }} />
            
            <div className="cv-container">
              {/* Hero Section */}
              <div className="hero">
                <div className="hero-left">
                  <div className="hero-name">Jacobus<br />-Joey- Gouws</div>
                  <div className="hero-title">
                    Founder & Director · Techfuse Holdings (Pty) Ltd South Africa<br />
                    35+ Years · Infrastructure · Telecoms · Digital Transformation · Project Finance
                  </div>
                </div>
                <div className="hero-right">
                  <div className="contact-row"><div className="contact-icon">📞</div><div>+27 78 918 5572<br />+27 61 130 6196 · WhatsApp</div></div>
                  <div className="contact-row"><div className="contact-icon">✉</div><div>joey.gouws.j@gmail.com<br />joey@techfuseconsult.online</div></div>
                  <div className="contact-row"><div className="contact-icon">🌐</div><div>https://www.techfuseconsult.online</div></div>
                  <div className="contact-row"><div className="contact-icon">📍</div><div>Pretoria, South Africa</div></div>
                  <div className="contact-row"><div className="contact-icon">🗣</div><div>English &amp; Afrikaans · Full Business</div></div>
                </div>
              </div>

              <div className="page-inner">
                <div className="grid">
                  {/* Main Column */}
                  <div className="col-main">
                    {/* Embedded YouTube Shorts Video */}
                    <div className="section">
                      <div className="sec-label">Introductory Video</div>
                      <div className="video-container">
                        <iframe 
                          src="https://www.youtube.com/embed/aPZamF45VzU" 
                          title="Joey Gouws Intro" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                          referrerPolicy="strict-origin-when-cross-origin" 
                          allowFullScreen>
                        </iframe>
                      </div>
                    </div>

                    {/* Executive Summary */}
                    <div className="section">
                      <div className="sec-label">Executive Summary</div>
                      <p className="summary-body">
                        A results-driven executive with 35+ years of cross-sector experience spanning telecommunications, infrastructure, digital transformation, and international project finance. Proven track record of delivering multi-billion-dollar infrastructure mandates across Sub-Saharan Africa, building high-performance business units from inception to exit, and structuring complex public-private partnerships at board and government level.
                      </p>
                      <div className="highlight-box">
                        <strong>Currently leading:</strong>&nbsp; ZAR 5 Billion infrastructure build &nbsp;·&nbsp; ZAR 997 Million Education Project (South Africa) &nbsp;·&nbsp; ZAR 53 MMt Coal Supply Tender Greenfields Mine Operation
                      </div>
                    </div>

                    {/* Core Competencies */}
                    <div className="section">
                      <div className="sec-label">Core Competencies</div>
                      <div className="comp-grid">
                        <div className="comp-card">
                          <h4>Infrastructure &amp; Finance</h4>
                          <ul><li>GAP Infrastructure Management</li><li>EPC &amp; Procurement (RFQ/RFI/RFC)</li><li>DFI &amp; Instrument Monetization</li><li>Macro-Economic Development</li><li>Cross-Border Corridor Projects</li></ul>
                        </div>
                        <div className="comp-card">
                          <h4>Telecoms &amp; Digital</h4>
                          <ul><li>IMS / EPC / 5G / Blockchain</li><li>Core Network Architecture</li><li>GSM &amp; LCR Market Development</li><li>Fixed-Mobile Convergence</li><li>Smart Cities &amp; IoT</li></ul>
                        </div>
                        <div className="comp-card">
                          <h4>Executive Strategy</h4>
                          <ul><li>OKR / KPI &amp; EXCO Reporting</li><li>Public-Private Partnerships</li><li>Turnaround &amp; Exit Advisory</li><li>AML / FATF / GAAP Compliance</li><li>Board-Level Strategy</li></ul>
                        </div>
                        <div className="comp-card">
                          <h4>Business Development</h4>
                          <ul><li>Market Entry &amp; Expansion (Africa)</li><li>Sales Pipeline &amp; KAM</li><li>Partner Ecosystem Building</li><li>Commodity &amp; Trade (LOI/FCO)</li><li>Funding-Linked BD</li></ul>
                        </div>
                      </div>
                    </div>

                    {/* Career History */}
                    <div className="section">
                      <div className="sec-label">Career History</div>
                      <div className="career-item"><div className="career-meta"><div className="career-period">2015 – Present</div><div className="career-company">Techfuse Holdings</div><div className="career-role">Managing Director</div></div><div className="career-detail">International telecoms advisory, IMS/EPC/5G/blockchain, GAP infrastructure management across energy, mining, housing, agri-culture, and macro-economics.</div></div>
                      <div className="career-item"><div className="career-meta"><div className="career-period">2019 – Present</div><div className="career-company">XConnectSA (Pty) Ltd</div><div className="career-role">Managing Director</div></div><div className="career-detail">Voice core network, billing/SIP, hybrid cloud DC, ISP integration, ERP/CRM/WHMCS, mobility, and service quality management.</div></div>
                      <div className="career-item"><div className="career-meta"><div className="career-period">2010 – 2019</div><div className="career-company">Rain Mobile / XConnect SA</div><div className="career-role">BD Manager → Business Unit Head</div></div><div className="career-detail">Built XConnect SA from zero — full sales pipeline across SA, SADC, and Sub-Sahara. Exited via management buy-out.</div></div>
                      <div className="career-item"><div className="career-meta"><div className="career-period">2008 – 2010</div><div className="career-company">Huawei SA</div><div className="career-role">Product & Sales Mgr → Regional Chief Engineer</div></div><div className="career-detail">Sales strategies for Neotel, Telkom, Vodacom, Unitel. Led Telkom IMS transformation. Tenders up to US$430M.</div></div>
                      <div className="career-item"><div className="career-meta"><div className="career-period">1997 – 2004</div><div className="career-company">Telkom SA</div><div className="career-role">Network Operations Specialist</div></div><div className="career-detail">Switching/Data test platforms, ITU-T/ETSI, RFx, OAM/BMP/TMN. Type approvals: ISDN, POTS, ADSL, Fiber.</div></div>
                      <div className="career-item"><div className="career-meta"><div className="career-period">1989 – 1991</div><div className="career-company">SA Naval Force</div><div className="career-role">Able Seaman / Radar Operator</div></div><div className="career-detail">Seaman training (Saldanha Bay), Radar Operator course (Simon's Town). Served on Minesweeper, Mine Hunter, and Strike Craft.</div></div>
                    </div>

                    {/* Selected Projects */}
                    <div className="section">
                      <div className="sec-label">Selected Project Profile</div>
                      <table className="proj-table">
                        <thead><tr><th>Project</th><th>Role</th><th>Budget</th><th>Outcome</th></tr></thead>
                        <tbody>
                          <tr><td>Telkom Y2K</td><td>Project Lead &amp; Media Liaison</td><td className="budget">$1.025M</td><td>All systems Y2K compliant</td></tr>
                          <tr><td>Telkom ADSL Launch</td><td>Technical Project Engineer</td><td className="budget">$5.42M</td><td>Launched March 2002</td></tr>
                          <tr><td>Unitel ngHLR (Angola)</td><td>Chief Engineer</td><td className="budget">$63M</td><td>RFQ awarded</td></tr>
                          <tr><td>Movicel 3G/4G (Angola)</td><td>Chief Engineer</td><td className="budget">$430M</td><td>RFQ awarded</td></tr>
                          <tr><td>Coal Mining Greenfields (1.2B Mt in-Situ)</td><td>Project Lead</td><td className="budget">TBD</td><td>Develop Debt Funding, Equity Structuring</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="col-side">
                    <div className="brand-card">
                      <div className="brand-logo">Techfuse Holdings</div>
                      <div className="brand-sub">Limited · Seychelles</div>
                      <div className="brand-row"><div className="brand-row-label">Vision</div><div className="brand-row-text">To be the most trusted architect of transformative infrastructure across Africa.</div></div>
                      <div className="brand-row"><div className="brand-row-label">Mission</div><div className="brand-row-text">Bankable, executable, funded solutions — outcomes, not reports.</div></div>
                    </div>

                    <div className="side-card">
                      <div className="side-card-title">Core Values</div>
                      <div className="val-item"><div className="val-dot"></div><div className="val-text"><span className="val-name">Execution Bias</span> — Calculated risk-taking</div></div>
                      <div className="val-item"><div className="val-dot"></div><div className="val-text"><span className="val-name">Constructive Perseverance</span> — Persistent yet sensitive</div></div>
                      <div className="val-item"><div className="val-dot"></div><div className="val-text"><span className="val-name">Opportunity Hunting</span> — Active value creation</div></div>
                      <div className="val-item"><div className="val-dot"></div><div className="val-text"><span className="val-name">Strategic Foresight</span> — Practical KPIs, visionary horizons</div></div>
                    </div>

                    <div className="side-card">
                      <div className="side-card-title">Technical Expertise</div>
                      <div className="tags">
                        <span className="tag">IMS/EPC/5G</span><span className="tag">Blockchain</span><span className="tag">Core Networks</span>
                        <span className="tag">GSM/LCR</span><span className="tag">SIP/VoIP</span><span className="tag">ATM/SDH</span>
                        <span className="tag">ADSL/Fiber</span><span className="tag">SBLC/BG/MTN</span><span className="tag">DFI Structuring</span>
                        <span className="tag">AML/FATF</span><span className="tag">GAAP/EBITDA</span>
                      </div>
                    </div>

                    <div className="side-card">
                      <div className="side-card-title">Education</div>
                      <div className="val-item"><div className="val-dot"></div><div className="val-text"><span className="val-name">IT Engineering Diploma</span> — Hatfield Business School (2005)</div></div>
                      <div className="val-item"><div className="val-dot"></div><div className="val-text"><span className="val-name">Huawei Training</span> — Shenzhen, China (2007)</div></div>
                      <div className="val-item"><div className="val-dot"></div><div className="val-text"><span className="val-name">Telkom SA</span> — Digital Tech · EWSD · Siemens NGN</div></div>
                    </div>

                    <div className="side-card">
                      <div className="side-card-title">Languages &amp; Personal</div>
                      <div className="val-item"><div className="val-dot"></div><div className="val-text">English — Full Business</div></div>
                      <div className="val-item"><div className="val-dot"></div><div className="val-text">Afrikaans — Full Business</div></div>
                      <div className="val-item"><div className="val-dot"></div><div className="val-text">Faith · Fitness · Guitar · Squash · Outdoor X-trailing · Media Content Creation · Global Economics</div></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
