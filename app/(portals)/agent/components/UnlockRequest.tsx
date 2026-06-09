'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Client {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  has_paid: boolean;
  step_4_form01_completed: boolean;
}

interface UnlockRequest {
  id: string;
  client_id: string;
  client_email: string;
  client_name: string;
  form_number: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string;
  requested_at: string;
}

export default function UnlockRequest() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pendingRequests, setPendingRequests] = useState<UnlockRequest[]>([]);
  const supabase = createClient();

  useEffect(() => {
    loadClients();
    loadPendingRequests();
  }, []);

  const loadClients = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // FIX: Get clients assigned to THIS agent (assigned_agent_id = agent.user_id)
    const { data: clientsData } = await supabase
      .from('user_roles')
      .select('user_id, email, first_name, last_name, has_paid')
      .eq('role', 'client')
      .eq('assigned_agent_id', user.id);

    if (!clientsData || clientsData.length === 0) {
      setClients([]);
      setLoading(false);
      return;
    }

    // Get flow states to check if Form-01 is completed (step_4_form01_completed)
    const clientIds = clientsData.map(c => c.user_id);
    const { data: flowStates } = await supabase
      .from('client_flow_state')
      .select('client_id, step_4_form01_completed')
      .in('client_id', clientIds);

    const flowMap = new Map();
    flowStates?.forEach(flow => flowMap.set(flow.client_id, flow));

    // Only show clients who have completed Form-01 (step_4_form01_completed = true)
    const formattedClients: Client[] = clientsData
      .filter(c => flowMap.get(c.user_id)?.step_4_form01_completed === true)
      .map(c => ({
        id: c.user_id,
        user_id: c.user_id,
        email: c.email,
        first_name: c.first_name || '',
        last_name: c.last_name || '',
        has_paid: c.has_paid || false,
        step_4_form01_completed: flowMap.get(c.user_id)?.step_4_form01_completed || false,
      }));

    setClients(formattedClients);
    setLoading(false);
  };

  const loadPendingRequests = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: requests } = await supabase
      .from('unlock_requests')
      .select('*')
      .eq('requested_by', user.id)
      .order('requested_at', { ascending: false });

    setPendingRequests(requests || []);
  };

  const handleSubmit = async () => {
    if (!selectedClient) {
      setMessage({ type: 'error', text: 'Please select a client' });
      return;
    }
    if (!reason.trim()) {
      setMessage({ type: 'error', text: 'Please provide a reason' });
      return;
    }

    setSubmitting(true);
    const client = clients.find(c => c.id === selectedClient);
    if (!client) {
      setMessage({ type: 'error', text: 'Client not found' });
      setSubmitting(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('unlock_requests')
      .insert({
        client_id: selectedClient,
        client_email: client.email,
        client_name: `${client.first_name} ${client.last_name}`.trim() || client.email,
        form_number: 1,
        reason: reason,
        status: 'pending',
        requested_by: user?.id,
        requested_at: new Date().toISOString(),
      });

    if (error) {
      setMessage({ type: 'error', text: 'Failed to submit request: ' + error.message });
    } else {
      setMessage({ type: 'success', text: 'Unlock request submitted. Admin will review.' });
      setSelectedClient('');
      setReason('');
      await loadPendingRequests();
    }
    setSubmitting(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">⏳ Pending</span>;
      case 'approved': return <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">✅ Approved</span>;
      case 'rejected': return <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">❌ Rejected</span>;
      default: return <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  if (loading) return <div className="text-center py-8">Loading clients...</div>;

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Request Form-01 Unlock</h2>
        <p className="text-sm text-gray-600 mb-4">
          Request unlocking of Form-01 for a client who needs to make corrections.
          Only clients who have already completed Form-01 are shown.
        </p>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Client</label>
            <select 
              value={selectedClient} 
              onChange={(e) => setSelectedClient(e.target.value)} 
              className="w-full border rounded-lg px-3 py-2" 
              disabled={submitting}
            >
              <option value="">-- Select a client --</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.first_name} {client.last_name} ({client.email})
                </option>
              ))}
            </select>
            {clients.length === 0 && (
              <p className="text-sm text-amber-600 mt-1">
                No clients with completed Form-01 found. Clients appear here after they complete Form-01.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Unlock</label>
            <textarea 
              value={reason} 
              onChange={(e) => setReason(e.target.value)} 
              rows={3} 
              className="w-full border rounded-lg px-3 py-2" 
              placeholder="Explain why the client needs to edit Form-01..." 
              disabled={submitting} 
            />
          </div>

          <button 
            onClick={handleSubmit} 
            disabled={submitting || !selectedClient || !reason.trim() || clients.length === 0} 
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Unlock Request'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">My Unlock Requests</h2>
        {pendingRequests.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No unlock requests submitted yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Client</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Reason</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Requested</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pendingRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <div className="font-medium">{req.client_name}</div>
                      <div className="text-xs text-gray-500">{req.client_email}</div>
                    </td>
                    <td className="px-4 py-2 text-sm max-w-xs truncate">{req.reason}</td>
                    <td className="px-4 py-2 text-sm">{new Date(req.requested_at).toLocaleString()}</td>
                    <td className="px-4 py-2">{getStatusBadge(req.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
