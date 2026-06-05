import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { clientId, newAgentId, adminId } = await request.json();

    if (!clientId || !newAgentId || !adminId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify admin has permission
    const { data: adminCheck, error: adminError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', adminId)
      .single();

    if (adminError) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 403 });
    }
    
    if (adminCheck?.role !== 'admin' && adminCheck?.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const now = new Date().toISOString();

    // Update client in user_roles
    const { error: updateError } = await supabase
      .from('user_roles')
      .update({
        assigned_agent_id: newAgentId,
        updated_at: now,
      })
      .eq('user_id', clientId);

    if (updateError) {
      console.error('Error reassigning client:', updateError);
      return NextResponse.json({ error: 'Failed to reassign client' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reassign error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
