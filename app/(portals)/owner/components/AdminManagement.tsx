'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Admin {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

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

interface PendingInvite {
  id: string;
  email: string;
  status: string;
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
      loadAdminData(selectedAdmin.id);
    }
  }, [selectedAdmin]);

  const loadAdmins = async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'admin');
    setAdmins(data || []);
    if (data && data.length > 0) setSelectedAdmin(data[0]);
  };

  const loadPendingInvites = async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('status', 'pending');
    setPendingInvites(data || []);
  };

  const loadAdminData = async (adminId: string) => {
    const { data: agents } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'agent')
      .eq('admin_id', adminId);
    setAdminAgents(agents || []);

    const { data: clients } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'client')
      .eq('admin_id', adminId);
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

  const handleDeleteAdmin = async (admin: Admin) => {
    if (!confirm(`Remove ${admin.email} as admin?`)) return;
    try {
      const response = await fetch('/api/owner/remove-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: admin.id }),
      });
      if (response.ok) {
        loadAdmins();
        alert('Admin removed successfully');
      } else {
        alert('Failed to remove admin');
      }
    } catch (error) {
      alert('Failed to remove admin');
    }
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
          value={selectedAdmin?.id || ''}
          onChange={(e) => {
            const admin = admins.find(a => a.id === e.target.value);
            setSelectedAdmin(admin || null);
          }}
          className="w-full p-2 border rounded"
        >
          {admins.map(admin => (
            <option key={admin.id} value={admin.id}>{admin.email}</option>
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

      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-2">Pending Invites</h3>
        {pendingInvites.length === 0 ? (
          <p className="text-gray-500 text-sm">No pending invites</p>
        ) : (
          <div className="space-y-2">
            {pendingInvites.map(invite => (
              <div key={invite.id} className="flex justify-between items-center border-b pb-2">
                <span>{invite.email}</span>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Pending</span>
              </div>
            ))}
          </div>
        )}
      </div>

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
