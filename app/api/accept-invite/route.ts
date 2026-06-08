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

    // 1. Verify the invitation token
    const { data: invitation, error: inviteError } = await supabase
      .from('user_roles')
      .select('id, role, assigned_admin_id, invited_by')
      .eq('invitation_token', token)
      .is('user_id', null)
      .is('accepted_at', null)
      .gt('invitation_expires_at', new Date().toISOString())
      .single();

    if (inviteError || !invitation) {
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404 });
    }

    // 2. Check if user already exists in auth
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const existing = existingUser.users.find((u: any) => u.email === email);

    let userId: string;
    let isExistingUser = false;

    if (existing) {
      userId = existing.id;
      isExistingUser = true;
      // Update password for existing user
      await supabaseAdmin.auth.admin.updateUserById(userId, { password });
      console.log(`Existing user found: ${userId} for ${email}`);
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
      console.log(`New user created: ${userId} for ${email}`);
    }

    // 3. PERMANENT FIX: Delete ANY existing user_roles records for this email (client, agent, etc.)
    // This prevents role conflicts
    const { data: existingRoles } = await supabase
      .from('user_roles')
      .select('id, role')
      .eq('email', email)
      .neq('invitation_token', token); // Don't delete the current invitation

    if (existingRoles && existingRoles.length > 0) {
      console.log(`Found ${existingRoles.length} existing role(s) for ${email}:`, existingRoles.map(r => r.role));
      
      // Delete all existing roles for this email
      for (const roleRecord of existingRoles) {
        await supabase
          .from('user_roles')
          .delete()
          .eq('id', roleRecord.id);
        console.log(`Deleted existing role ${roleRecord.role} for ${email}`);
      }
    }

    // 4. Update the invitation record (now the ONLY record for this email)
    const { error: updateRoleError } = await supabase
      .from('user_roles')
      .update({
        user_id: userId,
        role: role, // 'agent' from invitation
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        accepted_at: new Date().toISOString(),
        invite_accepted_at: new Date().toISOString(),
      })
      .eq('invitation_token', token);

    if (updateRoleError) {
      console.error('user_roles update error:', updateRoleError);
      return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
    }

    // 5. Update or insert into public.users table (replace role)
    const { data: existingUserRecord } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (!existingUserRecord) {
      await supabase
        .from('users')
        .insert({
          id: userId,
          email: email,
          role: role, // Use the invited role (agent)
          status: 'active',
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
          accepted_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        });
    } else {
      // Update existing user record - CHANGE THEIR ROLE to the invited role
      await supabase
        .from('users')
        .update({
          email: email,
          role: role, // OVERWRITE old role with new invited role
          status: 'active',
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
          accepted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
    }

    console.log(`Successfully accepted invite for ${email} as role: ${role}`);

    // 6. Sign the user in
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

export const dynamic = "force-dynamic";
