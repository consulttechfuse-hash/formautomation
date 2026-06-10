'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, CheckCircle, XCircle, Clock, Lock, Unlock, Eye, RefreshCw, AlertCircle } from 'lucide-react';
import PresenceBadge from '../../components/PresenceBadge';

interface Client {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  has_paid: boolean;
  assigned_agent_id: string | null;
  assigned_admin_id: string | null;
  created_at: string;
}

interface FlowState {
  client_id: string;
  current_step: number;
  step_2_payment_completed: boolean;
  step_4_form01_completed: boolean;
  step_6_completed: boolean;
  lock_type: string;
  locked_step: number | null;
  locked_reason: string | null;
}

export default function ClientManagement() {
  const [clients, setClients] = useState<Client[]>([]);
  const [flowStates, setFlowStates] = useState<Map<string, FlowState>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'unpaid' | 'locked'>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockReason, setUnlockReason] = useState('');
  const [processingUnlock, setProcessingUnlock] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: adminRole } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('user_id', user.id)
      .single();
    
    const adminId = adminRole?.user_id || user.id;

    const { data: clientsData } = await supabase
      .from('user_roles')
      .select('*')
      .eq('role', 'client')
      .eq('assigned_admin_id', adminId)
      .order('created_at', { ascending: false });

    setClients(clientsData || []);

    if (clientsData && clientsData.length > 0) {
      const clientIds = clientsData.map(c => c.user_id);
      const { data: flowData } = await supabase
        .from('client_flow_state')
        .select('*')
        .in('client_id', clientIds);
      
      const flowMap = new Map();
      flowData?.forEach(flow => flowMap.set(flow.client_id, flow));
      setFlowStates(flowMap);
    }

    setLoading(false);
  };

  const handleUnlockClient = async (client: Client) => {
    setSelectedClient(client);
    setUnlockReason('');
    setShowUnlockModal(true);
  };

  const submitUnlock = async () => {
    if (!selectedClient || !unlockReason.trim()) {
      alert('Please provide a reason for unlocking');
      return;
    }

    setProcessingUnlock(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('client_flow_state')
      .update({
        lock_type: 'overridden',
        locked_step: null,
        locked_reason: null,
        overridden_by: user?.id,
        override_reason: unlockReason,
        overridden_at: new Date().toISOString()
      })
      .eq('client_id', selectedClient.user_id);

    if (error) {
      alert('Error unlocking client: ' + error.message);
    } else {
      alert(`Client ${selectedClient.email} has been unlocked.`);
      await loadData();
    }
    
    setProcessingUnlock(false);
    setShowUnlockModal(false);
    setSelectedClient(null);
  };

  const getFlowStatus = (client: Client) => {
    const flow = flowStates.get(client.user_id);
    if (flow?.step_6_completed) return { text: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    if (flow?.lock_type === 'locked_step' || flow?.lock_type === 'locked_permanent') return { text: 'Locked', color: 'bg-red-100 text-red-800', icon: Lock };
    if (flow && flow.current_step >= 4 && flow.step_4_form01_completed) return { text: 'Forms Submitted', color: 'bg-blue-100 text-blue-800', icon: CheckCircle };
    if (client.has_paid) return { text: 'Payment Verified', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    return { text: 'Pending Payment', color: 'bg-yellow-100 text-yellow-800', icon: Clock };
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${client.first_name} ${client.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const flow = flowStates.get(client.user_id);
    const isLocked = flow?.lock_type === 'locked_step' || flow?.lock_type === 'locked_permanent';
    
    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'paid' && client.has_paid) ||
      (filterStatus === 'unpaid' && !client.has_paid) ||
      (filterStatus === 'locked' && isLocked);
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return <div className="text-center py-8">Loading clients...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setFilterStatus('all')} className="px-3 py-2 rounded-lg text-sm bg-blue-600 text-white">All ({clients.length})</button>
            <button onClick={() => setFilterStatus('paid')} className="px-3 py-2 rounded-lg text-sm bg-green-100 text-green-800 hover:bg-green-200">Paid</button>
            <button onClick={() => setFilterStatus('unpaid')} className="px-3 py-2 rounded-lg text-sm bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Unpaid</button>
            <button onClick={() => setFilterStatus('locked')} className="px-3 py-2 rounded-lg text-sm bg-red-100 text-red-800 hover:bg-red-200">Locked</button>
            <button onClick={loadData} className="px-3 py-2 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 flex items-center gap-1">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Client</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Payment</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Flow</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredClients.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No clients found</td></tr>
              ) : (
                filteredClients.map((client) => {
                  const flowStatus = getFlowStatus(client);
                  const flow = flowStates.get(client.user_id);
                  const isLocked = flow?.lock_type === 'locked_step' || flow?.lock_type === 'locked_permanent';
                  
                  return (
                    <tr key={client.user_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium">{client.first_name || 'N/A'} {client.last_name || ''}</div>
                        <div className="text-xs text-gray-500">{client.email}</div>
                       </td>
                      <td className="px-4 py-3">
                        <PresenceBadge userId={client.user_id} size="sm" showLastSeen={true} />
                       </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${client.has_paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {client.has_paid ? 'Paid' : 'Pending'}
                        </span>
                       </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${flowStatus.color}`}>
                          {flowStatus.text}
                        </span>
                       </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {isLocked && (
                            <button onClick={() => handleUnlockClient(client)} className="px-2 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700 flex items-center gap-1">
                              <Unlock className="h-3 w-3" /> Unlock
                            </button>
                          )}
                          <button onClick={() => window.open(`/admin/client/${client.user_id}`, '_blank')} className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 flex items-center gap-1">
                            <Eye className="h-3 w-3" /> View
                          </button>
                        </div>
                       </td>
                     </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unlock Modal */}
      {showUnlockModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Unlock Client Workflow</h3>
            <p className="text-sm text-gray-600 mb-4">Unlocking <strong>{selectedClient.email}</strong> will allow them to edit Form-01 again.</p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for unlocking</label>
              <textarea value={unlockReason} onChange={(e) => setUnlockReason(e.target.value)} className="w-full border rounded-lg px-3 py-2" rows={3} placeholder="Enter reason..." required />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowUnlockModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={submitUnlock} disabled={processingUnlock} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50">
                {processingUnlock ? 'Processing...' : 'Confirm Unlock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
