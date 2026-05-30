import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log('=== INVITE AGENT API CALLED ===');
    
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log('No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('Session user:', session.user.email);
    
    // Check if current user is admin
    const { data: currentUser } = await supabase
      .from('user_roles')
      .select('role, email')
      .eq('user_id', session.user.id)
      .single();
    
    console.log('Current user role:', currentUser?.role);
    
    if (currentUser?.role !== 'admin') {
      console.log('User is not admin');
      return NextResponse.json({ error: 'Only admins can invite agents' }, { status: 403 });
    }
    
    const { email } = await request.json();
    console.log('Inviting email:', email);
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    const invitationToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    // Create invitation record
    const { data: insertData, error: insertError } = await supabase
      .from('user_roles')
      .insert({
        email: email,
        role: 'agent',
        invited_by: session.user.id,
        assigned_admin_id: session.user.id,
        invitation_token: invitationToken,
        invitation_expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      })
      .select();
    
    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ error: 'Failed to create invitation: ' + insertError.message }, { status: 500 });
    }
    
    console.log('Invitation created:', insertData);
    
    // Send invitation email using Resend directly (same as working flow)
    const inviteLink = `https://techfuseconsult.online/accept-invite?token=${invitationToken}`;
    console.log('Invite link:', inviteLink);
    
    // Use the same Resend configuration that works for magic links
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    console.log('RESEND_API_KEY exists:', !!RESEND_API_KEY);
    
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Techfuse <noreply@techfuseconsult.online>',
        to: email,
        subject: 'You have been invited as an Agent - Techfuse DocControl',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #1e3a8a; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">Techfuse Consulting</h1>
              <p>Agent Invitation</p>
            </div>
            <div style="padding: 20px; border: 1px solid #e5e7eb;">
              <p>You have been invited to become an <strong>Agent</strong> on the Techfuse DocControl platform.</p>
              <p>Click the link below to accept your invitation:</p>
              <div style="text-align: center; margin: 20px 0;">
                <a href="${inviteLink}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">Accept Invitation</a>
              </div>
              <p>This link expires on ${expiresAt.toLocaleDateString()}.</p>
              <p>If you did not expect this invitation, you can ignore this email.</p>
            </div>
          </div>
        `,
      }),
    });
    
    const emailResult = await emailResponse.json();
    console.log('Email send result:', emailResult);
    
    if (!emailResponse.ok) {
      console.error('Resend error:', emailResult);
      return NextResponse.json({ 
        success: true, 
        message: 'Invitation created but email failed. Use this link: ' + inviteLink,
        inviteLink: inviteLink
      });
    }
    
    return NextResponse.json({ success: true, message: 'Agent invited successfully', inviteLink });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to invite agent: ' + (error instanceof Error ? error.message : 'Unknown error') }, { status: 500 });
  }
}
