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
    
    // Check if the logged-in user is an admin by querying user_roles with their email
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
    
    // Create ADMIN client with service role key
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // CHECK: Does user already exist in auth.users?
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    const existingAuthUser = users?.find(u => u.email === email);
    
    if (existingAuthUser) {
      // User already exists - return error to admin
      return NextResponse.json({ 
        error: `User with email ${email} already exists. Please use a different email address.` 
      }, { status: 409 });
    }
    
    // CHECK: Does user already have a pending invitation in user_roles?
    const { data: existingInvite } = await supabase
      .from('user_roles')
      .select('id, accepted_at')
      .eq('email', email)
      .eq('role', 'agent')
      .single();
    
    if (existingInvite && !existingInvite.accepted_at) {
      return NextResponse.json({ 
        error: `A pending invitation already exists for ${email}. Please wait for them to accept or cancel the existing invitation.` 
      }, { status: 409 });
    }
    
    // Create the user in auth.users with invite
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: 'https://techfuseconsult.online/set-password'
    });
    
    if (inviteError) {
      console.error('Invite error:', inviteError);
      return NextResponse.json({ error: inviteError.message }, { status: 500 });
    }
    
    const userId = inviteData?.user?.id;
    const invitationToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    // Create or update user_roles record
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
          accepted_at: null,
          updated_at: new Date().toISOString()
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
          created_at: new Date().toISOString(),
        });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Invitation sent successfully to ${email}`
    });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to invite agent: ' + (error instanceof Error ? error.message : 'Unknown error') }, { status: 500 });
  }
}
