'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type PaymentFormProps = {
  amount: number;
  clientId?: string | null;
  email?: string | null;
  onSuccess?: () => void;
  onError?: (err: string) => void;
};

function PaymentForm({ amount, clientId, email, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/client/payment-success`,
        receipt_email: email ?? undefined,
      },
    });

    if (error) {
      onError?.(error.message ?? 'Payment error');
    } else {
      onSuccess?.();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : `Pay R${amount / 100}`}
      </button>
    </form>
  );
}

export default function PaymentPage() {
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadPaymentIntent();
  }, []);

  const loadPaymentIntent = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setUser(user);

    // Check if already paid
    const { data: userData } = await supabase
      .from('users')
      .select('has_paid')
      .eq('id', user.id)
      .single();

    if (userData?.has_paid === true) {
      router.push('/client/form01');
      return;
    }

    const response = await fetch('/api/payment/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: user.id,
        clientEmail: user.email,
        amount: 40000, // R400.00 in cents
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || 'Failed to initialize payment');
      setLoading(false);
      return;
    }

    setClientSecret(data.clientSecret);
    setLoading(false);
  };

  const handleSuccess = async () => {
    // Update user as paid
    await supabase
      .from('users')
      .update({ has_paid: true, paid_at: new Date().toISOString() })
      .eq('id', user.id);

    // Update flow state
    await supabase
      .from('client_flow_state')
      .update({
        step_2_payment_completed: true,
        current_step: 5,
        updated_at: new Date().toISOString()
      })
      .eq('client_id', user.id);

    router.push('/client/form01');
  };

  const handleError = (err: string) => {
    setError(err);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-gray-200 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-2">Pay with Card</h1>
        <p className="text-gray-600 mb-6">Complete your payment to unlock your forms.</p>

        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm
            amount={40000}
            clientId={user?.id}
            email={user?.email}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </Elements>

        <button
          onClick={() => router.push('/client/select-payment')}
          className="w-full mt-4 text-gray-500 py-2 rounded hover:text-gray-700"
        >
          ← Back to payment options
        </button>
      </div>
    </div>
  );
}
