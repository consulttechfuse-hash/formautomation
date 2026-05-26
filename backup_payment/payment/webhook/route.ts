import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error(`Webhook Error: ${err}`);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const { clientId, clientEmail } = paymentIntent.metadata;

    // Update user's payment status in Supabase
    const { error } = await supabase
      .from('users')
      .update({ 
        has_paid: true, 
        paid_at: new Date().toISOString(),
        payment_intent_id: paymentIntent.id
      })
      .eq('id', clientId);

    if (error) {
      console.error('Error updating payment status:', error);
    }

    console.log(`Payment succeeded for client ${clientEmail} (${clientId})`);
  }

  return NextResponse.json({ received: true });
}
