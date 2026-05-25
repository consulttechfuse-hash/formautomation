import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { sendUnlockNotification } from '@/lib/email';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
      .from('users')
      .select('role')
      .eq('id', currentUser.id)
      .single();

    if (adminData?.role !== 'admin' && adminData?.role !== 'owner') {
      return NextResponse.json({ error: 'Only admins can update unlock requests' }, { status: 403 });
    }

    // Get the unlock request details
    const { data: requestData, error: fetchError } = await supabase
      .from('unlock_requests')
      .select('*, users!unlock_requests_requested_by_fkey(email, fn_t1, srn_t1)')
      .eq('id', requestId)
      .single();

    if (fetchError || !requestData) {
      return NextResponse.json({ error: 'Unlock request not found' }, { status: 404 });
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

    // Send email notification to the agent
    const agentEmail = requestData.users?.email;
    const agentName = requestData.users?.fn_t1 
      ? `${requestData.users.fn_t1} ${requestData.users.srn_t1 || ''}`.trim() 
      : 'Agent';
    const clientId = requestData.client_id;
    
    // Get client name
    const { data: clientData } = await supabase
      .from('users')
      .select('fn_t1, srn_t1, email')
      .eq('id', clientId)
      .single();
    
    const clientName = clientData?.fn_t1 
      ? `${clientData.fn_t1} ${clientData.srn_t1 || ''}`.trim() 
      : clientData?.email || 'Client';

    if (agentEmail) {
      await sendUnlockNotification({
        toEmail: agentEmail,
        agentName: agentName,
        clientName: clientName,
        formNumber: requestData.form_number,
        status: status,
        reason: requestData.reason,
        adminNotes: adminNotes,
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Request ${status} successfully. Email notification sent to agent.`
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
