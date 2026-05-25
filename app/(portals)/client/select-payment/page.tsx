'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function SelectPaymentPage() {
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    
    const { data: userData } = await supabase
      .from('users')
      .select('has_paid')
      .eq('id', user.id)
      .single();
    
    if (userData?.has_paid === true) {
      router.push('/client/form-01');
      return;
    }
    
    setUser(user);
    setLoading(false);
  };

  const handleContinue = () => {
    if (!selectedMethod) return;
    
    if (selectedMethod === 'stripe') {
      router.push('/client/payment');
    } else if (selectedMethod === 'manual') {
      router.push('/client/payment-manual');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Select Payment Method</h1>
      <p className="text-gray-600 mb-8">Choose how you'd like to pay</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div
          onClick={() => setSelectedMethod('stripe')}
          className={`border rounded-lg p-6 cursor-pointer ${
            selectedMethod === 'stripe' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <span className="text-3xl">💳</span>
          <h2 className="text-lg font-semibold mt-2">Credit / Debit Card</h2>
          <p className="text-gray-600 text-sm mt-1">Pay instantly via Stripe</p>
        </div>

        <div
          onClick={() => setSelectedMethod('manual')}
          className={`border rounded-lg p-6 cursor-pointer ${
            selectedMethod === 'manual' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <span className="text-3xl">🏦</span>
          <h2 className="text-lg font-semibold mt-2">Manual EFT</h2>
          <p className="text-gray-600 text-sm mt-1">Bank transfer with POP verification</p>
        </div>
      </div>

      <div className="flex gap-4">
        <button onClick={() => router.back()} className="px-6 py-2 border rounded-lg">Back</button>
        <button
          onClick={handleContinue}
          disabled={!selectedMethod}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
