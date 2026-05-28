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

    // Get the current user (admin sending the invite)
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !currentUser) {
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
    const userExists = existingUsers?.users?.some(u => u.email === email);
    
    if (userExists) {
      // User exists - update role to agent in BOTH tables
      const { data: { user } } = await supabase.auth.admin.getUserByEmail(email);
      
      if (user) {
        // Update users table
        await supabase
          .from('users')
          .update({ role: 'agent', admin_id: currentUser.id })
          .eq('id', user.id);
        
        // Update or insert into user_roles table
        const { data: existingRole } = await supabase
          .from('user_roles')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (existingRole) {
          await supabase
            .from('user_roles')
            .update({ role: 'agent' })
            .eq('user_id', user.id);
        } else {
          await supabase
            .from('user_roles')
            .insert({
              user_id: user.id,
              email: email,
              role: 'agent',
              created_at: new Date().toISOString(),
            });
        }
      }
      
      // Send password reset email
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/set-password`
      });
      
      return NextResponse.json({ 
        success: true, 
        message: 'Agent role updated in both tables. Password reset email sent.'
      });
      
    } else {
      // Create new user in auth
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        email_confirm: true,
      });

      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 500 });
      }
      
      // Send invite email
      await supabase.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite`
      });
      
      // Insert into users table
      await supabase
        .from('users')
        .insert({
          id: newUser.user.id,
          email: email,
          role: 'agent',
          admin_id: currentUser.id,
          status: 'pending',
          created_at: new Date().toISOString(),
        });
      
      // Insert into user_roles table
      await supabase
        .from('user_roles')
        .insert({
          user_id: newUser.user.id,
          email: email,
          role: 'agent',
          created_at: new Date().toISOString(),
        });
      
      return NextResponse.json({ 
        success: true, 
        message: 'Agent invited successfully. Records created in both tables.'
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
