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

    // Verify user is a client
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (userRole?.role !== 'client') {
      return NextResponse.json({ error: 'Only clients can submit requests' }, { status: 403 });
    }

    const { requestType, newAdminId, reason } = await request.json();
    
    if (!requestType || !['change_admin', 'unlock_form01'].includes(requestType)) {
      return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
    }

    if (requestType === 'change_admin' && !newAdminId) {
      return NextResponse.json({ error: 'Please select a new admin' }, { status: 400 });
    }

    if (!reason || reason.trim().length < 10) {
      return NextResponse.json({ error: 'Please provide a detailed reason (minimum 10 characters)' }, { status: 400 });
    }

    // Check if client already has a pending request of this type
    const { data: existingRequests } = await supabase
      .from('unlock_requests')
      .select('id, status')
      .eq('client_id', user.id)
      .eq('request_type', requestType)
      .eq('status', 'pending');

    if (existingRequests && existingRequests.length > 0) {
      return NextResponse.json({ 
        error: `You already have a pending ${requestType} request. Please wait for it to be processed.`,
      }, { status: 429 });
    }

    // Get client details
    const { data: client, error: clientError } = await supabase
      .from('user_roles')
      .select('email, first_name, last_name, assigned_admin_id')
      .eq('user_id', user.id)
      .single();

    if (clientError || !client) {
      console.error('Client error:', clientError);
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // For change_admin, validate the new admin is different from current
    if (requestType === 'change_admin' && newAdminId === client.assigned_admin_id) {
      return NextResponse.json({ error: 'You are already assigned to this admin. Please select a different admin.' }, { status: 400 });
    }

    // Get IP address from headers
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const sastTimestamp = getSASTISOString();

    // Create the request
    const insertData: any = {
      client_id: user.id,
      form_number: 1,
      request_type: requestType,
      reason: reason,
      status: 'pending',
      requested_by: user.id,
      created_at: sastTimestamp,
      ip_address: ipAddress,
      user_agent: userAgent
    };

    if (requestType === 'change_admin') {
      insertData.new_admin_id = newAdminId;
    }

    const { data: newRequest, error: insertError } = await supabase
      .from('unlock_requests')
      .insert(insertData)
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Update request count - handle RLS by using service role approach
    // First try to update, if fails, insert
    const { error: upsertError } = await supabase
      .from('client_request_counts')
      .upsert({
        client_id: user.id,
        request_type: requestType,
        request_count: 1,
        max_allowed: 1,
        updated_at: sastTimestamp
      }, {
        onConflict: 'client_id,request_type'
      });

    if (upsertError) {
      console.error('Upsert error (non-critical):', upsertError);
      // Don't fail the request if this fails - the main request is already created
    }

    // Log to audit - try-catch to avoid failing the request
    try {
      await supabase
        .from('request_audit_log')
        .insert({
          request_id: newRequest.id,
          action: 'created',
          performed_by: user.id,
          performed_by_role: 'client',
          details: { requestType, reason, ipAddress }
        });
    } catch (auditError) {
      console.error('Audit log error (non-critical):', auditError);
    }

    return NextResponse.json({ 
      success: true, 
      requestId: newRequest.id,
      message: 'Request submitted successfully. Admin will review it shortly.'
    });
  } catch (err) {
    console.error('Request error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Internal server error: ' + errorMessage }, { status: 500 });
  }
}
