import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    // Get all pending unlock requests
    const { data, error } = await supabase
      .from('unlock_requests')
      .select(`
        *,
        requested_by_user:requested_by (email, fn_t1, srn_t1),
        client:client_id (email)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ requests: data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { requestId, status, adminNotes } = await request.json();

    if (!requestId || !status) {
      return NextResponse.json({ error: 'Request ID and status are required' }, { status: 400 });
    }

    if (status !== 'approved' && status !== 'declined') {
      return NextResponse.json({ error: 'Status must be approved or declined' }, { status: 400 });
    }

    // Get the current user (admin)
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if current user is admin
    const { data: adminData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', currentUser.id)
      .single();

    if (adminData?.role !== 'admin' && adminData?.role !== 'owner') {
      return NextResponse.json({ error: 'Only admins can update unlock requests' }, { status: 403 });
    }

    // Update the request status
    const { error: updateError } = await supabase
      .from('unlock_requests')
      .update({ 
        status: status,
        reviewed_by: currentUser.id,
        reviewed_at: new Date().toISOString(),
        admin_notes: adminNotes || null
      })
      .eq('id', requestId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Insert into audit log
    await supabase
      .from('unlock_audit_log')
      .insert({
        unlock_request_id: requestId,
        action: status,
        performed_by: currentUser.id,
        notes: adminNotes
      });

    return NextResponse.json({ 
      success: true, 
      message: `Request ${status} successfully.`
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
