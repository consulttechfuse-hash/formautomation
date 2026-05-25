'use client';

import { useEffect, useState } from 'react';
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
  const supabase = createClient();

  useEffect(() => {
    loadPayments();
  }, [role, adminId, agentId]);

  const loadPayments = async () => {
    setLoading(true);
    let query = supabase.from('manual_payment_requests').select('*');

    if (role === 'admin' && adminId) {
      const { data: clients } = await supabase
        .from('users')
        .select('id')
        .eq('admin_id', adminId)
        .eq('role', 'client');
      
      const clientIds = clients?.map(c => c.id) || [];
      if (clientIds.length > 0) {
        query = query.in('client_id', clientIds);
      } else {
        setPayments([]);
        setLoading(false);
        return;
      }
    } else if (role === 'agent' && agentId) {
      const { data: clients } = await supabase
        .from('users')
        .select('id')
        .eq('agent_id', agentId)
        .eq('role', 'client');
      
      const clientIds = clients?.map(c => c.id) || [];
      if (clientIds.length > 0) {
        query = query.in('client_id', clientIds);
      } else {
        setPayments([]);
        setLoading(false);
        return;
      }
    }

    const { data } = await query.order('requested_at', { ascending: false });
    setPayments(data || []);
    setLoading(false);
  };

  const viewPOP = async (popUrl: string) => {
    const { data, error } = await supabase.storage
      .from('pops')
      .createSignedUrl(popUrl, 300);
    
    if (error) {
      alert('Error viewing POP: ' + error.message);
      return;
    }
    
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank');
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'confirmed') {
      return <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">✅ Confirmed</span>;
    }
    if (status === 'rejected') {
      return <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">❌ Rejected</span>;
    }
    return <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">⏳ Pending</span>;
  };

  const filteredPayments = payments.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });
  
  const pendingCount = payments.filter(p => p.status === 'pending').length;

  if (loading) {
    return <div className="p-4 text-center">Loading payment status...</div>;
  }

  return (
    <div className="space-y-4">
      {pendingCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            ⚠️ {pendingCount} payment request(s) pending verification
          </p>
        </div>
      )}

      <div className="flex gap-2 border-b pb-2">
        <button onClick={() => setFilter('pending')} className={`px-3 py-1 text-sm rounded ${filter === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'text-gray-500'}`}>Pending</button>
        <button onClick={() => setFilter('confirmed')} className={`px-3 py-1 text-sm rounded ${filter === 'confirmed' ? 'bg-green-100 text-green-800' : 'text-gray-500'}`}>Confirmed</button>
        <button onClick={() => setFilter('rejected')} className={`px-3 py-1 text-sm rounded ${filter === 'rejected' ? 'bg-red-100 text-red-800' : 'text-gray-500'}`}>Rejected</button>
        <button onClick={() => setFilter('all')} className={`px-3 py-1 text-sm rounded ${filter === 'all' ? 'bg-gray-200 text-gray-800' : 'text-gray-500'}`}>All</button>
      </div>

      {filteredPayments.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">No payment requests found</div>
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
                    <button onClick={() => viewPOP(payment.pop_url)} className="text-blue-600 hover:underline text-sm">📄 View POP</button>
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
                            await supabase.from('manual_payment_requests').update({ 
                              status: 'confirmed', 
                              confirmed_at: new Date().toISOString(), 
                              confirmed_by: user?.id 
                            }).eq('id', payment.id);
                            await supabase.from('users').update({ 
                              has_paid: true, 
                              paid_at: new Date().toISOString() 
                            }).eq('id', payment.client_id);
                            await fetch('/api/send-payment-confirmation', { 
                              method: 'POST', 
                              headers: { 'Content-Type': 'application/json' }, 
                              body: JSON.stringify({ email: payment.client_email, clientId: payment.client_id }) 
                            });
                            alert(`Payment confirmed for ${payment.client_email}`);
                            loadPayments();
                          }}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          ✓ Confirm
                        </button>
                        <button
                          onClick={async () => {
                            const reason = prompt('Reason for rejection:');
                            if (!reason) return;
                            await supabase.from('manual_payment_requests').update({ 
                              status: 'rejected', 
                              admin_notes: reason 
                            }).eq('id', payment.id);
                            alert(`Payment rejected for ${payment.client_email}`);
                            loadPayments();
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
