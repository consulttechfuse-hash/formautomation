'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import AgentManagement from "../components/AgentManagement";
import AdminPaymentStatus from '../components/PaymentStatusView';
import UserProfile from '../../components/UserProfile';
import AdminClientGrowthChart from '../components/charts/AdminClientGrowth';
import AgentRankingChart from '../components/charts/AgentRanking';
import CompletionProgressChart from '../components/charts/CompletionProgress';
import PaymentSuccessRateChart from '../components/charts/PaymentSuccessRate';
import AdminAgentPerformanceReport from '../components/reports/AgentPerformance';

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [activeSection, setActiveSection] = useState('stats');
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminId, setAdminId] = useState('');
  const [stats, setStats] = useState({
    revenue: 0,
    profit: 0,
    paidToDate: 0,
    clientsSignedUp: 0,
  });

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setAdminEmail(user.email || '');
    setAdminId(user.id);

    const { data: clientsData } = await supabase
      .from('user_roles')
      .select('*')
      .eq('role', 'client');
    
    const paidClients = clientsData?.filter(c => c.has_paid === true) || [];
    const revenue = paidClients.length * 400;
    
    setStats({
      revenue: revenue,
      profit: revenue * 0.5,
      paidToDate: paidClients.length,
      clientsSignedUp: clientsData?.length || 0,
    });
    
    setLoading(false);
  };

  const navItems = [
    { id: 'stats', name: '📊 Dashboard Stats' },
    { id: 'agents', name: '👥 Agent Management' },
    { id: 'clients', name: '👤 Clients' },
    { id: 'paymentStatus', name: '💰 Payment Status' },
    { id: 'reports', name: '📈 Reports' },
    { id: 'profile', name: '👤 My Profile' },
  ];

  if (loading) {
    return <div className="p-8 text-center">Loading admin dashboard...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">Admin Portal</h1>
          <p className="text-sm text-gray-400 truncate">{adminEmail}</p>
        </div>
        <nav className="flex-1 p-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full text-left px-4 py-2 rounded-lg mb-1 transition-colors ${
                activeSection === item.id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
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

      <div className="flex-1 overflow-auto p-6">
        {activeSection === 'stats' && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-lg shadow p-6 text-white">
                <h3 className="text-sm opacity-90">Total Revenue</h3>
                <div className="text-3xl font-bold mt-2">R{stats.revenue.toLocaleString()}</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg shadow p-6 text-white">
                <h3 className="text-sm opacity-90">Your Profit (50%)</h3>
                <div className="text-3xl font-bold mt-2">R{stats.profit.toLocaleString()}</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg shadow p-6 text-white">
                <h3 className="text-sm opacity-90">Paid Clients</h3>
                <div className="text-3xl font-bold mt-2">{stats.paidToDate}</div>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-lg shadow p-6 text-white">
                <h3 className="text-sm opacity-90">Total Signups</h3>
                <div className="text-3xl font-bold mt-2">{stats.clientsSignedUp}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AdminClientGrowthChart adminId={adminId} />
              <PaymentSuccessRateChart adminId={adminId} />
              <AgentRankingChart adminId={adminId} />
              <CompletionProgressChart adminId={adminId} />
            </div>
          </div>
        )}
        
        {activeSection === 'agents' && <AgentManagement />}
        
        {activeSection === 'clients' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Client Management</h2>
            <p className="text-gray-500">Client management features coming soon...</p>
          </div>
        )}
        
        {activeSection === 'paymentStatus' && <AdminPaymentStatus adminId={adminId} />}
        
        {activeSection === 'reports' && <AdminAgentPerformanceReport adminId={adminId} />}
        
        {activeSection === 'profile' && <UserProfile userId={adminId} />}
      </div>
    </div>
  );
}
