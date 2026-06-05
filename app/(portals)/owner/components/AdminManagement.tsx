'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Admin {
  id: string;
  user_id: string;
  email: string;
  role: string;
  created_at: string;
}

interface Agent {
  id: string;
  user_id: string;
  email: string;
  role: string;
  assigned_admin_id: string;
  created_at: string;
}

interface Client {
  id: string;
  user_id: string;
  email: string;
  role: string;
  assigned_admin_id: string;
  has_paid: boolean;
  created_at: string;
}

interface PendingInvite {
  id: string;
  email: string;
  role: string;
  invitation_token: string;
  invitation_expires_at: string;
  created_at: string;
}

export default function AdminManagement() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [adminAgents, setAdminAgents] = useState<Agent[]>([]);
  const [adminClients, setAdminClients] = useState<Client[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [sortBy, setSortBy] = useState('email');
  const supabase = createClient();

  useEffect(() => {
    loadAdmins();
    loadPendingInvites();
  }, []);

  useEffect(() => {
    if (selectedAdmin) {
      loadAdminData(selectedAdmin.user_id);
    }
  }, [selectedAdmin]);

  const loadAdmins = async () => {
    // Query from user_roles table
    const { data } = await supabase
      .from('user_roles')
      .select('*')
      .eq('role', 'admin')
      .not('user_id', 'is', null);
    setAdmins(data || []);
    if (data && data.length > 0) setSelectedAdmin(data[0]);
  };

  const loadPendingInvites = async () => {
    // Query pending invites from user_roles table
    const { data } = await supabase
      .from('user_roles')
      .select('*')
      .eq('role', 'admin')
      .is('user_id', null)
      .is('accepted_at', null)
      .not('invitation_token', 'is', null);
    setPendingInvites(data || []);
  };

  const loadAdminData = async (adminUserId: string) => {
    // Load agents assigned to this admin
    const { data: agents } = await supabase
      .from('user_roles')
      .select('*')
      .eq('role', 'agent')
      .eq('assigned_admin_id', adminUserId)
      .not('user_id', 'is', null);
    setAdminAgents(agents || []);

    // Load clients assigned to this admin
    const { data: clients } = await supabase
      .from('user_roles')
      .select('*')
      .eq('role', 'client')
      .eq('assigned_admin_id', adminUserId)
      .not('user_id', 'is', null);
    setAdminClients(clients || []);
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    try {
      const response = await fetch('/api/owner/invite-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      });
      if (response.ok) {
        setInviteEmail('');
        setShowInviteModal(false);
        loadAdmins();
        loadPendingInvites();
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

  const handleResendInvite = async (email: string) => {
    const response = await fetch('/api/owner/invite-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (response.ok) {
      alert('Invitation resent successfully');
      loadPendingInvites();
    } else {
      const data = await response.json();
      alert(data.error || 'Failed to resend invitation');
    }
  };

  const handleCancelInvite = async (id: string, email: string) => {
    if (!confirm('Cancel this invitation? This will remove the pending invite permanently.')) return;
    
    // Delete from user_roles
    const { error: roleError } = await supabase
      .from('user_roles')
      .delete()
      .eq('id', id);
    
    if (roleError) {
      alert('Failed to cancel invitation');
      return;
    }
    
    // Also delete from public.users if it exists as pending
    const { error: userError } = await supabase
      .from('users')
      .delete()
      .eq('email', email)
      .eq('status', 'pending');
    
    if (userError) {
      console.error('Failed to delete from users:', userError);
    }
    
    alert('Invitation cancelled');
    loadPendingInvites();
    loadAdmins();
  };

  const sortedAgents = [...adminAgents].sort((a, b) => {
    if (sortBy === 'email') return a.email.localeCompare(b.email);
    if (sortBy === 'created_at') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    return 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Admin Management</h2>
        <button
          onClick={() => setShowInviteModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Invite Admin
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium mb-2">Select Admin</label>
        <select
          value={selectedAdmin?.user_id || ''}
          onChange={(e) => {
            const admin = admins.find(a => a.user_id === e.target.value);
            setSelectedAdmin(admin || null);
          }}
          className="w-full p-2 border rounded"
        >
          {admins.map(admin => (
            <option key={admin.id} value={admin.user_id}>{admin.email}</option>
          ))}
        </select>
      </div>

      {selectedAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-2">Agents Under {selectedAdmin.email}</h3>
            <p className="text-2xl font-bold text-blue-600">{adminAgents.length}</p>
            {adminAgents.length > 0 && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Agents List</span>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-sm border rounded p-1"
                  >
                    <option value="email">Sort by Email</option>
                    <option value="created_at">Sort by Date Joined</option>
                  </select>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {sortedAgents.map(agent => (
                    <div key={agent.id} className="bg-gray-50 rounded p-2 flex justify-between items-center">
                      <span className="text-sm">{agent.email}</span>
                      <span className="text-xs text-gray-500">
                        Joined: {new Date(agent.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-2">Clients Under {selectedAdmin.email}</h3>
            <p className="text-2xl font-bold text-green-600">{adminClients.length}</p>
            <p className="text-sm text-gray-500 mt-1">
              Paid: {adminClients.filter(c => c.has_paid === true).length}
            </p>
          </div>
        </div>
      )}

      {/* Pending Invites Section */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-2">Pending Invites</h3>
        {pendingInvites.length === 0 ? (
          <p className="text-gray-500 text-sm">No pending invites</p>
        ) : (
          <div className="space-y-2">
            {pendingInvites.map(invite => (
              <div key={invite.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <span>{invite.email}</span>
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
              <h2 className="text-xl font-bold">Invite New Admin</h2>
              <button onClick={() => setShowInviteModal(false)} className="text-gray-500 text-2xl">&times;</button>
            </div>
            <div className="p-4">
              <input
                type="email"
                placeholder="admin@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full p-2 border rounded mb-4"
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowInviteModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button onClick={handleInvite} disabled={inviting} className="px-4 py-2 bg-blue-600 text-white rounded">
                  {inviting ? 'Inviting...' : 'Send Invitation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
