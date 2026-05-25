'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import UserProfile from '../../components/UserProfile';
import AdminPaymentStatus from '../components/PaymentStatusView';
import { useRouter } from 'next/navigation';
import FormViewer from '../../components/FormViewer';
import { getFormData } from '../../components/getFormData';
import AdminAgentPerformanceReport from '../components/reports/AgentPerformance';
import AdminClientGrowthChart from '../components/charts/AdminClientGrowth';
import AgentRankingChart from '../components/charts/AgentRanking';
import CompletionProgressChart from '../components/charts/CompletionProgress';
import PaymentSuccessRateChart from '../components/charts/PaymentSuccessRate';

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [adminId, setAdminId] = useState('');
  const [activeSection, setActiveSection] = useState('stats');
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    revenue: 0,
    profit: 0,
    paidToDate: 0,
    abandonedPayments: 0,
    clientsSignedUp: 0,
  });

  // Agents
  const [agents, setAgents] = useState([]);
  const [searchAgent, setSearchAgent] = useState('');
  const [completionRatios, setCompletionRatios] = useState({});

  // Invite Agent Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  // Clients
  const [searchClient, setSearchClient] = useState('');
  const [clients, setClients] = useState([]);
  const [showClientResults, setShowClientResults] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedForm, setSelectedForm] = useState('');
  const [formData, setFormData] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [unlockRequests, setUnlockRequests] = useState([]);

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { data: adminData } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', user.id)
      .single();
    
    setAdminId(adminData?.id || '');
    await loadStats(adminData?.id);
    await loadAgents(adminData?.id);
    await fetchUnlockRequests();
    setLoading(false);
  };

  const loadStats = async (id: string) => {
    const { data: clientsData } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'client')
      .eq('admin_id', id);
    
    const paidClients = clientsData?.filter(c => c.has_paid === true) || [];
    const abandoned = clientsData?.filter(c => c.has_paid === false) || [];
    const revenue = paidClients.length * 400;
    
    setStats({
      revenue: revenue,
      profit: revenue * 0.5,
      paidToDate: revenue * 0.3,
      abandonedPayments: abandoned.length,
      clientsSignedUp: clientsData?.length || 0,
    });
  };

  const loadAgents = async (id: string) => {
    const { data: agentsData } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'agent')
      .eq('admin_id', id);
    
    setAgents(agentsData || []);
    
    const ratios = {};
    for (const agent of (agentsData || [])) {
      const { data: agentClients } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'client')
        .eq('agent_id', agent.id);
      
      const { data: completedForms } = await supabase
        .from('generated_forms')
        .select('user_id')
        .in('user_id', agentClients?.map(c => c.id) || [])
        .eq('is_locked', true);
      
      const uniqueCompleted = new Set(completedForms?.map(f => f.user_id)).size;
      const ratio = agentClients?.length > 0 ? (uniqueCompleted / agentClients.length) * 100 : 0;
      ratios[agent.id] = Math.round(ratio);
    }
    setCompletionRatios(ratios);
  };

  const handleClientSearch = async () => {
    if (!searchClient.trim()) return;
    setLoading(true);
    
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'client')
      .eq('admin_id', adminId)
      .ilike('email', `%${searchClient}%`);
    
    setClients(data || []);
    setShowClientResults(true);
    setLoading(false);
  };

  const handleShowAllClients = async () => {
    setLoading(true);
    
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'client')
      .eq('admin_id', adminId);
    
    setClients(data || []);
    setShowClientResults(true);
    setLoading(false);
  };

  const handleClearClientSearch = () => {
    setSearchClient('');
    setClients([]);
    setShowClientResults(false);
    setSelectedClient(null);
    setFormData(null);
    setShowFormModal(false);
  };

  const handleViewForm = async (client: any, formNumber: string) => {
    setSelectedClient(client);
    setSelectedForm(formNumber);
    const formNum = parseInt(formNumber);
    let data = null;
    
    if (formNum === 1) {
      const { data: form01 } = await supabase
        .from('form01_data')
        .select('*')
        .eq('user_id', client.id)
        .single();
      data = form01;
    } else {
      data = await getFormData(client.id, formNum);
    }
    
    setFormData(data);
    setShowFormModal(true);
  };

  const handleUpdateRequest = async (requestId: string, status: string) => {
    const adminNotes = status === 'declined' ? prompt('Please provide a reason for declining:') : '';
    if (status === 'declined' && !adminNotes) return;
    
    try {
      const response = await fetch('/api/admin/unlock-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status, adminNotes }),
      });
      
      if (response.ok) {
        alert(`Request ${status} successfully. Agent has been notified.`);
        fetchUnlockRequests();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update request');
      }
    } catch (error) {
      alert('Error updating request');
    }
  };

  const fetchUnlockRequests = async () => {
    const { data: requests } = await supabase
      .from('unlock_requests')
      .select('*, users!unlock_requests_requested_by_fkey(email, fn_t1, srn_t1)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    const formatted = requests?.map(req => ({
      ...req,
      client_email: req.users?.email,
    })) || [];
    
  };

  const handleInviteAgent = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    try {
      const response = await fetch('/api/admin/invite-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      });
      if (response.ok) {
        setInviteEmail('');
        setShowInviteModal(false);
        loadAgents(adminId);
        alert('Invitation sent successfully');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to send invitation');
      }
    } catch (error) {
      alert('Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const filteredAgents = agents.filter(agent =>
    agent.email.toLowerCase().includes(searchAgent.toLowerCase())
  );

  const navItems = [
    { id: 'paymentStatus', name: '💰 Payment Status' },
    { id: 'unlockRequests', name: '🔓 Unlock Requests' },
    { id: 'stats', name: '📊 Dashboard Stats' },
    { id: 'agents', name: '👥 Agents' },
    { id: 'clients', name: '👤 Clients' },
    { id: 'reports', name: '📊 Agent Performance' },
  ];

  if (loading) {
    return <div className="p-8">Loading admin dashboard...</div>;
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
              className={`w-full text-left px-4 py-2 rounded-lg mb-1 ${
                activeSection === item.id ? 'bg-blue-600' : 'hover:bg-gray-800'
              }`}
            >
              {item.name}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }}
            className="w-full text-left px-4 py-2 rounded-lg text-red-400 hover:bg-gray-800"
          >
            🚪 Sign Out
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {/* Stats Section with Charts */}
        {activeSection === 'stats' && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-4 text-white">
                <p className="text-sm opacity-90">Revenue</p>
                <p className="text-2xl font-bold">R{stats.revenue.toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-4 text-white">
                <p className="text-sm opacity-90">Profit (50%)</p>
                <p className="text-2xl font-bold">R{stats.profit.toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow p-4 text-white">
                <p className="text-sm opacity-90">Paid to Date</p>
                <p className="text-2xl font-bold">R{stats.paidToDate.toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow p-4 text-white">
                <p className="text-sm opacity-90">Abandoned</p>
                <p className="text-2xl font-bold">{stats.abandonedPayments}</p>
              </div>
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow p-4 text-white">
                <p className="text-sm opacity-90">Signed Up</p>
                <p className="text-2xl font-bold">{stats.clientsSignedUp}</p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AdminClientGrowthChart />
              <AgentRankingChart />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <CompletionProgressChart />
              <PaymentSuccessRateChart />
            </div>
          </div>
        )}

        {/* Agents Section */}
        {activeSection === 'agents' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Agents Management</h1>
              <button
                onClick={() => setShowInviteModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                + Invite Agent
              </button>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <input
                type="text"
                placeholder="Search agents by email..."
                value={searchAgent}
                onChange={(e) => setSearchAgent(e.target.value)}
                className="w-full p-2 border rounded mb-4"
              />
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2 text-left">Email</th>
                      <th className="p-2 text-left">Payment Status</th>
                      <th className="p-2 text-left">Payment</th>
                      <th className="p-2 text-left">Clients</th>
                      <th className="p-2 text-left">Completion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAgents.map(agent => (
                      <tr key={agent.id} className="border-t">
                        <td className="p-2">{agent.email}</td>
                        <td className="p-2">0</td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div className="bg-green-600 rounded-full h-2" style={{ width: `${completionRatios[agent.id] || 0}%` }} />
                            </div>
                            <span className="text-sm">{completionRatios[agent.id] || 0}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Clients Section */}
        {activeSection === 'clients' && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Clients Management</h1>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Search by email..."
                  value={searchClient}
                  onChange={(e) => setSearchClient(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleClientSearch()}
                  className="flex-1 p-2 border rounded"
                />
                <button onClick={handleClientSearch} className="bg-blue-600 text-white px-4 py-2 rounded">Search</button>
                <button onClick={handleShowAllClients} className="bg-gray-600 text-white px-4 py-2 rounded">Show All Clients</button>
                {showClientResults && <button onClick={handleClearClientSearch} className="bg-yellow-600 text-white px-4 py-2 rounded">Clear</button>}
              </div>
              {showClientResults && (
                <>
                  {clients.length === 0 ? (
                    <div className="bg-yellow-50 p-4 rounded text-center">No clients found</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="p-2 text-left">Email</th>
                      <th className="p-2 text-left">Payment Status</th>
                      <th className="p-2 text-left">Payment</th>
                            <th className="p-2 text-left">Form</th>
                            <th className="p-2 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {clients.map((client) => (
                            <tr key={client.id} className="border-t">
                              <td className="p-2">{client.email}</td>
                      <td className="p-2">
                          {client.has_paid ? (
                            <span className="text-green-600">✅ Paid</span>
                          ) : (
                            <span className="text-yellow-600">⏳ Pending</span>
                          )}
                        </td>
                      <td className="p-2">
                          {client.has_paid ? (
                            <span className="text-green-600">✅ Paid</span>
                          ) : (
                            <span className="text-yellow-600">⏳ Pending</span>
                          )}
                        </td>
                              <td className="p-2">
                                <select onChange={(e) => setSelectedForm(e.target.value)} className="p-1 border rounded text-sm" defaultValue="">
                                  <option value="" disabled>Select Form</option>
                                  {[...Array(17)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>Form {(i + 1).toString().padStart(2, '0')}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="p-2">
                                <button onClick={() => handleViewForm(client, selectedForm || '1')} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">View Form</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
              {!showClientResults && (
                <div className="bg-gray-50 p-8 rounded text-center text-gray-500">🔍 Enter an email and click Search, or click Show All Clients</div>
              )}
            </div>
          </div>
        )}

        {/* Reports Section */}
        {activeSection === 'reports' && <AdminAgentPerformanceReport />}
        {activeSection === 'paymentStatus' && <AdminPaymentStatus />}
        {activeSection === 'unlockRequests' && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Unlock Requests</h1>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Client</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Form</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Reason</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Requested</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unlockRequests.map((req) => (
                      <tr key={req.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{req.client_email || req.client_id}</td>
                        <td className="px-4 py-3 text-sm">Form {req.form_number}</td>
                        <td className="px-4 py-3 text-sm max-w-xs truncate">{req.reason}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            req.status === 'approved' ? 'bg-green-100 text-green-800' :
                            req.status === 'declined' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {req.status || 'pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{new Date(req.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          {req.status === 'pending' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdateRequest(req.id, 'approved')}
                                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleUpdateRequest(req.id, 'declined')}
                                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                              >
                                Decline
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Invite Agent Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">Invite New Agent</h2>
              <button onClick={() => setShowInviteModal(false)} className="text-gray-500 text-2xl">&times;</button>
            </div>
            <div className="p-4">
              <input
                type="email"
                placeholder="agent@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full p-2 border rounded mb-4"
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowInviteModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button onClick={handleInviteAgent} disabled={inviting} className="px-4 py-2 bg-blue-600 text-white rounded">
                  {inviting ? 'Inviting...' : 'Send Invitation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form View Modal */}
      {showFormModal && formData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold">Form {selectedForm} - {selectedClient?.email}</h2>
              <button onClick={() => setShowFormModal(false)} className="text-gray-500 text-2xl">&times;</button>
            </div>
            <div className="p-4">
              <FormViewer formData={formData} formNumber={selectedForm} clientEmail={selectedClient?.email} showEditButton={true} showAddField={false} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
