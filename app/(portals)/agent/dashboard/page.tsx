'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import ClientPaymentOverview from '../components/ClientPaymentOverview';
import UnlockRequest from '../components/UnlockRequest';
import EmailLogs from '../components/EmailLogs';

export default function AgentDashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [agentName, setAgentName] = useState('');
  const [activeTab, setActiveTab] = useState('clients');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      router.push('/login');
      return;
    }
    
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role, first_name, last_name')
      .eq('user_id', authUser.id)
      .single();
    
    const role = userRole?.role;
    
    if (role === 'owner') { router.push('/owner/dashboard'); return; }
    if (role === 'admin') { router.push('/admin/dashboard'); return; }
    if (role === 'client') { router.push('/client/dashboard'); return; }
    if (role !== 'agent') { router.push('/unauthorized'); return; }
    
    const fullName = `${userRole?.first_name || ''} ${userRole?.last_name || ''}`.trim();
    setAgentName(fullName || authUser.email?.split('@')[0] || 'Agent');
    setUser(authUser);
    setLoading(false);
  };

  const handleSignOut = async () => {
    // Set presence to offline before signing out
    await fetch('/api/presence/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'offline' })
    }).catch(() => {});
    
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700"><h1 className="text-xl font-bold">Agent Portal</h1><p className="text-sm text-gray-400 truncate">{user?.email}</p></div>
        <nav className="flex-1 p-2">
          <button onClick={() => setActiveTab('clients')} className={`w-full text-left px-4 py-2 rounded-lg mb-1 transition-colors ${activeTab === 'clients' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}>📊 Client Payment Overview</button>
          <button onClick={() => setActiveTab('emails')} className={`w-full text-left px-4 py-2 rounded-lg mb-1 transition-colors ${activeTab === 'emails' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}>📧 Client Communication</button>
          <button onClick={() => setActiveTab('unlock')} className={`w-full text-left px-4 py-2 rounded-lg mb-1 transition-colors ${activeTab === 'unlock' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}>🔓 Unlock Requests</button>
          <button onClick={() => setActiveTab('profile')} className={`w-full text-left px-4 py-2 rounded-lg mb-1 transition-colors ${activeTab === 'profile' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}>👤 My Profile</button>
        </nav>
        <div className="p-4 border-t border-gray-700">
          <div className="mb-3 text-sm text-gray-400 truncate">👋 {agentName}</div>
          <button onClick={handleSignOut} className="w-full text-left px-4 py-2 rounded-lg text-red-400 hover:bg-gray-800">🚪 Sign Out</button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'clients' && <ClientPaymentOverview />}
        {activeTab === 'emails' && <EmailLogs />}
        {activeTab === 'unlock' && <UnlockRequest />}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">My Profile</h2>
            <div><label className="block text-sm font-medium text-gray-700">Name</label><p className="mt-1 text-gray-900">{agentName}</p></div>
            <div className="mt-4"><label className="block text-sm font-medium text-gray-700">Email</label><p className="mt-1 text-gray-900">{user?.email}</p></div>
            <div className="mt-4"><label className="block text-sm font-medium text-gray-700">Role</label><p className="mt-1 text-gray-900">Agent</p></div>
          </div>
        )}
      </div>
    </div>
  );
}
