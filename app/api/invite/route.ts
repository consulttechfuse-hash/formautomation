import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get current user's role
    const { data: currentUser } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();
    
    const { email, role, assigned_to_id } = await request.json();
    
    // Permission checks
    if (role === 'admin' && currentUser?.role !== 'owner') {
      return NextResponse.json({ error: 'Only owners can invite admins' }, { status: 403 });
    }
    
    if (role === 'agent' && currentUser?.role !== 'admin' && currentUser?.role !== 'owner') {
      return NextResponse.json({ error: 'Only admins or owners can invite agents' }, { status: 403 });
    }
    
    // Create invitation token using built-in crypto
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    // Store invitation in user_roles table
    const { error } = await supabase
      .from('user_roles')
      .insert({
        email,
        role,
        invited_by: session.user.id,
        assigned_admin_id: role === 'agent' ? (assigned_to_id || session.user.id) : null,
        invitation_token: token,
        invitation_expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      });
    
    if (error) throw error;
    
    // Send invitation email
    const inviteLink = `https://techfuseconsult.online/accept-invite?token=${token}`;
    
    console.log('Invite link:', inviteLink);
    
    return NextResponse.json({ success: true, inviteLink });
  } catch (error) {
    console.error('Invitation error:', error);
    return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
