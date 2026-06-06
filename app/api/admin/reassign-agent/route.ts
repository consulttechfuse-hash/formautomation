import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is admin
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (userRole?.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can reassign agents' }, { status: 403 });
    }

    const { clientId, newAgentId } = await request.json();

    if (!clientId || !newAgentId) {
      return NextResponse.json({ error: 'Client ID and new Agent ID are required' }, { status: 400 });
    }

    // Verify the new agent belongs to this admin
    const { data: agentCheck } = await supabase
      .from('user_roles')
      .select('id')
      .eq('role', 'agent')
      .eq('user_id', newAgentId)
      .eq('invited_by', user.id)
      .single();

    if (!agentCheck) {
      return NextResponse.json({ error: 'Agent not found under your admin' }, { status: 403 });
    }

    // Update client's assigned agent
    const { error: updateError } = await supabase
      .from('user_roles')
      .update({ assigned_agent_id: newAgentId })
      .eq('user_id', clientId)
      .eq('role', 'client');

    if (updateError) {
      return NextResponse.json({ error: 'Failed to reassign agent' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Agent reassigned successfully' });
  } catch (error) {
    console.error('Reassign agent error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
