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

    if (userRole?.role !== 'agent') {
      return NextResponse.json({ error: 'Only agents can submit unlock requests' }, { status: 403 });
    }

    const { clientId, stepNumber, reason } = await request.json();

    if (!clientId || !stepNumber || !reason) {
      return NextResponse.json({ error: 'Client ID, step number, and reason are required' }, { status: 400 });
    }

    const { data: clientCheck } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', clientId)
      .eq('role', 'client')
      .eq('assigned_admin_id', user.id)
      .single();

    if (!clientCheck) {
      return NextResponse.json({ error: 'Client not assigned to you' }, { status: 403 });
    }

    const { error: updateError } = await supabase
      .from('client_flow_state')
      .update({
        lock_type: 'locked_step',
        locked_step: stepNumber,
        locked_reason: reason,
        locked_by: user.id,
        locked_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('client_id', clientId);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to submit unlock request' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Unlock request submitted. Admin will review.' 
    });
  } catch (error) {
    console.error('Unlock request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
