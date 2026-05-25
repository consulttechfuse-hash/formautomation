import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Techfuse DocControl <onboarding@resend.dev>',
      to: ['techbatur@gmail.com'],
      subject: 'Supabase + Resend Test',
      html: '<h1>Test Successful</h1><p>Your Resend integration is working correctly.</p>',
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
