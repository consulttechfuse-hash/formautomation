'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
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
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState('');
  const [agents, setAgents] = useState<AgentStats[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('agents');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setAdminEmail(user.email || '');

    // Get all agents under this admin
    const { data: agentsData } = await supabase
      .from('user_roles')
      .select('*')
      .eq('role', 'agent')
      .eq('invited_by', user.id)
      .order('created_at', { ascending: false });

    if (agentsData) {
      const agentsWithStats = await Promise.all(agentsData.map(async (agent) => {
        // Get clients assigned to this agent
        const { data: clients } = await supabase
          .from('user_roles')
          .select('*')
          .eq('role', 'client')
          .eq('assigned_admin_id', agent.user_id);

        const clientIds = clients?.map(c => c.user_id) || [];

        // Get form completion stats
        let formsCompleted = 0;
        let formsSubmitted = 0;

        for (const clientId of clientIds) {
          const { data: form01 } = await supabase
            .from('form01_data')
            .select('onboarding_submitted')
            .eq('user_id', clientId)
            .single();

          if (form01?.onboarding_submitted) {
            formsSubmitted++;
            formsCompleted++;
          }
        }

        return {
          id: agent.id,
          email: agent.email,
          user_id: agent.user_id,
          invite_sent_at: agent.invite_sent_at,
          invite_accepted_at: agent.invite_accepted_at,
          last_login_at: agent.last_login_at,
          client_count: clients?.length || 0,
          forms_completed: formsCompleted,
          forms_submitted: formsSubmitted,
          forms_pending: (clients?.length || 0) - formsSubmitted
        };
      }));

      setAgents(agentsWithStats);
    }

    setLoading(false);
  };

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

  // Chart data
  const clientDistributionData = agents.map(agent => ({
    name: agent.email.split('@')[0],
    clients: agent.client_count
  }));

  const formCompletionData = agents.map(agent => ({
    name: agent.email.split('@')[0],
    completed: agent.forms_completed,
    pending: agent.forms_pending
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec489a'];

  if (loading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">{adminEmail}</span>
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

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('agents')}
                className={`px-4 py-3 font-medium transition-colors ${
                  activeTab === 'agents'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                👥 Agents ({agents.length})
              </button>
              <button
                onClick={() => setActiveTab('charts')}
                className={`px-4 py-3 font-medium transition-colors ${
                  activeTab === 'charts'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                📊 Charts & Analytics
              </button>
            </div>
          </div>

          {/* Agents Tab */}
          {activeTab === 'agents' && (
            <div className="p-4">
              {agents.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No agents invited yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-3 text-left">Agent Email</th>
                        <th className="p-3 text-left">Status</th>
                        <th className="p-3 text-left">Clients</th>
                        <th className="p-3 text-left">Invite Sent</th>
                        <th className="p-3 text-left">Invite Accepted</th>
                        <th className="p-3 text-left">Last Login</th>
                        <th className="p-3 text-left">Forms Completed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agents.map((agent) => (
                        <tr key={agent.id} className="border-t hover:bg-gray-50">
                          <td className="p-3">{agent.email}</td>
                          <td className="p-3">{getStatusBadge(agent)}</td>
                          <td className="p-3">{agent.client_count}</td>
                          <td className="p-3 text-sm">{formatDate(agent.invite_sent_at)}</td>
                          <td className="p-3 text-sm">{formatDate(agent.invite_accepted_at)}</td>
                          <td className="p-3 text-sm">{formatDate(agent.last_login_at)}</td>
                          <td className="p-3">
                            <div className="flex items-center space-x-1">
                              <span className="text-green-600">{agent.forms_completed}</span>
                              <span className="text-gray-400">/</span>
                              <span className="text-gray-600">{agent.client_count}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Charts Tab */}
          {activeTab === 'charts' && (
            <div className="p-4 space-y-6">
              {/* Client Distribution Chart */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold mb-4">Client Distribution by Agent</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={clientDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="clients" fill="#3b82f6" name="Number of Clients" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Form Completion Chart */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold mb-4">Form Completion by Agent</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={formCompletionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed" fill="#10b981" name="Completed Forms" />
                    <Bar dataKey="pending" fill="#f59e0b" name="Pending Forms" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-blue-600 text-sm">Total Agents</p>
                  <p className="text-2xl font-bold text-blue-800">{agents.length}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-green-600 text-sm">Total Clients</p>
                  <p className="text-2xl font-bold text-green-800">
                    {agents.reduce((sum, a) => sum + a.client_count, 0)}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-purple-600 text-sm">Active Agents</p>
                  <p className="text-2xl font-bold text-purple-800">
                    {agents.filter(a => a.last_login_at).length}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-orange-600 text-sm">Forms Completed</p>
                  <p className="text-2xl font-bold text-orange-800">
                    {agents.reduce((sum, a) => sum + a.forms_completed, 0)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
