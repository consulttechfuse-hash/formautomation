'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import AgentManagement from "../components/AgentManagement";
import AdminPaymentStatus from '../components/PaymentStatusView';
import StatsCards from '../components/StatsCards';
import ClientManagement from '../components/ClientManagement';
import RequestManagement from '../components/RequestManagement';
import StatusToggle from '../components/StatusToggle';
import UserProfile from '../../components/UserProfile';
import EmailLogs from '../../owner/components/EmailLogs';

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [adminId, setAdminId] = useState('');
  const [activeSection, setActiveSection] = useState('stats');
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState('');
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  useEffect(() => {
    checkAuthAndLoad();
    loadPendingRequestsCount();
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

  const loadPendingRequestsCount = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get all pending requests (not filtered by admin for now)
    const { count } = await supabase
      .from('unlock_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    
    setPendingRequestsCount(count || 0);
  };

  const navItems = [
    { id: 'stats', name: '📊 Dashboard Stats', icon: '📊' },
    { id: 'paymentStatus', name: '💰 Payment Status', icon: '💰' },
    { id: 'requests', name: `📋 Client Requests ${pendingRequestsCount > 0 ? `(${pendingRequestsCount})` : ''}`, icon: '📋' },
    { id: 'agents', name: '👥 Agent Management', icon: '👥' },
    { id: 'clients', name: '👤 Client Management', icon: '👤' },
    { id: 'clientCommunication', name: '📧 Client Communication', icon: '📧' },
    { id: 'profile', name: '👤 My Profile', icon: '👤' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col shadow-xl">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Admin Portal
          </h1>
          <p className="text-sm text-gray-400 mt-1">{adminEmail}</p>
        </div>
        
        <div className="px-4 py-3 border-b border-gray-700">
          <p className="text-xs text-gray-400 mb-2">Online Status</p>
          <StatusToggle />
        </div>
        
        <nav className="flex-1 p-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full text-left px-4 py-3 rounded-xl mb-2 transition-all duration-200 flex items-center gap-3 ${
                activeSection === item.id
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/login');
            }}
            className="w-full text-left px-4 py-3 rounded-xl text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors flex items-center gap-3"
          >
            <span className="text-xl">🚪</span>
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        {activeSection === 'stats' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
                <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your clients.</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Last updated</p>
                <p className="text-sm font-medium text-gray-700">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <StatsCards />
          </div>
        )}
        {activeSection === 'paymentStatus' && <AdminPaymentStatus />}
        {activeSection === 'requests' && <RequestManagement />}
        {activeSection === 'agents' && <AgentManagement />}
        {activeSection === 'clients' && <ClientManagement />}
        {activeSection === 'clientCommunication' && <EmailLogs role="admin" />}
        {activeSection === 'profile' && <UserProfile />}
      </div>
    </div>
  );
}
