import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Regular client for reading user_roles (uses anon key)
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
      console.error('Role check error:', roleError);
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
    
    // Use Supabase's built-in invite user functionality with admin client
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: 'https://techfuseconsult.online/accept-invite'
    });
    
    if (inviteError) {
      console.error('Invite error:', inviteError);
      return NextResponse.json({ error: inviteError.message }, { status: 500 });
    }
    
    const userId = inviteData?.user?.id;
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
          invited_by: loggedInUserId,
          assigned_admin_id: loggedInUserId,
          invitation_token: invitationToken,
          invitation_expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('email', email);
    } else {
      // Create user_roles record linked to the new auth user
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
      message: 'Invitation sent successfully'
    });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to invite agent: ' + (error instanceof Error ? error.message : 'Unknown error') }, { status: 500 });
  }
}
