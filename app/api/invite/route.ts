import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get current user's role
    const { data: currentUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    const { email, role, assigned_to_id } = await request.json();
    
    // Permission checks
    if (role === 'admin' && currentUser?.role !== 'owner') {
      return NextResponse.json({ error: 'Only owners can invite admins' }, { status: 403 });
    }
    
    if (role === 'agent' && currentUser?.role !== 'admin' && currentUser?.role !== 'owner') {
      return NextResponse.json({ error: 'Only admins or owners can invite agents' }, { status: 403 });
    }
    
    if (role === 'agent' && !assigned_to_id && currentUser?.role === 'admin') {
      // If admin invites agent, assign to themselves
      const assignedTo = assigned_to_id || session.user.id;
    }
    
    // Create invitation token
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry
    
    // Store invitation
    const { data: invitation, error } = await supabase
      .from('invitations')
      .insert({
        email,
        role,
        invited_by: session.user.id,
        assigned_to_id: role === 'agent' ? (assigned_to_id || session.user.id) : null,
        token,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Send invitation email
    const inviteLink = `https://techfuseconsult.online/accept-invite?token=${token}`;
    
    // TODO: Send email using Resend
    // await sendInvitationEmail(email, inviteLink, role);
    
    return NextResponse.json({ success: true, inviteLink });
  } catch (error) {
    console.error('Invitation error:', error);
    return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
  }
}
