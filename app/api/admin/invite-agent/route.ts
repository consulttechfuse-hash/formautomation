import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if logged-in user is admin
    const { data: currentUser, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    if (roleError || !currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can invite agents' }, { status: 403 });
    }
    
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    // Check if email already exists as an agent under this admin
    const { data: existingAgent } = await supabase
      .from('user_roles')
      .select('id, user_id, accepted_at')
      .eq('email', email)
      .eq('role', 'agent')
      .eq('assigned_admin_id', user.id)
      .single();
    
    if (existingAgent) {
      if (existingAgent.accepted_at) {
        return NextResponse.json({ error: 'User is already an active agent under you' }, { status: 409 });
      } else {
        return NextResponse.json({ error: 'An invitation has already been sent to this email' }, { status: 409 });
      }
    }
    
    // Check if email is already assigned to a different admin
    const { data: otherAdminAgent } = await supabase
      .from('user_roles')
      .select('assigned_admin_id')
      .eq('email', email)
      .eq('role', 'agent')
      .single();
    
    if (otherAdminAgent) {
      return NextResponse.json({ error: 'This agent is already assigned to another admin' }, { status: 409 });
    }
    
    // Create invitation token
    const invitationToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    const now = new Date().toISOString();
    
    // Create user_roles entry for the agent
    const { error: insertError } = await supabase
      .from('user_roles')
      .insert({
        email: email,
        role: 'agent',
        invited_by: user.id,
        assigned_admin_id: user.id,
        invitation_token: invitationToken,
        invitation_expires_at: expiresAt.toISOString(),
        invite_sent_at: now,
        created_at: now,
        user_id: null,
        accepted_at: null,
      });
    
    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
    }
    
    // Send email using Resend with the correct invite link
    const inviteLink = `https://techfuseconsult.online/invite-signup?token=${invitationToken}`;
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    
    await fetch('https://api.resend.com/emails', {
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
              <p>You have been invited to become an <strong>Agent</strong>.</p>
              <p>Click the link below to complete your registration:</p>
              <div style="text-align: center; margin: 20px 0;">
                <a href="${inviteLink}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">Complete Registration</a>
              </div>
              <p>This link expires in 7 days.</p>
            </div>
          </div>
        `,
      }),
    });
    
    return NextResponse.json({ 
      success: true, 
      message: `Invitation sent successfully to ${email}`
    });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to invite agent' }, { status: 500 });
  }
}
