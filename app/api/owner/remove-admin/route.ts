import { createRouteHandlerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { adminId } = await request.json();

    if (!adminId) {
      return NextResponse.json({ error: 'Admin ID is required' }, { status: 400 });
    }

    // Create Supabase client with cookies
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get the current user from the session
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if current user is owner
    const { data: ownerData, error: ownerError } = await supabase
      .from('users')
      .select('role')
      .eq('id', currentUser.id)
      .single();

    if (ownerError || ownerData?.role !== 'owner') {
      return NextResponse.json({ error: 'Only owners can remove admins' }, { status: 403 });
    }

    // Don't allow removing yourself
    if (adminId === currentUser.id) {
      return NextResponse.json({ error: 'Cannot remove yourself as admin' }, { status: 400 });
    }

    // Update user role from 'admin' to 'client'
    const { error: updateError } = await supabase
      .from('users')
      .update({ role: 'client' })
      .eq('id', adminId)
      .eq('role', 'admin');

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Admin removed successfully' });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
