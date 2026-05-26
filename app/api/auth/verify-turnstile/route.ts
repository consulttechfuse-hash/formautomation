import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
      console.error('TURNSTILE_SECRET_KEY not set');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const formData = new FormData();
    formData.append('secret', secret);
    formData.append('response', token);

    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const outcome = await result.json();

    if (outcome.success) {
      return NextResponse.json({ success: true });
    } else {
      console.error('Turnstile verification failed:', outcome['error-codes']);
      return NextResponse.json({ error: 'Security verification failed' }, { status: 400 });
    }
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
