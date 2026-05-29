'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import UnlockRequests from '../components/UnlockRequests';
import PendingPayments from '../components/PendingPayments';

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const router = useRouter();
  const supabase = createClient();

  const navItems = [
    { id: 'overview', name: '📊 Overview' },
    { id: 'unlockRequests', name: '🔓 Unlock Requests' },
    { id: 'pendingPayments', name: '💰 Pending Payments' },
    { id: 'clients', name: '👥 Clients' },
    { id: 'agents', name: '👤 Agents' },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
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
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2 rounded-lg text-red-400 hover:bg-gray-800"
          >
            🚪 Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeSection === 'overview' && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm">Pending Unlock Requests</h3>
                <div className="text-3xl font-bold mt-2">-</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm">Pending Payments</h3>
                <div className="text-3xl font-bold mt-2">-</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm">Active Clients</h3>
                <div className="text-3xl font-bold mt-2">-</div>
              </div>
            </div>
          </div>
        )}
        
        {activeSection === 'unlockRequests' && <UnlockRequests />}
        {activeSection === 'pendingPayments' && <PendingPayments />}
        {activeSection === 'clients' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Client Management</h2>
            <p className="text-gray-500">Client management features coming soon...</p>
          </div>
        )}
        {activeSection === 'agents' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Agent Management</h2>
            <p className="text-gray-500">Agent management features coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}
