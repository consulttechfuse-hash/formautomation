"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Client {
  id: string;
  user_id: string;
  email: string;
  role: string;
  assigned_admin_id: string;
  has_consented: boolean;
  onboarding_complete: boolean;
  onboarding_submitted: boolean;
  has_paid: boolean;
  created_at: string;
  fn_t1?: string;
  fln_t1?: string;
}

interface UnlockRequest {
  id: string;
  client_id: string;
  client_email: string;
  client_name: string;
  form_number: number;
  reason: string;
  status: string;
  created_at: string;
}

export default function AgentDashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [agentId, setAgentId] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [pendingUnlockRequests, setPendingUnlockRequests] = useState<UnlockRequest[]>([]);
  const [stats, setStats] = useState({
    totalClients: 0,
    completedOnboarding: 0,
    paidClients: 0,
    completionRate: 0
  });
  const [activeTab, setActiveTab] = useState('clients');
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedForm, setSelectedForm] = useState(1);
  const [unlockReason, setUnlockReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAccessAndLoad();
  }, []);

  const checkAccessAndLoad = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) {
      router.push('/login');
      return;
    }
    
    // Check user's role from user_roles table
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role, user_id')
      .eq('user_id', authUser.id)
      .single();
    
    const role = userRole?.role;
    
    // If user is not an agent, redirect to their correct dashboard
    if (role === 'owner') {
      router.push('/owner/dashboard');
      return;
    }
    if (role === 'admin') {
      router.push('/admin/dashboard');
      return;
    }
    if (role === 'client') {
      router.push('/client/dashboard');
      return;
    }
    
    // Only agents should see this page
    if (role !== 'agent') {
      router.push('/unauthorized');
      return;
    }
    
    setUser(authUser);
    setAgentId(authUser.id);
    await loadClients(authUser.id);
    await loadPendingUnlockRequests(authUser.id);
    setLoading(false);
  };

  const loadClients = async (agentUserId: string) => {
    // Load clients assigned to this agent
    const { data: clientsData } = await supabase
      .from('user_roles')
      .select('*')
      .eq('role', 'client')
      .eq('assigned_admin_id', agentUserId)
      .order('created_at', { ascending: false });
    
    // Get additional form01 data for each client
    const clientsWithDetails = await Promise.all((clientsData || []).map(async (client) => {
      const { data: form01 } = await supabase
        .from('form01_data')
        .select('fn_t1, fln_t1')
        .eq('user_id', client.user_id)
        .single();
      
      return {
        ...client,
        fn_t1: form01?.fn_t1 || '',
        fln_t1: form01?.fln_t1 || ''
      };
    }));
    
    setClients(clientsWithDetails);
    
    // Calculate stats
    const completed = clientsWithDetails.filter(c => c.onboarding_submitted === true).length;
    const paid = clientsWithDetails.filter(c => c.has_paid === true).length;
    const rate = clientsWithDetails.length > 0 ? (completed / clientsWithDetails.length) * 100 : 0;
    
    setStats({
      totalClients: clientsWithDetails.length,
      completedOnboarding: completed,
      paidClients: paid,
      completionRate: Math.round(rate)
    });
  };

  const loadPendingUnlockRequests = async (agentUserId: string) => {
    // Get clients assigned to this agent first
    const { data: clientsData } = await supabase
      .from('user_roles')
      .select('user_id, email')
      .eq('role', 'client')
      .eq('assigned_admin_id', agentUserId);
    
    const clientIds = clientsData?.map(c => c.user_id) || [];
    
    if (clientIds.length === 0) {
      setPendingUnlockRequests([]);
      return;
    }
    
    // Get unlock requests for these clients
    const { data: requests } = await supabase
      .from('unlock_requests')
      .select('*')
      .in('client_id', clientIds)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
    
    // Enrich with client names
    const enrichedRequests = await Promise.all((requests || []).map(async (req) => {
      const client = clientsData?.find(c => c.user_id === req.client_id);
      const { data: form01 } = await supabase
        .from('form01_data')
        .select('fn_t1, fln_t1')
        .eq('user_id', req.client_id)
        .single();
      
      return {
        ...req,
        client_email: client?.email || 'Unknown',
        client_name: form01?.fn_t1 ? `${form01.fn_t1} ${form01.fln_t1 || ''}`.trim() : client?.email || 'Unknown'
      };
    }));
    
    setPendingUnlockRequests(enrichedRequests);
  };

  const handleRequestUnlock = async () => {
    if (!selectedClient || !unlockReason) {
      setMessage('Please provide a reason');
      return;
    }
    
    setSubmitting(true);
    setMessage('');
    
    const { error } = await supabase
      .from('unlock_requests')
      .insert({
        client_id: selectedClient.user_id,
        form_number: selectedForm,
        requested_by: user?.id,
        reason: unlockReason,
        status: 'pending'
      });
    
    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('✓ Unlock request submitted');
      setTimeout(() => {
        setShowUnlockModal(false);
        setSelectedClient(null);
        setUnlockReason('');
        loadPendingUnlockRequests(agentId);
      }, 1500);
    }
    
    setSubmitting(false);
  };

  const handleViewClientForm = (clientId: string, formNumber: number) => {
    router.push(`/forms/${formNumber}?clientId=${clientId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Agent Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">{user?.email}</span>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push('/login');
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <p className="text-gray-500 text-sm">Total Clients</p>
            <p className="text-2xl font-bold">{stats.totalClients}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <p className="text-gray-500 text-sm">Completed Onboarding</p>
            <p className="text-2xl font-bold">{stats.completedOnboarding}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
            <p className="text-gray-500 text-sm">Paid Clients</p>
            <p className="text-2xl font-bold">{stats.paidClients}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
            <p className="text-gray-500 text-sm">Completion Rate</p>
            <p className="text-2xl font-bold">{stats.completionRate}%</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('clients')}
                className={`px-4 py-3 font-medium transition-colors ${
                  activeTab === 'clients'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                👥 Assigned Clients ({clients.length})
              </button>
              <button
                onClick={() => setActiveTab('unlocks')}
                className={`px-4 py-3 font-medium transition-colors ${
                  activeTab === 'unlocks'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                🔓 Unlock Requests ({pendingUnlockRequests.length})
              </button>
            </div>
          </div>

          {/* Clients Tab */}
          {activeTab === 'clients' && (
            <div className="p-4">
              {clients.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No clients assigned yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-3 text-left">Client</th>
                        <th className="p-3 text-left">Email</th>
                        <th className="p-3 text-center">Onboarding</th>
                        <th className="p-3 text-center">Payment</th>
                        <th className="p-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clients.map((client) => (
                        <tr key={client.id} className="border-t hover:bg-gray-50">
                          <td className="p-3">
                            {client.fn_t1 || client.fln_t1 
                              ? `${client.fn_t1 || ''} ${client.fln_t1 || ''}`.trim()
                              : '—'}
                          </td>
                          <td className="p-3">{client.email}</td>
                          <td className="p-3 text-center">
                            {client.onboarding_submitted ? (
                              <span className="text-green-600">✓ Complete</span>
                            ) : (
                              <span className="text-yellow-600">Pending</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {client.has_paid ? (
                              <span className="text-green-600">✓ Paid</span>
                            ) : (
                              <span className="text-red-600">Unpaid</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => {
                                setSelectedClient(client);
                                setShowUnlockModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm mr-2"
                            >
                              Request Unlock
                            </button>
                            <button
                              onClick={() => handleViewClientForm(client.user_id, 1)}
                              className="text-gray-600 hover:text-gray-800 text-sm"
                            >
                              View Forms
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Unlock Requests Tab */}
          {activeTab === 'unlocks' && (
            <div className="p-4">
              {pendingUnlockRequests.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No pending unlock requests</p>
              ) : (
                <div className="space-y-4">
                  {pendingUnlockRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4 bg-yellow-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{request.client_name}</p>
                          <p className="text-sm text-gray-600">{request.client_email}</p>
                          <p className="text-sm mt-1">Form {request.form_number}</p>
                          <p className="text-sm text-gray-500 mt-1">Reason: {request.reason}</p>
                        </div>
                        <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs">Pending</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Unlock Request Modal */}
      {showUnlockModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">Request Unlock</h2>
              <button onClick={() => setShowUnlockModal(false)} className="text-gray-500 text-2xl">&times;</button>
            </div>
            <div className="p-4">
              <p className="mb-2">Client: <strong>{selectedClient.fn_t1 || selectedClient.email}</strong></p>
              <label className="block text-sm font-medium mb-1">Form Number</label>
              <select
                value={selectedForm}
                onChange={(e) => setSelectedForm(parseInt(e.target.value))}
                className="w-full border rounded p-2 mb-3"
              >
                {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22].map(n => (
                  <option key={n} value={n}>Form {n}</option>
                ))}
              </select>
              <label className="block text-sm font-medium mb-1">Reason for unlock</label>
              <textarea
                value={unlockReason}
                onChange={(e) => setUnlockReason(e.target.value)}
                className="w-full border rounded p-2 mb-3"
                rows={3}
                placeholder="Please explain why you need this form unlocked..."
              />
              {message && (
                <div className={`p-2 mb-3 rounded text-sm ${message.includes('✓') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {message}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowUnlockModal(false)} className="px-4 py-2 border rounded">
                  Cancel
                </button>
                <button
                  onClick={handleRequestUnlock}
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
