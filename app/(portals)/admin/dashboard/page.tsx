'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import FormViewer from '../../components/FormViewer';
import { getFormData } from '../../components/getFormData';
import AdminAgentPerformanceReport from '../components/reports/AgentPerformance';
import AdminClientGrowthChart from '../components/charts/AdminClientGrowth';
import AgentRankingChart from '../components/charts/AgentRanking';
import CompletionProgressChart from '../components/charts/CompletionProgress';
import PaymentSuccessRateChart from '../components/charts/PaymentSuccessRate';
import UserProfile from '../../components/UserProfile';
import AgentManagement from "../components/AgentManagement";
import AdminPaymentStatus from '../components/PaymentStatusView';

interface Agent {
  id: string;
  email: string;
  admin_id: string;
  created_at: string;
}

interface Client {
  id: string;
  email: string;
  admin_id: string;
  has_paid: boolean;
  created_at: string;
}

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
  const [agents, setAgents] = useState<Agent[]>([]);
  const [searchAgent, setSearchAgent] = useState('');
  const [completionRatios, setCompletionRatios] = useState<Record<string, number>>({});

  // Invite Agent Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  // Clients
  const [searchClient, setSearchClient] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [showClientResults, setShowClientResults] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedForm, setSelectedForm] = useState('');
  const [formData, setFormData] = useState<any>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [unlockRequests, setUnlockRequests] = useState<any[]>([]);

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
    
    setAgents((agentsData || []) as Agent[]);
    
    const ratios: Record<string, number> = {};
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
      const ratio = agentClients && agentClients.length > 0 ? (uniqueCompleted / agentClients.length) * 100 : 0;
      ratios[agent.id] = Math.round(ratio);
    }
    setCompletionRatios(ratios);
  };

  const fetchUnlockRequests = async () => {
    const { data: requests } = await supabase
      .from('unlock_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    setUnlockRequests(requests || []);
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

  const navItems = [
    { id: 'stats', name: '📊 Dashboard Stats' },
    { id: 'agents', name: '👥 Agents' },
    { id: 'clients', name: '👤 Clients' },
    { id: 'paymentStatus', name: '💰 Payment Status' },
  ];

  if (loading) {
    return <div className="p-8">Loading admin dashboard...</div>;
  }

  // Simplified return - not showing full JSX for brevity
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
        <UserProfile />
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
        {activeSection === 'stats' && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
          </div>
        )}
        {activeSection === 'agents' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Agents Management</h1>
              <button onClick={() => setShowInviteModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg">+ Invite Agent</button>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <input type="text" placeholder="Search agents..." value={searchAgent} onChange={(e) => setSearchAgent(e.target.value)} className="w-full p-2 border rounded mb-4" />
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">…
<th className="p-2 text-left">Email</th><th className="p-2 text-left">Clients</th><th className="p-2 text-left">Completion</th></thead>
                  <tbody>
                    {agents.filter(a => a.email.toLowerCase().includes(searchAgent.toLowerCase())).map(agent => (
                      <tr key={agent.id} className="border-t">
                        <td className="p-2">{agent.email}</td>
                        <td className="p-2">0</td>
                        <td className="p-2"><div className="flex items-center gap-2"><div className="w-24 bg-gray-200 rounded-full h-2"><div className="bg-green-600 rounded-full h-2" style={{ width: `${completionRatios[agent.id] || 0}%` }} /></div><span>{completionRatios[agent.id] || 0}%</span></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {activeSection === 'clients' && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Clients</h1>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex gap-2 mb-4">
                <input type="text" placeholder="Search by email..." value={searchClient} onChange={(e) => setSearchClient(e.target.value)} className="flex-1 p-2 border rounded" />
                <button onClick={async () => {
                  const { data } = await supabase.from('users').select('*').eq('role', 'client').eq('admin_id', adminId).ilike('email', `%${searchClient}%`);
                  setClients(data || []);
                  setShowClientResults(true);
                }} className="bg-blue-600 text-white px-4 py-2 rounded">Search</button>
                <button onClick={async () => {
                  const { data } = await supabase.from('users').select('*').eq('role', 'client').eq('admin_id', adminId);
                  setClients(data || []);
                  setShowClientResults(true);
                }} className="bg-gray-600 text-white px-4 py-2 rounded">Show All</button>
                {showClientResults && <button onClick={() => { setSearchClient(''); setClients([]); setShowClientResults(false); }} className="bg-yellow-600 text-white px-4 py-2 rounded">Clear</button>}
              </div>
              {showClientResults && clients.length === 0 && <div className="text-center p-4">No clients found</div>}
              {showClientResults && clients.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full"><thead className="bg-gray-50">…
<th className="p-2">Email</th><th className="p-2">Form</th><th className="p-2">Actions</th></thead>
                    <tbody>{clients.map(client => (
                      <tr key={client.id} className="border-t">
                        <td className="p-2">{client.email}</td>
                        <td className="p-2"><select onChange={(e) => setSelectedForm(e.target.value)} className="p-1 border rounded text-sm" defaultValue=""><option disabled>Select Form</option>{[...Array(17)].map((_, i) => <option key={i+1} value={i+1}>Form {(i+1).toString().padStart(2,'0')}</option>)}</select></td>
                        <td className="p-2"><button onClick={async () => {
                          const formNum = parseInt(selectedForm || '1');
                          let data;
                          if (formNum === 1) {
                            const { data: d } = await supabase.from('form01_data').select('*').eq('user_id', client.id).single();
                            data = d;
                          } else {
                            data = await getFormData(client.id, formNum);
                          }
                          setFormData(data);
                          setShowFormModal(true);
                        }} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">View</button></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
        {activeSection === 'paymentStatus' && <AdminPaymentStatus />}
      </div>
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b"><h2 className="text-xl font-bold">Invite Agent</h2><button onClick={() => setShowInviteModal(false)} className="text-gray-500 text-2xl">&times;</button></div>
            <div className="p-4">
              <input type="email" placeholder="agent@example.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="w-full p-2 border rounded mb-4" />
              <div className="flex justify-end gap-2"><button onClick={() => setShowInviteModal(false)} className="px-4 py-2 border rounded">Cancel</button><button onClick={handleInviteAgent} disabled={inviting} className="px-4 py-2 bg-blue-600 text-white rounded">{inviting ? 'Inviting...' : 'Send'}</button></div>
            </div>
          </div>
        </div>
      )}
      {showFormModal && formData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b"><h2>Form {selectedForm}</h2><button onClick={() => setShowFormModal(false)} className="text-gray-500 text-2xl">&times;</button></div>
            <div className="p-4"><FormViewer formData={formData} formNumber={selectedForm} clientEmail={selectedClient?.email || ''} showEditButton={true} showAddField={false} /></div>
          </div>
        </div>
      )}
    </div>
  );
}
