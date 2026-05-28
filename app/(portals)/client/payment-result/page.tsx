"use client";

import { Suspense } from 'react';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function PaymentResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const paymentIntent = searchParams.get('payment_intent');
    const redirectStatus = searchParams.get('redirect_status');

    const handleResult = async () => {
      if (redirectStatus === 'succeeded' || paymentIntent) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('users')
            .update({ has_paid: true, paid_at: new Date().toISOString() })
            .eq('id', user.id);
        }
        router.push('/client/form-01');
      } else {
        router.push('/client/select-payment');
      }
    };

    handleResult();
  }, [router, supabase, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">Processing payment...</div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <PaymentResultContent />
    </Suspense>
  );
}
