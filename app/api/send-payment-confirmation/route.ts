import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getSASTISOString } from '@/lib/timezone';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, clientId, status, adminNotes } = await request.json();
    
    const supabase = await createClient();
    
    // Use SAST timestamp
    const sastTimestamp = getSASTISOString();
    
    // Update payment request with SAST timestamp
    if (status === 'approved') {
      await supabase
        .from('manual_payment_requests')
        .update({ 
          status: 'confirmed', 
          confirmed_at: sastTimestamp
        })
        .eq('client_id', clientId);
      
      await supabase
        .from('user_roles')
        .update({ has_paid: true, paid_at: sastTimestamp })
        .eq('user_id', clientId);
    } else if (status === 'rejected') {
      await supabase
        .from('manual_payment_requests')
        .update({ 
          status: 'rejected', 
          admin_notes: adminNotes,
          reviewed_at: sastTimestamp
        })
        .eq('client_id', clientId);
    }
    
    // Send email
    const subject = status === 'approved' 
      ? 'Payment Confirmed - TechFuse DocControl'
      : 'Payment Update - TechFuse DocControl';
    
    const message = status === 'approved'
      ? `Your payment has been confirmed on ${new Date(sastTimestamp).toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })}. You can now proceed with your application.`
      : `Your payment was not approved on ${new Date(sastTimestamp).toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })}. Reason: ${adminNotes || 'Please contact support.'}`;
    
    await resend.emails.send({
      from: 'TechFuse <noreply@techfuseconsult.online>',
      to: email,
      subject: subject,
      html: `<p>${message}</p>`
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
