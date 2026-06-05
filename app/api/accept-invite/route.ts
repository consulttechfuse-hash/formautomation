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

    // Verify the invitation token in user_roles
    const { data: invitation, error: inviteError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('invitation_token', token)
      .is('user_id', null)
      .is('accepted_at', null)
      .gt('invitation_expires_at', new Date().toISOString())
      .single();

    if (inviteError || !invitation) {
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404 });
    }

    // Check if user exists in Supabase Auth
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const existing = existingUser.users.find((u: any) => u.email === email);

    let userId: string;

    if (existing) {
      userId = existing.id;
      await supabaseAdmin.auth.admin.updateUserById(userId, { password });
    } else {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
        },
      });

      if (createError) {
        console.error('User creation error:', createError);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }

      userId = newUser.user.id;
    }

    // Update user_roles table
    const { error: updateRoleError } = await supabase
      .from('user_roles')
      .update({
        user_id: userId,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        accepted_at: new Date().toISOString(),
        invite_accepted_at: new Date().toISOString(),
      })
      .eq('invitation_token', token);

    if (updateRoleError) {
      console.error('user_roles update error:', updateRoleError);
    }

    // Update or insert into public.users table
    const { data: existingUserRecord } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (!existingUserRecord) {
      await supabase
        .from('users')
        .insert({
          id: userId,
          email: email,
          role: role,
          status: 'active',
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
          accepted_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        });
    } else {
      await supabase
        .from('users')
        .update({
          email: email,
          role: role,
          status: 'active',
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
          accepted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
    }

    // Sign the user in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error('Sign in error:', signInError);
      return NextResponse.json({ 
        success: true, 
        userId, 
        role,
        requiresLogin: true,
        message: 'Account created. Please log in.'
      });
    }

    return NextResponse.json({ success: true, userId, role });
  } catch (error) {
    console.error('Accept invite error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
