'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

interface PaymentRequest {
  id: string;
  client_id: string;
  client_email: string;
  client_name: string;
  reference: string;
  pop_url: string;
  pop_filename: string;
  status: string;
  requested_at: string;
  confirmed_at: string;
}

interface PaymentStatusProps {
  role: 'owner' | 'admin' | 'agent';
  adminId?: string;
  agentId?: string;
}

export default function PaymentStatus({ role, adminId, agentId }: PaymentStatusProps) {
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'rejected'>('pending');
  const [pendingCount, setPendingCount] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  const supabase = createClient();

  const loadPayments = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('manual_payment_requests').select('*');

    if (role === 'owner') {
      query = query.order('requested_at', { ascending: false });
    } 
    else if (role === 'admin' && adminId) {
      const { data: userRoleClients } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('assigned_admin_id', adminId);
      
      const uniqueClientIds = [...new Set(userRoleClients?.map(c => c.user_id) || [])];
      
      if (uniqueClientIds.length > 0) {
        query = query.in('client_id', uniqueClientIds).order('requested_at', { ascending: false });
      } else {
        setPayments([]);
        setPendingCount(0);
        setLoading(false);
        return;
      }
    }
    else if (role === 'agent' && agentId) {
      const { data: userRoleClients } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('assigned_agent_id', agentId);
      
      const clientIds = userRoleClients?.map(c => c.user_id) || [];
      
      if (clientIds.length > 0) {
        query = query.in('client_id', clientIds).order('requested_at', { ascending: false });
      } else {
        setPayments([]);
        setPendingCount(0);
        setLoading(false);
        return;
      }
    }

    const { data } = await query;
    setPayments(data || []);
    setPendingCount(data?.filter(p => p.status === 'pending').length || 0);
    setLoading(false);
  }, [role, adminId, agentId, supabase]);

  // Initial load and polling for admin/agent roles (refresh every 10 seconds)
  useEffect(() => {
    loadPayments();
    
    // Poll every 10 seconds for admin and agent roles to see status updates
    let interval: NodeJS.Timeout | null = null;
    if (role === 'admin' || role === 'agent') {
      interval = setInterval(() => {
        loadPayments();
      }, 10000); // Refresh every 10 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loadPayments, role]);

  const showToast = (message: string, type: string) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const viewPOP = async (popUrl: string) => {
    const { data, error } = await supabase.storage
      .from('pops')
      .createSignedUrl(popUrl, 300);
    
    if (error) {
      showToast('Error viewing POP: ' + error.message, 'error');
      return;
    }
    
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank');
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'confirmed' || status === 'approved') {
      return <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">✅ Confirmed</span>;
    }
    if (status === 'rejected') {
      return <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">❌ Rejected</span>;
    }
    return <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">⏳ Pending</span>;
  };

  const filteredPayments = payments.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'confirmed') return p.status === 'confirmed' || p.status === 'approved';
    return p.status === filter;
  });

  if (loading) {
    return <div className="text-center py-8">Loading payment requests...</div>;
  }

  return (
    <div className="space-y-4">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {pendingCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            ⚠️ {pendingCount} new payment request(s) pending verification
          </p>
        </div>
      )}

      <div className="flex gap-2 border-b pb-2">
        <button 
          onClick={() => setFilter('pending')} 
          className={`px-3 py-1 text-sm rounded ${filter === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'text-gray-500'}`}
        >
          Pending ({payments.filter(p => p.status === 'pending').length})
        </button>
        <button 
          onClick={() => setFilter('confirmed')} 
          className={`px-3 py-1 text-sm rounded ${filter === 'confirmed' ? 'bg-green-100 text-green-800' : 'text-gray-500'}`}
        >
          Confirmed ({payments.filter(p => p.status === 'confirmed' || p.status === 'approved').length})
        </button>
        <button 
          onClick={() => setFilter('rejected')} 
          className={`px-3 py-1 text-sm rounded ${filter === 'rejected' ? 'bg-red-100 text-red-800' : 'text-gray-500'}`}
        >
          Rejected ({payments.filter(p => p.status === 'rejected').length})
        </button>
        <button 
          onClick={() => setFilter('all')} 
          className={`px-3 py-1 text-sm rounded ${filter === 'all' ? 'bg-gray-200 text-gray-800' : 'text-gray-500'}`}
        >
          All ({payments.length})
        </button>
        <button 
          onClick={loadPayments} 
          className="ml-auto px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          🔄 Refresh
        </button>
      </div>

      {filteredPayments.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
          No {filter !== 'all' ? filter : ''} payment requests found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Client</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Reference</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">POP</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Requested</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Status</th>
                {role === 'owner' && (
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <div className="font-medium">{payment.client_email}</div>
                    <div className="text-xs text-gray-500">{payment.client_name}</div>
                  </td>
                  <td className="px-4 py-2 text-sm font-mono">{payment.reference}</td>
                  <td className="px-4 py-2">
                    <button onClick={() => viewPOP(payment.pop_url)} className="text-blue-600 hover:underline text-sm">
                      📄 View POP
                    </button>
                  </td>
                  <td className="px-4 py-2 text-sm">{new Date(payment.requested_at).toLocaleString()}</td>
                  <td className="px-4 py-2">{getStatusBadge(payment.status)}</td>
                  {role === 'owner' && payment.status === 'pending' && (
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            if (!confirm(`Confirm payment for ${payment.client_email}?`)) return;
                            const { data: { user } } = await supabase.auth.getUser();
                            
                            await supabase
                              .from('manual_payment_requests')
                              .update({ 
                                status: 'confirmed', 
                                confirmed_at: new Date().toISOString(), 
                                confirmed_by: user?.id 
                              })
                              .eq('id', payment.id);
                            
                            await supabase
                              .from('user_roles')
                              .update({ has_paid: true })
                              .eq('user_id', payment.client_id);
                            
                            await fetch('/api/send-payment-confirmation', { 
                              method: 'POST', 
                              headers: { 'Content-Type': 'application/json' }, 
                              body: JSON.stringify({ email: payment.client_email, clientId: payment.client_id, status: 'approved' }) 
                            });
                            
                            showToast(`✅ Payment confirmed for ${payment.client_email}`, 'success');
                            await loadPayments();
                            setFilter('confirmed');
                          }}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          ✓ Confirm
                        </button>
                        <button
                          onClick={async () => {
                            const reason = prompt('Reason for rejection:');
                            if (!reason) return;
                            
                            await supabase
                              .from('manual_payment_requests')
                              .update({ status: 'rejected', admin_notes: reason })
                              .eq('id', payment.id);
                            
                            await fetch('/api/send-payment-confirmation', { 
                              method: 'POST', 
                              headers: { 'Content-Type': 'application/json' }, 
                              body: JSON.stringify({ email: payment.client_email, clientId: payment.client_id, status: 'rejected', adminNotes: reason }) 
                            });
                            
                            showToast(`❌ Payment rejected for ${payment.client_email}`, 'success');
                            await loadPayments();
                            setFilter('rejected');
                          }}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
