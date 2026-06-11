import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getSASTISOString } from '@/lib/timezone';
import { checkClientRequestLimit } from '@/lib/security/request-limits';
import { detectAndHandleFraud } from '@/lib/security/fraud-detection';

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

    // Check rate limits
    const limitCheck = await checkClientRequestLimit(user.id, requestType);
    if (!limitCheck.allowed) {
      return NextResponse.json({ error: limitCheck.reason }, { status: 429 });
    }

    // Get client details
    const { data: client, error: clientError } = await supabase
      .from('user_roles')
      .select('email, first_name, last_name')
      .eq('user_id', user.id)
      .single();

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Get IP address from headers
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const sastTimestamp = getSASTISOString();

    // Create the request
    const { data: newRequest, error: insertError } = await supabase
      .from('unlock_requests')
      .insert({
        client_id: user.id,
        client_email: client.email,
        client_name: `${client.first_name || ''} ${client.last_name || ''}`.trim() || client.email,
        request_type: requestType,
        new_admin_id: newAdminId || null,
        reason: reason,
        status: 'pending',
        requested_by: user.id,
        requested_at: sastTimestamp,
        ip_address: ipAddress,
        user_agent: userAgent
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Check for fraud (excessive requests)
    const fraudCheck = await detectAndHandleFraud(user.id, client.email, requestType, newRequest.id);

    // Log to audit
    await supabase
      .from('request_audit_log')
      .insert({
        request_id: newRequest.id,
        action: 'created',
        performed_by: user.id,
        performed_by_role: 'client',
        details: { requestType, reason, ipAddress }
      });

    // Send email notification to client
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/send-request-confirmation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: client.email,
          clientName: `${client.first_name || ''} ${client.last_name || ''}`.trim(),
          requestType,
          reason,
          requestId: newRequest.id
        })
      }).catch(() => {});
    } catch (emailError) {
      console.error('Email error:', emailError);
    }

    return NextResponse.json({ 
      success: true, 
      requestId: newRequest.id,
      isFraud: fraudCheck.isFraud,
      fraudCaseId: fraudCheck.caseId,
      remainingRequests: limitCheck.maxAllowed ? limitCheck.maxAllowed - (limitCheck.currentCount || 0) - 1 : 0
    });
  } catch (error) {
    console.error('Request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
