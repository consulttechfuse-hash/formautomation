'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import PaymentVerification from '../components/PaymentVerification';
import { useRouter } from 'next/navigation';
import StatsCards from '../components/StatsCards';
import AdminManagement from '../components/AdminManagement';
import RequestsStats from '../components/RequestsStats';
import ClientManagement from '../components/ClientManagement';
import FormManagement from '../components/FormManagement';
import AgentPerformanceReport from '../components/reports/AgentPerformance';
import AdminRevenueReport from '../components/reports/AdminRevenue';
import SystemRevenueReport from '../components/reports/SystemRevenue';
import RevenueTrendChart from '../components/charts/RevenueTrend';
import ClientGrowthChart from '../components/charts/ClientGrowth';
import TopAgentsChart from '../components/charts/TopAgents';
import RevenueByAdminChart from '../components/charts/RevenueByAdmin';
import ConversionGauge from '../components/charts/ConversionGauge';

export default function OwnerDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [activeSection, setActiveSection] = useState('stats');

  const navItems = [
    { id: 'paymentVerification', name: '💰 Payment Verification' },
    { id: 'stats', name: '📊 Dashboard Stats' },
    { id: 'admins', name: '👥 Admin Management' },
    { id: 'requests', name: '📋 Requests' },
    { id: 'clients', name: '👤 Client Management' },
    { id: 'forms', name: '📝 Form Management' },
    { id: 'agentPerformance', name: '📊 Agent Performance' },
    { id: 'adminRevenue', name: '💰 Admin Revenue' },
    { id: 'systemRevenue', name: '🏦 System Revenue' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">Owner Portal</h1>
          <p className="text-sm text-gray-400">Dashboard</p>
        </div>
        <nav className="flex-1 p-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full text-left px-4 py-2 rounded-lg mb-1 transition-colors ${
                activeSection === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              {item.name}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/login');
            }}
            className="w-full text-left px-4 py-2 rounded-lg text-red-400 hover:bg-gray-800"
          >
            🚪 Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeSection === 'stats' && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
            
            {/* Stats Cards */}
            <StatsCards />
            
            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <RevenueTrendChart />
              <ClientGrowthChart />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              <TopAgentsChart />
              <RevenueByAdminChart />
              <ConversionGauge />
            </div>
          </div>
        )}
        
        {activeSection === 'admins' && <AdminManagement />}
        {activeSection === 'requests' && <RequestsStats />}
        {activeSection === 'clients' && <ClientManagement />}
        {activeSection === 'forms' && <FormManagement />}
        {activeSection === 'agentPerformance' && <AgentPerformanceReport />}
        {activeSection === 'adminRevenue' && <AdminRevenueReport />}
        {activeSection === 'systemRevenue' && <SystemRevenueReport />}
        {activeSection === 'paymentVerification' && <PaymentVerification />}
      </div>
    </div>
  );
}
