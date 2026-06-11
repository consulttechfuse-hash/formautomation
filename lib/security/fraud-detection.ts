import { createClient } from '@/lib/supabase/server';
import { getSASTISOString } from '@/lib/timezone';

export async function detectAndHandleFraud(
  clientId: string,
  clientEmail: string,
  requestType: string,
  requestId: string
): Promise<{ isFraud: boolean; caseId?: string }> {
  const supabase = await createClient();
  const sastTimestamp = getSASTISOString();

  // Get request count for this client
  const { data: countData } = await supabase
    .from('client_request_counts')
    .select('*')
    .eq('client_id', clientId)
    .eq('request_type', requestType)
    .single();

  const currentCount = countData?.request_count || 1;
  const fraudThreshold = 2; // More than 1 attempt triggers fraud

  if (currentCount >= fraudThreshold && !countData?.fraud_case_opened) {
    // Create fraud case
    const { data: fraudCase } = await supabase
      .from('fraud_cases')
      .insert({
        client_id: clientId,
        client_email: clientEmail,
        case_type: 'excessive_requests',
        severity: 'medium',
        description: `Client made ${currentCount} ${requestType} request(s) (exceeds limit of 1)`,
        request_ids: [requestId],
        opened_at: sastTimestamp
      })
      .select()
      .single();

    // Mark request as fraud case
    await supabase
      .from('unlock_requests')
      .update({
        is_fraud_case: true,
        fraud_notes: `Auto-flagged: ${currentCount} requests made`,
        investigation_status: 'investigating'
      })
      .eq('id', requestId);

    // Update client request counts
    await supabase
      .from('client_request_counts')
      .update({
        is_blocked: true,
        blocked_at: sastTimestamp,
        blocked_reason: `Fraud case opened: ${currentCount} ${requestType} requests`,
        fraud_case_opened: true,
        fraud_case_id: fraudCase?.id
      })
      .eq('client_id', clientId)
      .eq('request_type', requestType);

    // Log to audit
    await supabase
      .from('request_audit_log')
      .insert({
        request_id: requestId,
        action: 'fraud_flagged',
        performed_by: clientId,
        performed_by_role: 'client',
        details: { reason: `Excessive requests: ${currentCount} attempts`, fraud_case_id: fraudCase?.id }
      });

    return { isFraud: true, caseId: fraudCase?.id };
  }

  return { isFraud: false };
}
