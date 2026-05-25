'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function PaymentResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('processing');
  const supabase = createClient();

  useEffect(() => {
    const paymentIntent = searchParams.get('payment_intent');
    const redirectStatus = searchParams.get('redirect_status');

    async function handleResult() {
      if (redirectStatus === 'succeeded' || paymentIntent) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('users')
            .update({ has_paid: true, paid_at: new Date().toISOString() })
            .eq('id', user.id);
        }
        setStatus('success');
        setTimeout(() => router.push('/client/form-01'), 2000);
      } else {
        setStatus('failed');
        setTimeout(() => router.push('/client/payment'), 3000);
      }
    }

    handleResult();
  }, []);

  if (status === 'processing') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Verifying payment...</div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h1 className="text-2xl font-bold">Payment Successful!</h1>
          <p className="text-gray-600 mt-2">Redirecting to your forms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">✗</div>
        <h1 className="text-2xl font-bold">Payment Failed</h1>
        <p className="text-gray-600 mt-2">Redirecting to try again...</p>
      </div>
    </div>
  );
}
