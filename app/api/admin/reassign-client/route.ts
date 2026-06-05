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

    if (adminError || (adminCheck?.role !== 'admin' && adminCheck?.role !== 'owner')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const now = new Date().toISOString();

    // Update client's assigned agent
    const { error: clientError } = await supabase
      .from('user_roles')
      .update({
        assigned_agent_id: newAgentId,
        updated_at: now,
      })
      .eq('user_id', clientId);

    if (clientError) {
      return NextResponse.json({ error: 'Failed to reassign client' }, { status: 500 });
    }

    // Update users table
    await supabase
      .from('users')
      .update({
        assigned_agent_id: newAgentId,
        updated_at: now,
      })
      .eq('id', clientId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
