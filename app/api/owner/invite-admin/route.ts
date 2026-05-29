import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { data: currentUser } = await supabase
      .from('user_roles')
      .select('role, email')
      .eq('user_id', session.user.id)
      .single();
    
    if (currentUser?.role !== 'owner') {
      return NextResponse.json({ error: 'Only owners can invite admins' }, { status: 403 });
    }
    
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    const invitationToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    // Create invitation record
    const { error: insertError } = await supabase
      .from('user_roles')
      .insert({
        email: email,
        role: 'admin',
        invited_by: session.user.id,
        invitation_token: invitationToken,
        invitation_expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      });
    
    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
    }
    
    // Send email
    const inviteLink = `https://techfuseconsult.online/accept-invite?token=${invitationToken}`;
    
    console.log('Attempting to send email to:', email);
    console.log('Invite link:', inviteLink);
    console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
    
    try {
      const emailResult = await resend.emails.send({
        from: 'Techfuse <noreply@techfuseconsult.online>',
        to: email,
        subject: 'You have been invited as an Admin - Techfuse DocControl',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #1e3a8a; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">Techfuse Consulting</h1>
              <p>Admin Invitation</p>
            </div>
            <div style="padding: 20px; border: 1px solid #e5e7eb;">
              <p>You have been invited to become an <strong>Admin</strong>.</p>
              <p>Click the link below to accept:</p>
              <a href="${inviteLink}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; margin: 20px 0;">Accept Invitation</a>
              <p>This link expires in 7 days.</p>
            </div>
          </div>
        `,
      });
      
      console.log('Email send result:', emailResult);
      
      if (emailResult.error) {
        console.error('Resend error details:', emailResult.error);
        return NextResponse.json({ 
          success: true, 
          message: 'Invitation created but email failed. Check Resend logs.',
          emailError: emailResult.error 
        });
      }
      
      return NextResponse.json({ success: true, message: 'Admin invited and email sent' });
      
    } catch (emailError) {
      console.error('Email sending exception:', emailError);
      return NextResponse.json({ 
        success: true, 
        message: 'Invitation created but email failed to send',
        error: String(emailError)
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to invite admin' }, { status: 500 });
  }
}
