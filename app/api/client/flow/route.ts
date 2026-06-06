import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { step, completed } = await request.json();
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get current flow state
    let { data: flowState } = await supabase
      .from('client_flow_state')
      .select('*')
      .eq('client_id', user.id)
      .single();
    
    if (!flowState) {
      // Create new flow state
      const { data: newFlow, error: createError } = await supabase
        .from('client_flow_state')
        .insert({
          client_id: user.id,
          current_step: 1,
          last_step_update: new Date().toISOString()
        })
        .select()
        .single();
      
      if (createError) {
        return NextResponse.json({ error: 'Failed to create flow state' }, { status: 500 });
      }
      flowState = newFlow;
    }
    
    // Update the specific step
    const updates: any = { last_step_update: new Date().toISOString() };
    
    switch (step) {
      case 1:
        updates.step_1_admin_selected = completed;
        if (completed) updates.current_step = 2;
        break;
      case 2:
        updates.step_2_payment_completed = completed;
        if (completed) updates.current_step = 3;
        break;
      case 3:
        updates.step_3_consent_completed = completed;
        if (completed) updates.current_step = 4;
        break;
      case 4:
        updates.step_4_form01_completed = completed;
        if (completed) updates.current_step = 5;
        break;
      case 5:
        updates.step_5_form_submitted = completed;
        if (completed) updates.current_step = 6;
        break;
      case 6:
        updates.step_6_completed = completed;
        updates.completed_at = completed ? new Date().toISOString() : null;
        if (completed) updates.current_step = 6;
        break;
      default:
        return NextResponse.json({ error: 'Invalid step' }, { status: 400 });
    }
    
    const { error: updateError } = await supabase
      .from('client_flow_state')
      .update(updates)
      .eq('client_id', user.id);
    
    if (updateError) {
      return NextResponse.json({ error: 'Failed to update flow state' }, { status: 500 });
    }
    
    // Also update user_roles for backward compatibility
    const roleUpdates: any = {};
    if (step === 3 && completed) roleUpdates.has_consented = true;
    if (step === 2 && completed) roleUpdates.has_paid = true;
    if (step === 4 && completed) roleUpdates.onboarding_complete = true;
    if (step === 5 && completed) roleUpdates.onboarding_submitted = true;
    
    if (Object.keys(roleUpdates).length > 0) {
      await supabase
        .from('user_roles')
        .update(roleUpdates)
        .eq('user_id', user.id);
    }
    
    return NextResponse.json({ success: true, flowState: { ...flowState, ...updates } });
  } catch (error) {
    console.error('Flow update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user's role
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    let query = supabase.from('client_flow_state').select('*');
    
    // Filter based on role
    if (userRole?.role === 'client') {
      query = query.eq('client_id', user.id);
    } else if (userRole?.role === 'agent') {
      // Get clients assigned to this agent
      const { data: clients } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'client')
        .eq('assigned_admin_id', user.id);
      
      const clientIds = clients?.map(c => c.user_id) || [];
      query = query.in('client_id', clientIds);
    } else if (userRole?.role === 'admin') {
      // Get clients under this admin's agents
      const { data: agents } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'agent')
        .eq('invited_by', user.id);
      
      const agentIds = agents?.map(a => a.user_id) || [];
      
      const { data: clients } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'client')
        .in('assigned_admin_id', agentIds);
      
      const clientIds = clients?.map(c => c.user_id) || [];
      query = query.in('client_id', clientIds);
    }
    // Owner and engineering roles see all
    
    const { data: flowStates, error } = await query;
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, flowStates });
  } catch (error) {
    console.error('Flow fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
