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
    const { data: existingAuthUser } = await supabase.auth.admin.getUserByEmail(email);
    
    let userId = null;
    
    if (existingAuthUser?.user) {
      // User exists in auth
      userId = existingAuthUser.user.id;
      
      // Update user_roles with existing user_id
      await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          email: email,
          role: 'agent',
          invited_by: session.user.id,
          assigned_admin_id: session.user.id,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
      
    } else {
      // Create invitation record without user_id (pending)
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
    
    // Try to send email but don't fail if it doesn't work
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
          subject: 'You have been invited as an Agent',
          html: `<p>Click <a href="${inviteLink}">here</a> to accept your invitation.</p>`,
        }),
      });
    } catch (emailError) {
      console.error('Email send failed:', emailError);
      // Don't fail the request
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Invitation created successfully',
      inviteLink: inviteLink 
    });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to invite agent: ' + (error instanceof Error ? error.message : 'Unknown error') }, { status: 500 });
  }
}
