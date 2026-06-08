import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { token, email, firstName, lastName, phoneNumber, password, role } = await request.json();

    if (!token || !email || !firstName || !lastName || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();

    // 1. Verify invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('user_roles')
      .select('id, role, assigned_admin_id, invited_by')
      .eq('invitation_token', token)
      .is('accepted_at', null)
      .gt('invitation_expires_at', new Date().toISOString())
      .single();

    if (inviteError || !invitation) {
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404 });
    }

    // 2. Check if user exists
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = users.find((u: any) => u.email === email);
    
    let userId: string;
    let isNewUser = false;

    if (existingUser) {
      userId = existingUser.id;
      // Update password for existing user
      await supabaseAdmin.auth.admin.updateUserById(userId, { password });
      
      // ALSO clear any existing session to force new login with correct role
      await supabaseAdmin.auth.admin.signOut(userId);
    } else {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { first_name: firstName, last_name: lastName, phone_number: phoneNumber },
      });
      
      if (createError) {
        return NextResponse.json({ error: 'Failed to create user: ' + createError.message }, { status: 500 });
      }
      
      userId = newUser.user.id;
      isNewUser = true;
    }

    // 3. DELETE any existing role for this email (prevent conflicts)
    await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('email', email)
      .neq('id', invitation.id);

    // 4. UPDATE the invitation record to become the user's role
    const { error: updateError } = await supabaseAdmin
      .from('user_roles')
      .update({
        user_id: userId,
        role: role,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        accepted_at: new Date().toISOString(),
        invite_accepted_at: new Date().toISOString(),
      })
      .eq('id', invitation.id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update user role: ' + updateError.message }, { status: 500 });
    }

    // 5. Update users table
    await supabaseAdmin
      .from('users')
      .upsert({
        id: userId,
        email: email,
        role: role,
        status: 'active',
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    // 6. Sign the user in (this creates a new session with correct role)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      // If sign in fails, return success but tell client to redirect to login
      return NextResponse.json({ 
        success: true, 
        userId, 
        role,
        requiresLogin: true,
        redirectTo: role === 'agent' ? '/agent/dashboard' : '/admin/dashboard'
      });
    }

    // Success - return role so frontend can redirect
    return NextResponse.json({ 
      success: true, 
      userId, 
      role,
      redirectTo: role === 'agent' ? '/agent/dashboard' : '/admin/dashboard'
    });
    
  } catch (error) {
    console.error('Accept invite error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
