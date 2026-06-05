'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Agent {
  id: string;
  user_id: string;
  email: string;
  role: string;
  assigned_admin_id: string;
  created_at: string;
  accepted_at: string | null;
  first_name: string;
  last_name: string;
  phone_number: string;
}

interface PendingInvite {
  id: string;
  email: string;
  invitation_token: string;
  invitation_expires_at: string;
  created_at: string;
  role: string;
}

export default function AgentManagement() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const supabase = createClient();

  useEffect(() => {
    loadAgents();
    loadPendingInvites();
  }, []);

  const loadAgents = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('user_roles')
      .select('id, user_id, email, role, assigned_admin_id, created_at, accepted_at, first_name, last_name, phone_number')
      .eq('role', 'agent')
      .eq('assigned_admin_id', user.id)
      .not('user_id', 'is', null);
    
    setAgents(data || []);
  };

  const loadPendingInvites = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('user_roles')
      .select('id, email, invitation_token, invitation_expires_at, created_at, role')
      .eq('role', 'agent')
      .eq('invited_by', user.id)
      .is('user_id', null)
      .is('accepted_at', null)
      .not('invitation_token', 'is', null);
    
    setPendingInvites(data || []);
  };

  const handleInvite = async () => {
    if (!inviteEmail) {
      setMessage('Please enter an email address');
      return;
    }

    setLoading(true);
    setMessage('');

    const response = await fetch('/api/admin/invite-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail }),
    });

    const result = await response.json();

    if (response.ok) {
      setMessage(`✅ Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      setShowInviteModal(false);
      await loadPendingInvites();
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage(`❌ Error: ${result.error}`);
    }
    setLoading(false);
  };

  const handleResendInvite = async (email: string) => {
    setLoading(true);
    const response = await fetch('/api/admin/invite-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (response.ok) {
      setMessage(`✅ Invitation resent to ${email}`);
      await loadPendingInvites();
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage(`❌ Error: ${result.error}`);
    }
    setLoading(false);
  };

  const handleCancelInvite = async (id: string, email: string) => {
    if (!confirm(`Cancel invitation for ${email}?`)) return;
    
    setLoading(true);
    
    // Delete from user_roles
    const { error: roleError } = await supabase
      .from('user_roles')
      .delete()
      .eq('id', id);
    
    if (roleError) {
      setMessage(`❌ Failed to cancel invitation`);
      setLoading(false);
      return;
    }
    
    // Also delete from users table if it exists as pending
    const { error: userError } = await supabase
      .from('users')
      .delete()
      .eq('email', email)
      .eq('status', 'pending');
    
    if (userError) {
      console.error('Failed to delete from users:', userError);
    }
    
    setMessage(`✅ Invitation cancelled for ${email}`);
    await loadPendingInvites();
    setTimeout(() => setMessage(''), 3000);
    setLoading(false);
  };

  const handleDeleteAgent = async (agentId: string, email: string) => {
    if (!confirm(`Delete agent ${email}? This will remove all their data.`)) return;
    
    setLoading(true);
    
    // Delete from user_roles
    const { error: roleError } = await supabase
      .from('user_roles')
      .delete()
      .eq('id', agentId);
    
    if (roleError) {
      setMessage(`❌ Failed to delete agent`);
      setLoading(false);
      return;
    }
    
    // Delete from users table
    const { error: userError } = await supabase
      .from('users')
      .delete()
      .eq('email', email);
    
    if (userError) {
      console.error('Failed to delete from users:', userError);
    }
    
    setMessage(`✅ Agent ${email} deleted`);
    await loadAgents();
    setTimeout(() => setMessage(''), 3000);
    setLoading(false);
  };

  const filteredAgents = agents.filter(agent =>
    agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (agent.first_name && agent.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (agent.last_name && agent.last_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Agent Management</h2>
        <button
          onClick={() => setShowInviteModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Invite Agent
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <input
          type="text"
          placeholder="Search agents by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Active Agents Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left text-sm font-medium text-gray-700">Agent</th>
              <th className="p-3 text-left text-sm font-medium text-gray-700">Email</th>
              <th className="p-3 text-left text-sm font-medium text-gray-700">Phone</th>
              <th className="p-3 text-left text-sm font-medium text-gray-700">Joined</th>
              <th className="p-3 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="p-3 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAgents.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  No active agents found
                </td>
              </tr>
            ) : (
              filteredAgents.map(agent => (
                <tr key={agent.id} className="border-t">
                  <td className="p-3">
                    {agent.first_name || agent.last_name ? 
                      `${agent.first_name || ''} ${agent.last_name || ''}`.trim() : 
                      '-'
                    }
                  </td>
                  <td className="p-3">{agent.email}</td>
                  <td className="p-3">{agent.phone_number || '-'}</td>
                  <td className="p-3">{new Date(agent.created_at).toLocaleDateString()}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDeleteAgent(agent.id, agent.email)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pending Invites Section */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-3">Pending Invites</h3>
        {pendingInvites.length === 0 ? (
          <p className="text-gray-500 text-sm">No pending invites</p>
        ) : (
          <div className="space-y-2">
            {pendingInvites.map(invite => (
              <div key={invite.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <span className="font-medium">{invite.email}</span>
                  <p className="text-xs text-gray-500">
                    Expires: {new Date(invite.invitation_expires_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Pending</span>
                  <button
                    onClick={() => handleResendInvite(invite.email)}
                    className="text-blue-600 hover:text-blue-800 text-xs"
                  >
                    Resend
                  </button>
                  <button
                    onClick={() => handleCancelInvite(invite.id, invite.email)}
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

      {/* Invite Modal */}
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
                <button onClick={handleInvite} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
                  {loading ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
