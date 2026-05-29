import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if current user is owner
    const { data: currentUser } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();
    
    if (currentUser?.role !== 'owner') {
      return NextResponse.json({ error: 'Only owners can invite admins' }, { status: 403 });
    }
    
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    const invitationToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    // Check if user already exists in user_roles
    const { data: existingUser } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('email', email)
      .single();
    
    if (existingUser?.user_id) {
      // User exists, update role
      await supabase
        .from('user_roles')
        .update({ role: 'admin', invited_by: session.user.id })
        .eq('email', email);
    } else {
      // Create invitation record
      await supabase
        .from('user_roles')
        .insert({
          email: email,
          role: 'admin',
          invited_by: session.user.id,
          invitation_token: invitationToken,
          invitation_expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString(),
        });
    }
    
    // Send invitation email
    const inviteLink = `https://techfuseconsult.online/accept-invite?token=${invitationToken}`;
    
    // TODO: Send email with Resend - add this later
    console.log('Invite link:', inviteLink);
    
    return NextResponse.json({ success: true, message: 'Admin invited successfully', inviteLink });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to invite admin' }, { status: 500 });
  }
}
