'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function SelectPaymentPage() {
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [adminName, setAdminName] = useState<string>('');
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
    
    // Get client's assigned admin name
    const { data: client } = await supabase
      .from('user_roles')
      .select('assigned_admin_id')
      .eq('user_id', user.id)
      .single();
    
    if (client?.assigned_admin_id) {
      const { data: admin } = await supabase
        .from('user_roles')
        .select('first_name, last_name')
        .eq('user_id', client.assigned_admin_id)
        .single();
      
      if (admin) {
        setAdminName(`${admin.first_name} ${admin.last_name}`);
      }
    }
    
    const { data: userData } = await supabase
      .from('user_roles')
      .select('has_paid')
      .eq('user_id', user.id)
      .single();
    
    if (userData?.has_paid === true) {
      router.push('/client/form01');
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
      {/* Header Notification */}
      {adminName && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800">
            💰 You are about to make payment to <strong>{adminName}</strong>. Please ensure this is correct.
          </p>
        </div>
      )}

      <h1 className="text-2xl font-bold mb-2">Select Payment Method</h1>
      <p className="text-gray-600 mb-8">Choose how you'd like to pay (R400.00)</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div
          onClick={() => setSelectedMethod('stripe')}
          className={`border rounded-lg p-6 cursor-pointer ${
            selectedMethod === 'stripe' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <span className="text-3xl">💳</span>
          <h2 className="text-lg font-semibold mt-2">Credit / Debit Card</h2>
          <p className="text-gray-600 text-sm mt-1">Pay instantly via Stripe (Coming Soon)</p>
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

      {/* Manual EFT Bank Details */}
      {selectedMethod === 'manual' && (
        <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
          <h3 className="font-semibold text-lg mb-3">Bank Details</h3>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Bank Name:</span> Capitec Bank</p>
            <p><span className="font-medium">Account Number:</span> 111111111111</p>
            <p><span className="font-medium">Account Holder:</span> Techfuse Holdings (Pty) Ltd</p>
            <p><span className="font-medium">SWIFT / BIC Code:</span> CABLZAJJ</p>
            <p><span className="font-medium">Reference:</span> {user?.email || 'Your email address'}</p>
            <p><span className="font-medium">Amount:</span> R400.00</p>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ After payment, please upload your proof of payment (POP) on the next page.
            </p>
          </div>
        </div>
      )}

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
