import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { clientId, adminId } = await request.json();

    if (!clientId || !adminId) {
      return NextResponse.json({ error: 'Client ID and Admin ID are required' }, { status: 400 });
    }

    console.log('Round robin assign - clientId:', clientId, 'adminId:', adminId);

    // Get all active agents under this admin (including those who haven't accepted invite yet)
    const { data: agents, error: agentsError } = await supabase
      .from('user_roles')
      .select('user_id, email, first_name, last_name')
      .eq('role', 'agent')
      .eq('invited_by', adminId);

    if (agentsError) {
      console.error('Error fetching agents:', agentsError);
      return NextResponse.json({ error: 'Failed to fetch agents: ' + agentsError.message }, { status: 500 });
    }

    console.log('Found agents:', agents?.length || 0);

    if (!agents || agents.length === 0) {
      // No agents available - assign null
      const { error: updateError } = await supabase
        .from('user_roles')
        .update({ assigned_agent_id: null })
        .eq('user_id', clientId);

      if (updateError) {
        console.error('Error updating client:', updateError);
      }

      return NextResponse.json({ 
        success: true, 
        assigned_agent_id: null,
        message: 'No agents available. Admin will need to assign manually.'
      });
    }

    // Get or create round robin state for this admin
    let { data: roundRobinState, error: stateError } = await supabase
      .from('admin_round_robin_state')
      .select('*')
      .eq('admin_id', adminId)
      .single();

    if (stateError && stateError.code !== 'PGRST116') {
      console.error('Error fetching round robin state:', stateError);
    }

    if (!roundRobinState) {
      // Create new state
      const { data: newState, error: createError } = await supabase
        .from('admin_round_robin_state')
        .insert({ admin_id: adminId, last_assigned_index: 0 })
        .select()
        .single();

      if (createError) {
        console.error('Error creating round robin state:', createError);
      } else {
        roundRobinState = newState;
      }
    }

    // Calculate next agent index (round robin)
    const currentIndex = roundRobinState?.last_assigned_index || 0;
    const nextIndex = (currentIndex + 1) % agents.length;
    const selectedAgent = agents[nextIndex];

    console.log('Selected agent:', selectedAgent);

    // Update round robin state
    if (roundRobinState) {
      await supabase
        .from('admin_round_robin_state')
        .update({ 
          last_assigned_index: nextIndex,
          updated_at: new Date().toISOString()
        })
        .eq('admin_id', adminId);
    }

    // Assign agent to client
    const { error: updateError } = await supabase
      .from('user_roles')
      .update({ assigned_agent_id: selectedAgent.user_id })
      .eq('user_id', clientId);

    if (updateError) {
      console.error('Error assigning agent:', updateError);
      return NextResponse.json({ error: 'Failed to assign agent: ' + updateError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      assigned_agent_id: selectedAgent.user_id,
      agent_email: selectedAgent.email,
      agent_name: `${selectedAgent.first_name || ''} ${selectedAgent.last_name || ''}`.trim()
    });
  } catch (error) {
    console.error('Round robin assignment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
