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

    // Get current agent to decrement client count
    const { data: currentClient } = await supabase
      .from('users')
      .select('assigned_agent_id')
      .eq('id', clientId)
      .single();

    if (currentClient?.assigned_agent_id) {
      // Decrement old agent's client count
      const { data: oldAgent } = await supabase
        .from('users')
        .select('client_count')
        .eq('id', currentClient.assigned_agent_id)
        .single();
      
      if (oldAgent) {
        await supabase
          .from('users')
          .update({
            client_count: Math.max((oldAgent.client_count || 1) - 1, 0),
            updated_at: now,
          })
          .eq('id', currentClient.assigned_agent_id);
      }
    }

    // Update client in user_roles
    const { error: clientRoleError } = await supabase
      .from('user_roles')
      .update({
        assigned_agent_id: newAgentId,
        updated_at: now,
      })
      .eq('user_id', clientId);

    if (clientRoleError) {
      console.error('Error updating user_roles:', clientRoleError);
      return NextResponse.json({ error: 'Failed to reassign client' }, { status: 500 });
    }

    // Update client in users table
    await supabase
      .from('users')
      .update({
        assigned_agent_id: newAgentId,
        updated_at: now,
      })
      .eq('id', clientId);

    // Increment new agent's client count
    const { data: newAgent } = await supabase
      .from('users')
      .select('client_count')
      .eq('id', newAgentId)
      .single();

    if (newAgent) {
      await supabase
        .from('users')
        .update({
          client_count: (newAgent.client_count || 0) + 1,
          updated_at: now,
        })
        .eq('id', newAgentId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reassign error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
