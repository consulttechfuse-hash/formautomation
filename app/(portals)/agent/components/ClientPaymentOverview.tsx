'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import ContactModal from './ContactModal';

interface ClientWithPayment {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  payment_status: 'pending' | 'confirmed' | 'rejected' | 'not_paid';
  has_paid: boolean;
  onboarding_complete: boolean;
  onboarding_submitted: boolean;
  flow_completed: boolean;
  payment_request_id: string | null;
  payment_requested_at: string | null;
  consent_given: boolean;
  admin_selected: boolean;
}

export default function ClientPaymentOverview() {
  const [clients, setClients] = useState<ClientWithPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'rejected' | 'not_paid'>('all');
  const [stats, setStats] = useState({
    pending: 0,
    confirmed: 0,
    rejected: 0,
    not_paid: 0,
    completed: 0,
    total: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [contactModal, setContactModal] = useState<{ isOpen: boolean; email: string; name: string }>({
    isOpen: false,
    email: '',
    name: ''
  });
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    // Get clients assigned to this agent (using assigned_admin_id which holds agent ID)
    const { data: clientsData, error: clientsError } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        email,
        first_name,
        last_name,
        has_paid,
        has_consented,
        assigned_admin_id,
        onboarding_complete,
        onboarding_submitted,
        created_at
      `)
      .eq('role', 'client')
      .eq('assigned_admin_id', user.id);

    if (clientsError) {
      console.error('Error loading clients:', clientsError);
      setLoading(false);
      return;
    }

    if (!clientsData || clientsData.length === 0) {
      setClients([]);
      setStats({ pending: 0, confirmed: 0, rejected: 0, not_paid: 0, completed: 0, total: 0 });
      setLoading(false);
      return;
    }

    // Get payment requests for these clients
    const clientIds = clientsData.map(c => c.user_id);
    const { data: paymentRequests } = await supabase
      .from('manual_payment_requests')
      .select('client_id, status, requested_at')
      .in('client_id', clientIds);

    const paymentMap = new Map();
    paymentRequests?.forEach(req => {
      paymentMap.set(req.client_id, { status: req.status, requested_at: req.requested_at });
    });

    // Get flow state for these clients
    const { data: flowStates } = await supabase
      .from('client_flow_state')
      .select('client_id, step_6_completed, step_1_admin_selected, step_3_consent_completed')
      .in('client_id', clientIds);

    const flowMap = new Map();
    flowStates?.forEach(flow => {
      flowMap.set(flow.client_id, flow);
    });

    // Combine data
    const clientsWithPayment: ClientWithPayment[] = clientsData.map(client => {
      const payment = paymentMap.get(client.user_id);
      const flowState = flowMap.get(client.user_id);
      
      let payment_status: 'pending' | 'confirmed' | 'rejected' | 'not_paid' = 'not_paid';
      
      if (payment) {
        if (payment.status === 'pending') {
          payment_status = 'pending';
        } else if (payment.status === 'confirmed' || payment.status === 'approved') {
          payment_status = 'confirmed';
        } else if (payment.status === 'rejected') {
          payment_status = 'rejected';
        }
      } else if (client.has_paid === true) {
        payment_status = 'confirmed';
      }
      
      return {
        id: client.user_id,
        user_id: client.user_id,
        email: client.email,
        first_name: client.first_name || '',
        last_name: client.last_name || '',
        payment_status,
        has_paid: client.has_paid || false,
        onboarding_complete: client.onboarding_complete || false,
        onboarding_submitted: client.onboarding_submitted || false,
        flow_completed: flowState?.step_6_completed || false,
        consent_given: client.has_consented || flowState?.step_3_consent_completed || false,
        admin_selected: flowState?.step_1_admin_selected || false,
        payment_request_id: payment ? client.user_id : null,
        payment_requested_at: payment?.requested_at || null
      };
    });

    // Calculate stats
    const pending = clientsWithPayment.filter(c => c.payment_status === 'pending').length;
    const confirmed = clientsWithPayment.filter(c => c.payment_status === 'confirmed').length;
    const rejected = clientsWithPayment.filter(c => c.payment_status === 'rejected').length;
    const not_paid = clientsWithPayment.filter(c => c.payment_status === 'not_paid').length;
    const completed = clientsWithPayment.filter(c => c.onboarding_submitted === true || c.flow_completed === true).length;
    const total = clientsWithPayment.length;

    setStats({ pending, confirmed, rejected, not_paid, completed, total });
    setClients(clientsWithPayment);
    setLoading(false);
  };

  const filteredClients = clients.filter(client => {
    if (filter !== 'all' && client.payment_status !== filter) return false;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return client.email.toLowerCase().includes(searchLower) ||
             `${client.first_name} ${client.last_name}`.toLowerCase().includes(searchLower);
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">⏳ Pending Owner</span>;
      case 'confirmed':
        return <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">✅ Paid</span>;
      case 'rejected':
        return <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">❌ Rejected</span>;
      case 'not_paid':
        return <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">💰 Not Paid</span>;
      default:
        return <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const getActionButton = (client: ClientWithPayment) => {
    if (client.payment_status === 'pending') {
      return (
        <button
          onClick={() => router.push(`/agent/client/${client.id}?tab=payment`)}
          className="text-blue-600 hover:underline text-sm"
        >
          View Status
        </button>
      );
    }
    if (client.payment_status === 'not_paid') {
      return (
        <button
          onClick={() => setContactModal({ isOpen: true, email: client.email, name: `${client.first_name} ${client.last_name}` })}
          className="text-orange-600 hover:underline text-sm"
        >
          Follow Up
        </button>
      );
    }
    if (client.payment_status === 'confirmed' && !client.onboarding_submitted) {
      return (
        <button
          onClick={() => router.push(`/agent/client/${client.id}?tab=progress`)}
          className="text-green-600 hover:underline text-sm"
        >
          Check Progress
        </button>
      );
    }
    return (
      <button
        onClick={() => router.push(`/agent/client/${client.id}`)}
        className="text-gray-600 hover:underline text-sm"
      >
        View Details
      </button>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading clients...</span>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-4 text-center border-l-4 border-blue-500">
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Clients</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center border-l-4 border-yellow-500">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-yellow-600">Pending Approval</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center border-l-4 border-green-500">
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
            <div className="text-sm text-green-600">Paid</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center border-l-4 border-red-500">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-red-600">Rejected</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center border-l-4 border-gray-500">
            <div className="text-2xl font-bold text-gray-600">{stats.not_paid}</div>
            <div className="text-sm text-gray-600">Not Paid</div>
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
            <div className="text-sm text-blue-600">Completed Onboarding</div>
          </div>
          <div className="bg-purple-50 rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
            </div>
            <div className="text-sm text-purple-600">Completion Rate</div>
          </div>
        </div>

        {/* Filter and Search */}
        <div className="flex flex-wrap gap-2 border-b pb-2 justify-between items-center">
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setFilter('all')} className={`px-3 py-1 text-sm rounded ${filter === 'all' ? 'bg-gray-200 text-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}>All ({stats.total})</button>
            <button onClick={() => setFilter('pending')} className={`px-3 py-1 text-sm rounded ${filter === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'text-gray-500 hover:bg-gray-100'}`}>Pending ({stats.pending})</button>
            <button onClick={() => setFilter('confirmed')} className={`px-3 py-1 text-sm rounded ${filter === 'confirmed' ? 'bg-green-100 text-green-800' : 'text-gray-500 hover:bg-gray-100'}`}>Confirmed ({stats.confirmed})</button>
            <button onClick={() => setFilter('rejected')} className={`px-3 py-1 text-sm rounded ${filter === 'rejected' ? 'bg-red-100 text-red-800' : 'text-gray-500 hover:bg-gray-100'}`}>Rejected ({stats.rejected})</button>
            <button onClick={() => setFilter('not_paid')} className={`px-3 py-1 text-sm rounded ${filter === 'not_paid' ? 'bg-gray-200 text-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}>Not Paid ({stats.not_paid})</button>
          </div>
          <div className="flex gap-2">
            <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="px-3 py-1 border rounded-lg text-sm w-64" />
            <button onClick={loadClients} className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600">🔄 Refresh</button>
          </div>
        </div>

        {/* Clients Table */}
        {filteredClients.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
            {clients.length === 0 ? 'No clients assigned to you yet.' : `No ${filter !== 'all' ? filter : ''} clients found.`}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Client</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Contact</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Payment Status</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Progress</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <div className="font-medium">{client.first_name || 'N/A'} {client.last_name || ''}</div>
                      <div className="text-xs text-gray-500">{client.email}</div>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => setContactModal({ isOpen: true, email: client.email, name: `${client.first_name} ${client.last_name}` })}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        📧 Contact
                      </button>
                    </td>
                    <td className="px-4 py-2">{getStatusBadge(client.payment_status)}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 rounded-full h-2" style={{ width: `${client.onboarding_submitted ? 100 : client.onboarding_complete ? 50 : client.consent_given ? 25 : client.admin_selected ? 10 : 0}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">
                          {client.onboarding_submitted ? 'Complete' : client.onboarding_complete ? 'Form-01 Done' : client.consent_given ? 'Consent Given' : client.admin_selected ? 'Admin Selected' : 'Started'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2">{getActionButton(client)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ContactModal
        isOpen={contactModal.isOpen}
        onClose={() => setContactModal({ isOpen: false, email: '', name: '' })}
        clientEmail={contactModal.email}
        clientName={contactModal.name}
        onSuccess={() => loadClients()}
      />
    </>
  );
}
