import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { sendInvitationEmail } from '@/lib/email';

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
      .select('role, email')
      .eq('user_id', session.user.id)
      .single();
    
    if (currentUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can invite agents' }, { status: 403 });
    }
    
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    // Use built-in crypto.randomUUID()
    const invitationToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    // Create invitation record
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
    
    // Send invitation email
    const inviteLink = `https://techfuseconsult.online/accept-invite?token=${invitationToken}`;
    
    const emailResult = await sendInvitationEmail({
      toEmail: email,
      role: 'agent',
      inviteLink: inviteLink,
      invitedByEmail: currentUser?.email,
      expiresAt: expiresAt,
    });
    
    if (!emailResult.success) {
      console.error('Email send failed:', emailResult.error);
    }
    
    return NextResponse.json({ success: true, message: 'Agent invited successfully', inviteLink });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to invite agent' }, { status: 500 });
  }
}
