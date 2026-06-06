import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try to get user role by user_id first
    let { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    // If not found by user_id, try by email
    if (!userRole) {
      const { data: roleByEmail } = await supabase
        .from('user_roles')
        .select('role')
        .eq('email', user.email)
        .single();
      userRole = roleByEmail;
    }

    // Default to 'client' if still no role found
    const role = userRole?.role || 'client';

    let query = supabase.from('client_flow_state').select('*');

    if (role === 'client') {
      // Try to find flow state by client_id (user.id)
      let { data: flowState } = await supabase
        .from('client_flow_state')
        .select('*')
        .eq('client_id', user.id)
        .single();
      
      // If not found, try to find by email via user_roles
      if (!flowState) {
        const { data: userRoleRecord } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('email', user.email)
          .single();
        
        if (userRoleRecord?.user_id) {
          const { data: flowByUserId } = await supabase
            .from('client_flow_state')
            .select('*')
            .eq('client_id', userRoleRecord.user_id)
            .single();
          flowState = flowByUserId;
        }
      }
      
      return NextResponse.json({ 
        success: true, 
        flowStates: flowState ? [flowState] : [] 
      });
    } 
    else if (role === 'agent') {
      const { data: clients } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'client')
        .eq('assigned_admin_id', user.id);
      
      const clientIds = clients?.map(c => c.user_id).filter(id => id !== null) || [];
      if (clientIds.length > 0) {
        query = query.in('client_id', clientIds);
      } else {
        return NextResponse.json({ success: true, flowStates: [] });
      }
    } 
    else if (role === 'admin') {
      const { data: agents } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'agent')
        .eq('invited_by', user.id);
      
      const agentIds = agents?.map(a => a.user_id).filter(id => id !== null) || [];
      const { data: clients } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'client')
        .in('assigned_admin_id', agentIds);
      
      const clientIds = clients?.map(c => c.user_id).filter(id => id !== null) || [];
      if (clientIds.length > 0) {
        query = query.in('client_id', clientIds);
      } else {
        return NextResponse.json({ success: true, flowStates: [] });
      }
    }

    const { data: flowStates, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, flowStates });
  } catch (error) {
    console.error('Flow state fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
