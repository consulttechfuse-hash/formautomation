import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { adminId } = await request.json();
    const clientUserId = session.user.id;
    
    // CHECK: Is this client already assigned to a different admin?
    const { data: existingAssignment } = await supabase
      .from('user_roles')
      .select('assigned_admin_id')
      .eq('user_id', clientUserId)
      .eq('role', 'client')
      .single();
    
    if (existingAssignment && existingAssignment.assigned_admin_id) {
      // Get the current admin's email
      const { data: currentAdmin } = await supabase
        .from('user_roles')
        .select('email')
        .eq('user_id', existingAssignment.assigned_admin_id)
        .single();
      
      return NextResponse.json({ 
        error: `This client is already assigned to admin: ${currentAdmin?.email}. Assignment cannot be changed.`,
        currentAdmin: currentAdmin?.email
      }, { status: 409 });
    }
    
    // Update the client's assigned admin
    const { error: updateError } = await supabase
      .from('user_roles')
      .update({ 
        assigned_admin_id: adminId,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', clientUserId)
      .eq('role', 'client');
    
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Admin assigned successfully'
    });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to assign admin' }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
