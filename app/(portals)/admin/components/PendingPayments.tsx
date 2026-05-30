'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface PendingPayment {
  id: string;
  client_id: string;
  client_email: string;
  client_name: string;
  reference: string;
  status: string;
  requested_at: string;
}

export default function PendingPayments() {
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadPendingPayments();
    
    // Subscribe to changes
    const subscription = supabase
      .channel('manual_payment_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'manual_payment_requests' },
        () => loadPendingPayments()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadPendingPayments = async () => {
    const { data } = await supabase
      .from('manual_payment_requests')
      .select('*')
      .eq('status', 'pending')
      .order('requested_at', { ascending: false });
    
    setPayments(data || []);
    setLoading(false);
  };

  if (loading) {
    return <div className="p-4">Loading pending payments...</div>;
  }

  if (payments.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
        No pending manual payments
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
        <p className="text-sm text-yellow-800">
          ⚠️ {payments.length} client(s) waiting for payment verification
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Client</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Reference</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Requested</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-4 py-2">
                  <div className="font-medium">{payment.client_email}</div>
                  <div className="text-xs text-gray-500">{payment.client_name}</div>
                </td>
                <td className="px-4 py-2 text-sm font-mono">{payment.reference}</td>
                <td className="px-4 py-2 text-sm">
                  {new Date(payment.requested_at).toLocaleString()}
                </td>
                <td className="px-4 py-2">
                  <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">
                    Pending Owner Approval
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
