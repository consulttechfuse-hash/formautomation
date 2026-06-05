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
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface AgentStats {
  id: string;
  email: string;
  user_id: string;
  invite_sent_at: string;
  invite_accepted_at: string;
  last_login_at: string;
  client_count: number;
  forms_completed: number;
  forms_submitted: number;
  forms_pending: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [adminId, setAdminId] = useState('');
  const [activeSection, setActiveSection] = useState('stats');
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState('');
  const [agents, setAgents] = useState<AgentStats[]>([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Stats
  const [stats, setStats] = useState({
    revenue: 0,
    profit: 0,
    paidToDate: 0,
    abandonedPayments: 0,
    clientsSignedUp: 0,
  });

  // Agents
  const [agentList, setAgentList] = useState<any[]>([]);
  const [searchAgent, setSearchAgent] = useState('');
  const [completionRatios, setCompletionRatios] = useState<Record<string, number>>({});

  // Invite Agent Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  // Clients
  const [searchClient, setSearchClient] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [showClientResults, setShowClientResults] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
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
    setAdminEmail(user.email || '');
    setAdminId(user.id);
    
    await loadStats(user.id);
    await loadAgents(user.id);
    await loadAgentStats(user.id);
    await fetchUnlockRequests();
    setLoading(false);
  };

  const loadStats = async (id: string) => {
    const { data: clientsData } = await supabase
      .from('user_roles')
      .select('*')
      .eq('role', 'client');
    
    const paidClients = clientsData?.filter(c => c.has_paid === true) || [];
    const abandoned = clientsData?.filter(c => c.has_paid === false) || [];
    const revenue = paidClients.length * 400;
    
    setStats({
      revenue: revenue,
      profit: revenue * 0.5,
      paidToDate: paidClients.length,
      abandonedPayments: abandoned.length,
      clientsSignedUp: clientsData?.length || 0,
    });
  };

  const loadAgents = async (id: string) => {
    const { data: agentsData } = await supabase
      .from('user_roles')
      .select('*')
      .eq('role', 'agent');
    
    setAgentList(agentsData || []);
    
    // Load completion ratios for each agent
    const ratios: Record<string, number> = {};
    for (const agent of (agentsData || [])) {
      const { data: clients } = await supabase
        .from('user_roles')
        .select('onboarding_submitted')
        .eq('assigned_admin_id', agent.user_id);
      
      if (clients && clients.length > 0) {
        const completed = clients.filter(c => c.onboarding_submitted === true).length;
        ratios[agent.user_id] = (completed / clients.length) * 100;
      } else {
        ratios[agent.user_id] = 0;
      }
    }
    setCompletionRatios(ratios);
  };

  const loadAgentStats = async (adminUserId: string) => {
    // Get all agents under this admin
    const { data: agentsData } = await supabase
      .from('user_roles')
      .select('*')
      .eq('role', 'agent')
      .eq('invited_by', adminUserId)
      .order('created_at', { ascending: false });

    if (agentsData) {
      const agentsWithStats: AgentStats[] = await Promise.all(agentsData.map(async (agent) => {
        // Get clients assigned to this agent
        const { data: clients } = await supabase
          .from('user_roles')
          .select('*')
          .eq('role', 'client')
          .eq('assigned_admin_id', agent.user_id);

        // Get form completion stats
        let formsSubmitted = 0;

        for (const client of (clients || [])) {
          const { data: form01 } = await supabase
            .from('form01_data')
            .select('onboarding_submitted')
            .eq('user_id', client.user_id)
            .single();

          if (form01?.onboarding_submitted) {
            formsSubmitted++;
          }
        }

        return {
          id: agent.id,
          email: agent.email,
          user_id: agent.user_id,
          invite_sent_at: agent.invite_sent_at || '',
          invite_accepted_at: agent.invite_accepted_at || '',
          last_login_at: agent.last_login_at || '',
          client_count: clients?.length || 0,
          forms_completed: formsSubmitted,
          forms_submitted: formsSubmitted,
          forms_pending: (clients?.length || 0) - formsSubmitted
        };
      }));

      setAgents(agentsWithStats);
    }
  };

  const fetchUnlockRequests = async () => {
    const { data } = await supabase
      .from('unlock_requests')
      .select('*')
      .eq('status', 'pending');
    setUnlockRequests(data || []);
  };

  const navItems = [
    { id: 'stats', name: '📊 Dashboard Stats' },
    { id: 'agents', name: '👥 Agents' },
    { id: 'agentStats', name: '📈 Agent Performance' },
    { id: 'clients', name: '👤 Clients' },
    { id: 'paymentStatus', name: '💰 Payment Status' },
    { id: 'profile', name: '👤 My Profile' },
  ];

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getStatusBadge = (agent: AgentStats) => {
    if (agent.last_login_at) {
      return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Active</span>;
    }
    if (agent.invite_accepted_at) {
      return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Accepted</span>;
    }
    if (agent.invite_sent_at) {
      return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Invited</span>;
    }
    return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">Pending</span>;
  };

  const clientDistributionData = agents.map(agent => ({
    name: agent.email.split('@')[0],
    clients: agent.client_count
  }));

  const formCompletionData = agents.map(agent => ({
    name: agent.email.split('@')[0],
    completed: agent.forms_completed,
    pending: agent.forms_pending
  }));

  if (loading) {
    return <div className="p-8 text-center">Loading admin dashboard...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">Admin Portal</h1>
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
        
        {/* Profile Section */}
        <div className="border-t border-gray-700 p-4 space-y-3">
          {/* Profile Button */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-full flex items-center justify-between hover:bg-gray-800 transition-colors rounded-lg px-2 py-2"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-sm font-bold">{adminEmail.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium truncate max-w-[150px]">{adminEmail}</p>
                  <p className="text-xs text-gray-400">Admin</p>
                </div>
              </div>
              <svg className={`w-4 h-4 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showProfileMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
                <button
                  onClick={() => {
                    setActiveSection('profile');
                    setShowProfileMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 transition-colors flex items-center space-x-2"
                >
                  <span>⚙️</span>
                  <span>Settings</span>
                </button>
              </div>
            )}
          </div>
          
          {/* Sign Out Button - Always Visible */}
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/login');
            }}
            className="w-full flex items-center space-x-3 px-2 py-2 rounded-lg text-red-400 hover:bg-gray-800 transition-colors"
          >
            <span>🚪</span>
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeSection === 'stats' && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
            
            {/* Stats Cards */}
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

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AdminClientGrowthChart />
              <PaymentSuccessRateChart />
              <AgentRankingChart />
              <CompletionProgressChart />
            </div>
          </div>
        )}
        
        {activeSection === 'agents' && (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold">Agent Management</h2>
      <button
        onClick={() => setShowInviteModal(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        + Invite Agent
      </button>
    </div>
    
    <input
      type="text"
      placeholder="Search agents..."
      value={searchAgent}
      onChange={(e) => setSearchAgent(e.target.value)}
      className="w-full p-2 border rounded mb-4"
    />
    
    {/* Pending Invites Section */}
    <div className="mb-6">
      <h3 className="font-semibold mb-2 text-gray-700">Pending Invites</h3>
      {agentList.filter(a => !a.user_id || !a.accepted_at).length === 0 ? (
        <p className="text-gray-500 text-sm">No pending invites</p>
      ) : (
        <div className="space-y-2">
          {agentList.filter(a => !a.user_id || !a.accepted_at).map(invite => (
            <div key={invite.id} className="flex justify-between items-center border-b pb-2">
              <div>
                <span className="font-medium">{invite.email}</span>
                <p className="text-xs text-gray-500">
                  Expires: {invite.invitation_expires_at ? new Date(invite.invitation_expires_at).toLocaleDateString() : "7 days"}
                </p>
              </div>
              <div className="flex gap-2">
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Pending</span>
                <button
                  onClick={async () => {
                    const response = await fetch("/api/admin/invite-agent", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email: invite.email }),
                    });
                    if (response.ok) {
                      alert("Invitation resent");
                      loadAgents(adminId);
                    }
                  }}
                  className="text-blue-600 hover:text-blue-800 text-xs"
                >
                  Resend
                </button>
                <button
                  onClick={async () => {
                    if (confirm("Cancel invitation for " + invite.email + "?")) {
                      await supabase.from("user_roles").delete().eq("id", invite.id);
                      await supabase.from("users").delete().eq("email", invite.email);
                      loadAgents(adminId);
                      alert("Invitation cancelled");
                    }
                  }}
                  className="text-red-600 hover:text-red-800 text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-2 text-left">Agent</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Clients</th>
            <th className="p-2 text-left">Completion</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {agentList
            .filter(a => a.email && a.email.toLowerCase().includes(searchAgent.toLowerCase()))
            .map(agent => {
              const isActive = agent.user_id && agent.accepted_at;
              const statusText = isActive ? "Active" : (agent.invitation_token ? "Invited" : "Pending");
              const statusColor = isActive ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800";
              return (
                <tr key={agent.id} className="border-t">
                  <td className="p-2">{agent.first_name || agent.last_name ? `${agent.first_name || ""} ${agent.last_name || ""}`.trim() : "-"}</td>
                  <td className="p-2">{agent.email}</td>
                  <td className="p-2"><span className={`px-2 py-1 text-xs rounded-full ${statusColor}`}>{statusText}</span></td>
                  <td className="p-2">-</td>
                  <td className="p-2">{Math.round(completionRatios[agent.user_id] || 0)}%</td>
                  <td className="p-2">
                    {!isActive ? (
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            const response = await fetch("/api/admin/invite-agent", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ email: agent.email }),
                            });
                            if (response.ok) {
                              alert("Invitation resent");
                              loadAgents(adminId);
                            }
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Resend
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm("Delete invite for " + agent.email + "?")) {
                              await supabase.from("user_roles").delete().eq("id", agent.id);
                              await supabase.from("users").delete().eq("email", agent.email);
                              loadAgents(adminId);
                              alert("Invitation deleted");
                            }
                          }}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={async () => {
                          if (confirm("Delete agent " + agent.email + "? This will remove all their data.")) {
                            await supabase.from("user_roles").delete().eq("id", agent.id);
                            await supabase.from("users").delete().eq("email", agent.email);
                            loadAgents(adminId);
                            alert("Agent deleted");
                          }
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  </div>
)},
                    });
                    const result = await response.json();
                    if (response.ok) {
                      alert('Invitation sent successfully');
                      setInviteEmail('');
                      setShowInviteModal(false);
                    } else {
                      alert(result.error);
                    }
                    setInviting(false);
                  }}
                  disabled={inviting}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {inviting ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
