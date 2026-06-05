import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const clientId = body.clientId;
    const adminId = body.adminId;

    if (!clientId || !adminId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get all agents under this admin from user_roles
    const { data: agents, error: agentsError } = await supabase
      .from('user_roles')
      .select('user_id, email')
      .eq('role', 'agent')
      .eq('assigned_admin_id', adminId)
      .not('user_id', 'is', null);

    if (agentsError) {
      console.error('Error fetching agents:', agentsError);
      return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
    }

    if (!agents || agents.length === 0) {
      return NextResponse.json({ error: 'No agents found under this admin' }, { status: 404 });
    }

    // Pick the first agent (you can enhance round robin later)
    const selectedAgent = agents[0];
    const now = new Date().toISOString();

    // Update client with assigned agent
    const { error: updateError } = await supabase
      .from('user_roles')
      .update({
        assigned_agent_id: selectedAgent.user_id,
        updated_at: now,
      })
      .eq('user_id', clientId);

    if (updateError) {
      console.error('Error updating client:', updateError);
      return NextResponse.json({ error: 'Failed to assign agent' }, { status: 500 });
    }

    console.log(`Client ${clientId} assigned to agent ${selectedAgent.email}`);

    return NextResponse.json({
      success: true,
      assignedAgent: {
        id: selectedAgent.user_id,
        email: selectedAgent.email,
      },
    });
  } catch (error) {
    console.error('Round robin error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
