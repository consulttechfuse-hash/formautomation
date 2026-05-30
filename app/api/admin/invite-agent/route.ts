import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the logged-in user's email directly from session
    const loggedInUserEmail = session.user.email;
    const loggedInUserId = session.user.id;
    
    // Check if the logged-in user is an admin
    const { data: currentUser, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('email', loggedInUserEmail)
      .single();
    
    if (roleError || !currentUser) {
      return NextResponse.json({ error: 'User role not found' }, { status: 403 });
    }
    
    if (currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can invite agents' }, { status: 403 });
    }
    
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    // Create ADMIN client with service role key (for creating users)
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // CHECK: Does user already exist in auth.users?
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    const existingAuthUser = users?.find(u => u.email === email);
    
    let userId = null;
    
    if (existingAuthUser) {
      userId = existingAuthUser.id;
    } else {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        email_confirm: true,
        user_metadata: {
          role: 'agent',
          invited_by: loggedInUserId
        }
      });
      
      if (createError) {
        console.error('Create user error:', createError);
        return NextResponse.json({ error: createError.message }, { status: 500 });
      }
      
      userId = newUser.user.id;
    }
    
    const invitationToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    const now = new Date().toISOString();
    
    // Check if user already exists in user_roles
    const { data: existingUserRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('email', email)
      .single();
    
    if (existingUserRole) {
      await supabase
        .from('user_roles')
        .update({
          user_id: userId,
          role: 'agent',
          invited_by: loggedInUserId,
          assigned_admin_id: loggedInUserId,
          invitation_token: invitationToken,
          invitation_expires_at: expiresAt.toISOString(),
          invite_sent_at: now,
          accepted_at: null,
          updated_at: now
        })
        .eq('email', email);
    } else {
      await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          email: email,
          role: 'agent',
          invited_by: loggedInUserId,
          assigned_admin_id: loggedInUserId,
          invitation_token: invitationToken,
          invitation_expires_at: expiresAt.toISOString(),
          invite_sent_at: now,
          created_at: now,
        });
    }
    
    // Send custom invitation email via Resend
    const inviteLink = `https://techfuseconsult.online/set-password?token=${invitationToken}&email=${encodeURIComponent(email)}&type=invite`;
    
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
              <p>You have been invited to become an <strong>Agent</strong> on the Techfuse DocControl platform.</p>
              <p>Click the link below to create your password and set up your account:</p>
              <div style="text-align: center; margin: 20px 0;">
                <a href="${inviteLink}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">Create Account & Set Password</a>
              </div>
              <p>This link expires in 7 days.</p>
              <p>If you did not expect this invitation, you can ignore this email.</p>
            </div>
            <div style="padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
              <p>Techfuse Consulting - Secure Document Control Service</p>
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
    return NextResponse.json({ error: 'Failed to invite agent: ' + (error instanceof Error ? error.message : 'Unknown error') }, { status: 500 });
  }
}
