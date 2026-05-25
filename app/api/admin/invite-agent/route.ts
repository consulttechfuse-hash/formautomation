import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Get the current user (admin who is sending the invite)
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if current user is admin
    const { data: adminData } = await supabase
      .from('users')
      .select('role')
      .eq('id', currentUser.id)
      .single();

    if (adminData?.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can invite agents' }, { status: 403 });
    }

    // Check if user exists in auth
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const userExists = existingUsers?.users?.some(user => user.email === email);
    
    if (userExists) {
      // User exists - update their admin_id and send reset email
      const { data: { user } } = await supabase.auth.admin.getUserByEmail(email);
      
      if (user) {
        // Update admin_id for existing agent
        await supabase
          .from('users')
          .update({ admin_id: currentUser.id })
          .eq('id', user.id);
      }
      
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/set-password`
      });
      
      if (resetError) {
        return NextResponse.json({ error: resetError.message }, { status: 500 });
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Agent admin_id updated. Password reset email sent.'
      });
      
    } else {
      // New user - create agent with admin_id
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        email_confirm: true,
      });

      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 500 });
      }
      
      // Send invite email
      const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite`
      });

      if (inviteError) {
        return NextResponse.json({ error: inviteError.message }, { status: 500 });
      }
      
      // Create user record with admin_id set to the inviting admin
      if (newUser.user) {
        await supabase
          .from('users')
          .insert({
            id: newUser.user.id,
            email: email,
            role: 'agent',
            admin_id: currentUser.id,  // ← Set the inviting admin's ID
            status: 'pending',
            created_at: new Date().toISOString(),
            has_paid: false,
            has_consented: false,
            onboarding_complete: false,
            onboarding_submitted: false,
            photo_skipped: false,
            onboarding_locked: false
          });
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Agent invited successfully with admin_id assigned'
      });
    }

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
