'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface PaymentProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

export default function PaymentPage({ onSuccess, onError, onCancel }: PaymentProps) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handlePayment = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not logged in');

      // Update user as paid
      const { error } = await supabase
        .from('users')
        .update({ has_paid: true, paid_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;

      if (onSuccess) onSuccess();
    } catch (err) {
      if (onError) onError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Payment</h1>
        <p className="text-gray-600 mb-6">Complete your payment to proceed.</p>
        
        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </button>
        
        <button
          onClick={onCancel}
          className="w-full mt-3 text-gray-500 py-2 rounded hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
