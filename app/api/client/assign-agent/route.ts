import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { clientId, adminId } = await request.json();

    if (!clientId || !adminId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get all active agents under this admin
    const { data: agents, error: agentsError } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        email,
        users!inner (
          is_available,
          is_on_leave,
          last_assigned_at,
          max_clients,
          client_count
        )
      `)
      .eq('role', 'agent')
      .eq('assigned_admin_id', adminId)
      .not('user_id', 'is', null);

    if (agentsError) {
      console.error('Error fetching agents:', agentsError);
      return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
    }

    // Filter available agents
    const availableAgents = agents.filter(agent => {
      const userData = agent.users;
      return userData?.is_available !== false && 
             userData?.is_on_leave !== true;
    });

    if (availableAgents.length === 0) {
      return NextResponse.json({ error: 'No available agents found' }, { status: 404 });
    }

    // Sort by last_assigned_at (oldest first = round robin)
    availableAgents.sort((a, b) => {
      const dateA = a.users?.last_assigned_at ? new Date(a.users.last_assigned_at).getTime() : 0;
      const dateB = b.users?.last_assigned_at ? new Date(b.users.last_assigned_at).getTime() : 0;
      return dateA - dateB;
    });

    // Select the agent with oldest assignment
    const selectedAgent = availableAgents[0];
    const now = new Date().toISOString();

    // Update client with assigned agent
    const { error: clientUpdateError } = await supabase
      .from('user_roles')
      .update({
        assigned_agent_id: selectedAgent.user_id,
        updated_at: now,
      })
      .eq('user_id', clientId);

    if (clientUpdateError) {
      console.error('Error updating client:', clientUpdateError);
      return NextResponse.json({ error: 'Failed to assign agent' }, { status: 500 });
    }

    // Update users table
    await supabase
      .from('users')
      .update({
        assigned_agent_id: selectedAgent.user_id,
        updated_at: now,
      })
      .eq('id', clientId);

    // Update agent's last_assigned_at timestamp
    await supabase
      .from('users')
      .update({
        last_assigned_at: now,
      })
      .eq('id', selectedAgent.user_id);

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
