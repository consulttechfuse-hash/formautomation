import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    let query = supabase.from('client_flow_state').select('*');

    if (userRole?.role === 'client') {
      query = query.eq('client_id', user.id);
    } else if (userRole?.role === 'agent') {
      const { data: clients } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'client')
        .eq('assigned_admin_id', user.id);
      
      const clientIds = clients?.map(c => c.user_id) || [];
      if (clientIds.length > 0) {
        query = query.in('client_id', clientIds);
      } else {
        return NextResponse.json({ success: true, flowStates: [] });
      }
    } else if (userRole?.role === 'admin') {
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
