import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { clientId, clientEmail, amount } = await request.json();
    const expectedAmount = 40000;

    // Validate amount
    if (amount !== expectedAmount) {
      await supabase.from('fraud_alerts').insert({
        user_id: clientId,
        alert_type: 'amount_manipulation',
        severity: 'critical',
        details: { attempted_amount: amount, expected_amount: expectedAmount }
      });
      return NextResponse.json({ error: 'Invalid payment amount' }, { status: 400 });
    }

    // Check for rapid failed attempts
    const { data: recentAttempts } = await supabase
      .from('payment_attempts')
      .select('id')
      .eq('user_id', clientId)
      .eq('status', 'failed')
      .gte('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString());
    
    if (recentAttempts && recentAttempts.length >= 5) {
      return NextResponse.json({ error: 'Too many failed attempts' }, { status: 429 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: expectedAmount,
      currency: 'zar',
      metadata: {
        clientId,
        clientEmail,
        product: 'Form Completion Service',
      },
      automatic_payment_methods: { enabled: true },
    });

    await supabase.from('payment_attempts').insert({
      user_id: clientId,
      payment_intent_id: paymentIntent.id,
      amount: expectedAmount,
      status: 'pending',
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
