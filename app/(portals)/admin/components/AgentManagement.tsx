'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import PresenceBadge from '../../components/PresenceBadge';

interface Agent {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  assigned_admin_id: string;
  created_at: string;
  client_count: number;
}

export default function AgentManagement() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get admin ID
    const { data: adminRole } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('user_id', user.id)
      .single();
    
    const adminId = adminRole?.user_id || user.id;

    // Get all agents under this admin
    const { data: agentsData } = await supabase
      .from('user_roles')
      .select('*')
      .eq('role', 'agent')
      .eq('assigned_admin_id', adminId)
      .order('created_at', { ascending: false });

    if (agentsData) {
      // Get client count for each agent
      const agentsWithCount = await Promise.all(agentsData.map(async (agent) => {
        const { count } = await supabase
          .from('user_roles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'client')
          .eq('assigned_agent_id', agent.user_id);
        
        return {
          user_id: agent.user_id,
          email: agent.email,
          first_name: agent.first_name || '',
          last_name: agent.last_name || '',
          phone_number: agent.phone_number || '',
          assigned_admin_id: agent.assigned_admin_id,
          created_at: agent.created_at,
          client_count: count || 0
        };
      }));
      setAgents(agentsWithCount);
    }
    
    setLoading(false);
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    
    setInviting(true);
    const response = await fetch('/api/admin/invite-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail })
    });

    if (response.ok) {
      setInviteEmail('');
      setShowInviteModal(false);
      await loadAgents();
      alert('Invitation sent successfully');
    } else {
      const error = await response.json();
      alert(error.error || 'Failed to send invitation');
    }
    setInviting(false);
  };

  if (loading) {
    return <div className="text-center py-8">Loading agents...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Invite Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Agent Management</h2>
          <p className="text-sm text-gray-500">Manage agents under your admin account</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          + Invite Agent
        </button>
      </div>

      {/* Agents Table */}
      {agents.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          No agents found. Click "Invite Agent" to add your first agent.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Agent</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Contact</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Clients</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {agents.map((agent) => (
                  <tr key={agent.user_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{agent.first_name || 'N/A'} {agent.last_name || ''}</div>
                      <div className="text-xs text-gray-500">{agent.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">{agent.phone_number || 'No phone'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <PresenceBadge userId={agent.user_id} size="md" showLastSeen={true} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {agent.client_count} clients
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(agent.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Invite New Agent</h3>
            <p className="text-sm text-gray-600 mb-4">
              Send an invitation email to add a new agent to your team.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="agent@example.com"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={inviting || !inviteEmail.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {inviting ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
