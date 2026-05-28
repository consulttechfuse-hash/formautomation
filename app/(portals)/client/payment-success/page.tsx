'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const updatePaymentStatus = async () => {
      const paymentIntent = searchParams.get('payment_intent');
      const redirectStatus = searchParams.get('redirect_status');
      
      if (redirectStatus === 'succeeded' || paymentIntent) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('users')
            .update({ has_paid: true, paid_at: new Date().toISOString() })
            .eq('id', user.id);
        }
      }
      
      setTimeout(() => {
        router.push('/client/form-01');
      }, 3000);
    };
    
    updatePaymentStatus();
  }, [router, supabase, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
        <div className="text-green-500 text-6xl mb-4">✓</div>
        <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-4">
          Thank you for your payment. Redirecting to your forms...
        </p>
        <div className="animate-pulse text-sm text-gray-500">Redirecting...</div>
      </div>
    </div>
  );
}
