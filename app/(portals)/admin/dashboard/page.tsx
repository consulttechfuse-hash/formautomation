'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import AgentManagement from "../components/AgentManagement";
import AdminPaymentStatus from '../components/PaymentStatusView';
import UserProfile from '../../components/UserProfile';
import EmailLogs from '../../owner/components/EmailLogs';

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [adminId, setAdminId] = useState('');
  const [activeSection, setActiveSection] = useState('stats');
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState('');

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
    setLoading(false);
  };

  const navItems = [
    { id: 'stats', name: '📊 Dashboard Stats' },
    { id: 'paymentStatus', name: '💰 Payment Status' },
    { id: 'agents', name: '👥 Agent Management' },
    { id: 'clients', name: '👤 Client Management' },
    { id: 'clientCommunication', name: '📧 Client Communication' },
    { id: 'profile', name: '👤 My Profile' },
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">Admin Portal</h1>
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
      <div className="flex-1 overflow-auto p-6">
        {activeSection === 'stats' && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-500">Total Revenue</div>
                <div className="text-2xl font-bold">R0</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-500">Paid Clients</div>
                <div className="text-2xl font-bold">0</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-500">Total Clients</div>
                <div className="text-2xl font-bold">0</div>
              </div>
            </div>
          </div>
        )}
        {activeSection === 'paymentStatus' && <AdminPaymentStatus />}
        {activeSection === 'agents' && <AgentManagement />}
        {activeSection === 'clients' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Client Management</h2>
            <p className="text-gray-500">Client management features coming soon.</p>
          </div>
        )}
        {activeSection === 'clientCommunication' && <EmailLogs role="admin" />}
        {activeSection === 'profile' && <UserProfile />}
      </div>
    </div>
  );
}
