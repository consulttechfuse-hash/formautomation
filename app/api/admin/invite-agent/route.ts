import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if current user is admin
    const { data: currentUser } = await supabase
      .from('user_roles')
      .select('role, email, user_id')
      .eq('user_id', session.user.id)
      .single();
    
    if (currentUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can invite agents' }, { status: 403 });
    }
    
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    const invitationToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    // Check if user already exists in user_roles
    const { data: existingUser } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('email', email)
      .single();
    
    if (existingUser?.user_id) {
      // User already exists, update role to agent
      await supabase
        .from('user_roles')
        .update({
          role: 'agent',
          invited_by: session.user.id,
          assigned_admin_id: session.user.id,
          updated_at: new Date().toISOString()
        })
        .eq('email', email);
    } else {
      // Create invitation record (user will be created when they accept)
      await supabase
        .from('user_roles')
        .insert({
          email: email,
          role: 'agent',
          invited_by: session.user.id,
          assigned_admin_id: session.user.id,
          invitation_token: invitationToken,
          invitation_expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString(),
        });
    }
    
    const inviteLink = `https://techfuseconsult.online/accept-invite?token=${invitationToken}`;
    
    // Send invitation email
    try {
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
                <p>Click the link below to accept your invitation:</p>
                <div style="text-align: center; margin: 20px 0;">
                  <a href="${inviteLink}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">Accept Invitation</a>
                </div>
                <p>This link expires in 7 days.</p>
                <p>If you did not expect this invitation, you can ignore this email.</p>
              </div>
            </div>
          `,
        }),
      });
    } catch (emailError) {
      console.error('Email send failed:', emailError);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Invitation sent successfully',
      inviteLink: inviteLink 
    });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to invite agent: ' + (error instanceof Error ? error.message : 'Unknown error') }, { status: 500 });
  }
}
