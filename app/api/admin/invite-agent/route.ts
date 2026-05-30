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
    
    // First, check if user already exists in auth.users
    // We need to use service role to check users by email
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const existingAuthUser = users?.find(u => u.email === email);
    
    let userId = null;
    
    if (existingAuthUser) {
      // User exists in auth
      userId = existingAuthUser.id;
      
      // Update user_roles
      await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          email: email,
          role: 'agent',
          invited_by: session.user.id,
          assigned_admin_id: session.user.id,
          updated_at: new Date().toISOString(),
          invitation_token: invitationToken,
          invitation_expires_at: expiresAt.toISOString(),
        }, { onConflict: 'user_id' });
      
    } else {
      // Create new user in auth.users using admin API
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        email_confirm: false, // User must confirm email via invite link
        user_metadata: {
          role: 'agent',
          invited_by: session.user.id,
          invited_at: new Date().toISOString()
        }
      });
      
      if (createError) {
        console.error('Create user error:', createError);
        return NextResponse.json({ error: createError.message }, { status: 500 });
      }
      
      userId = newUser.user.id;
      
      // Create user_roles record
      await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
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
                <p>Click the link below to set up your password and complete your account:</p>
                <div style="text-align: center; margin: 20px 0;">
                  <a href="${inviteLink}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">Complete Registration</a>
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
      message: 'Agent invited successfully. User account created.',
      inviteLink: inviteLink 
    });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to invite agent: ' + (error instanceof Error ? error.message : 'Unknown error') }, { status: 500 });
  }
}
