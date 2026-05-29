import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
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
    
    // Check if user already exists in auth
    const { data: existingUser } = await supabase.auth.admin.getUserByEmail(email);
    
    const invitationToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    if (existingUser?.user) {
      // User exists, just update role
      await supabase
        .from('user_roles')
        .update({ role: 'admin', invited_by: session.user.id })
        .eq('user_id', existingUser.user.id);
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
    
    // TODO: Send email with Resend
    // await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     from: 'noreply@techfuseconsult.online',
    //     to: email,
    //     subject: 'You have been invited as an Admin',
    //     html: `<p>Click <a href="${inviteLink}">here</a> to accept your invitation.</p>`
    //   })
    // });
    
    return NextResponse.json({ success: true, message: 'Admin invited successfully' });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to invite admin' }, { status: 500 });
  }
}
