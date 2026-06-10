import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getSASTISOString } from '@/lib/timezone';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientId, reason } = await request.json();
    
    // Get client details
    const { data: client } = await supabase
      .from('user_roles')
      .select('email, first_name, last_name')
      .eq('user_id', clientId)
      .single();
    
    // Use SAST timestamp
    const sastTimestamp = getSASTISOString();
    
    const { error } = await supabase
      .from('unlock_requests')
      .insert({
        client_id: clientId,
        client_email: client.email,
        client_name: `${client.first_name || ''} ${client.last_name || ''}`.trim(),
        form_number: 1,
        reason: reason,
        status: 'pending',
        requested_by: user.id,
        requested_at: sastTimestamp
      });
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Lock the client flow
    await supabase
      .from('client_flow_state')
      .update({
        lock_type: 'locked_step',
        locked_step: 4,
        locked_reason: reason,
        locked_at: sastTimestamp,
        locked_by: user.id
      })
      .eq('client_id', clientId);
    
    return NextResponse.json({ success: true, timestamp: sastTimestamp });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
