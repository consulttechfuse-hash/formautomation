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
}

interface PendingInvite {
  id: string;
  email: string;
  invitation_token: string;
  invitation_expires_at: string;
  created_at: string;
}

export default function AgentManagement() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
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
      .select('id, user_id, email, role, assigned_admin_id, created_at, accepted_at')
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
      .select('id, email, invitation_token, invitation_expires_at, created_at')
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

    if (response.ok) {
      setMessage(`✅ Invitation resent to ${email}`);
      await loadPendingInvites();
    } else {
      const result = await response.json();
      setMessage(`❌ Error: ${result.error}`);
    }
    setLoading(false);
  };

  const handleCancelInvite = async (id: string) => {
    if (!confirm('Cancel this invitation?')) return;
    
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('id', id);
    
    if (!error) {
      setMessage('✅ Invitation cancelled');
      await loadPendingInvites();
    } else {
      setMessage('❌ Failed to cancel invitation');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Agent Management</h2>
        <button
          onClick={() => setShowInviteModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Invite Agent
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-3 rounded-lg ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3">Pending Invites ({pendingInvites.length})</h3>
          <div className="space-y-2">
            {pendingInvites.map((invite) => (
              <div key={invite.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">{invite.email}</p>
                  <p className="text-xs text-gray-500">
                    Expires: {new Date(invite.invitation_expires_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleResendInvite(invite.email)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Resend
                  </button>
                  <button
                    onClick={() => handleCancelInvite(invite.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Agents */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-3">Active Agents ({agents.length})</h3>
        {agents.length === 0 ? (
          <p className="text-gray-500 text-sm">No agents assigned yet</p>
        ) : (
          <div className="space-y-2">
            {agents.map((agent) => (
              <div key={agent.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">{agent.email}</p>
                  <p className="text-xs text-gray-500">
                    Since: {new Date(agent.created_at).toLocaleDateString()}
                  </p>
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
                <button onClick={() => setShowInviteModal(false)} className="px-4 py-2 border rounded">
                  Cancel
                </button>
                <button
                  onClick={handleInvite}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
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
