'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface PendingPayment {
  id: string;
  client_id: string;
  client_email: string;
  client_name: string;
  amount: number;
  proof_url: string;
  created_at: string;
  status: string;
}

export default function PendingPayments() {
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadPendingPayments();
  }, []);

  const loadPendingPayments = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('manual_payment_requests')
      .select(`
        *,
        client:client_id (email, fn_t1, srn_t1)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error loading payments:', error);
    }
    
    const formattedPayments = (data || []).map((payment: any) => ({
      id: payment.id,
      client_id: payment.client_id,
      client_email: payment.client?.email || 'Unknown',
      client_name: payment.client?.fn_t1 
        ? `${payment.client.fn_t1} ${payment.client.srn_t1 || ''}`.trim()
        : 'Client',
      amount: payment.amount,
      proof_url: payment.proof_url,
      created_at: payment.created_at,
      status: payment.status
    }));
    
    setPayments(formattedPayments);
    setLoading(false);
  };

  const handleVerify = async (paymentId: string, action: 'approve' | 'reject') => {
    const response = await fetch('/api/admin/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId, action })
    });
    
    if (response.ok) {
      alert(`Payment ${action}d successfully`);
      loadPendingPayments();
    } else {
      alert('Error processing payment');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Pending Payments</h2>
        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
          {payments.length} Pending
        </span>
      </div>

      {payments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          No pending payments
        </div>
      ) : (
        <div className="grid gap-4">
          {payments.map((payment) => (
            <div key={payment.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">
                      Payment Request from {payment.client_name}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-500">Client Email</p>
                      <p className="font-medium">{payment.client_email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Amount</p>
                      <p className="font-medium text-lg text-green-600">R{payment.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Request Date</p>
                      <p className="font-medium">{new Date(payment.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  {payment.proof_url && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Payment Proof</p>
                      <a 
                        href={payment.proof_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View Uploaded Proof
                      </a>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleVerify(payment.id, 'approve')}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleVerify(payment.id, 'reject')}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
