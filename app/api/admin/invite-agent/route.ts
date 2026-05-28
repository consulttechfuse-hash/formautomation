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

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
    const existingUser = existingUsers?.users?.find(u => u.email === email);
    
    if (existingUser) {
      // User exists - update role to agent
      await supabase
        .from('users')
        .update({ role: 'agent', admin_id: currentUser.id })
        .eq('id', existingUser.id);
      
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', existingUser.id)
        .single();
      
      if (existingRole) {
        await supabase
          .from('user_roles')
          .update({ role: 'agent' })
          .eq('user_id', existingUser.id);
      } else {
        await supabase
          .from('user_roles')
          .insert({
            user_id: existingUser.id,
            email: email,
            role: 'agent',
            created_at: new Date().toISOString(),
          });
      }
      
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/set-password`
      });
      
      return NextResponse.json({ success: true, message: 'Agent role updated' });
      
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        email_confirm: true,
      });

      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 500 });
      }
      
      await supabase.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite`
      });
      
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
      
      await supabase
        .from('user_roles')
        .insert({
          user_id: newUser.user.id,
          email: email,
          role: 'agent',
          created_at: new Date().toISOString(),
        });
      
      return NextResponse.json({ success: true, message: 'Agent invited successfully' });
    }

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
