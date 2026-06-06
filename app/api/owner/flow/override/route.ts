import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
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

    if (userRole?.role !== 'owner') {
      return NextResponse.json({ error: 'Only owners can override locks' }, { status: 403 });
    }

    const { clientId, reason, notes } = await request.json();

    if (!clientId || !reason) {
      return NextResponse.json({ error: 'Client ID and reason are required' }, { status: 400 });
    }

    const { data: flowState } = await supabase
      .from('client_flow_state')
      .select('*')
      .eq('client_id', clientId)
      .single();

    if (!flowState) {
      return NextResponse.json({ error: 'Flow state not found' }, { status: 404 });
    }

    const { error: updateError } = await supabase
      .from('client_flow_state')
      .update({
        lock_type: 'overridden',
        overridden_by: user.id,
        override_reason: reason,
        override_notes: notes,
        overridden_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('client_id', clientId);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to override lock' }, { status: 500 });
    }

    await supabase
      .from('flow_audit_log')
      .insert({
        client_id: clientId,
        action: 'owner_override',
        previous_state: flowState,
        new_state: { ...flowState, lock_type: 'overridden', overridden_by: user.id },
        performed_by: user.id,
        performed_by_role: 'owner',
        reason: reason,
        metadata: { notes },
        created_at: new Date().toISOString()
      });

    return NextResponse.json({ 
      success: true, 
      message: 'Lock overridden successfully. Client can now edit forms.' 
    });
  } catch (error) {
    console.error('Owner override error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
