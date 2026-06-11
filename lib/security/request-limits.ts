import { createClient } from '@/lib/supabase/server';

export interface RequestCheckResult {
  allowed: boolean;
  reason?: string;
  currentCount?: number;
  maxAllowed?: number;
  isBlocked?: boolean;
  fraudCaseOpened?: boolean;
}

export async function checkClientRequestLimit(
  clientId: string,
  requestType: 'unlock_form01' | 'change_admin'
): Promise<RequestCheckResult> {
  const supabase = await createClient();

  // Check system-wide settings
  const { data: settings } = await supabase
    .from('system_request_settings')
    .select('*');

  const globalEnabled = settings?.find(s => s.setting_key === 'global_requests_enabled')?.setting_value === 'true';
  if (!globalEnabled) {
    return { allowed: false, reason: 'Request system is temporarily disabled. Please contact support.' };
  }

  // Check if client is blocked
  const { data: blocklist } = await supabase
    .from('client_blocklist')
    .select('*')
    .eq('client_id', clientId)
    .single();

  if (blocklist) {
    const isExpired = blocklist.expires_at && new Date(blocklist.expires_at) < new Date();
    if (!isExpired || blocklist.is_permanent) {
      return { allowed: false, reason: `Your account has been blocked. Reason: ${blocklist.reason}` };
    }
  }

  // Get request count
  const { data: countData } = await supabase
    .from('client_request_counts')
    .select('*')
    .eq('client_id', clientId)
    .eq('request_type', requestType)
    .single();

  const maxAllowed = requestType === 'change_admin' ? 1 : 1;
  const currentCount = countData?.request_count || 0;

  if (countData?.is_blocked) {
    return { 
      allowed: false, 
      reason: `Maximum ${maxAllowed} ${requestType} request(s) already used. Further requests will trigger a fraud investigation.`,
      currentCount,
      maxAllowed,
      isBlocked: true
    };
  }

  if (currentCount >= maxAllowed) {
    return { 
      allowed: false, 
      reason: `You have already used your ${maxAllowed} ${requestType} request(s).`,
      currentCount,
      maxAllowed
    };
  }

  return { allowed: true, currentCount, maxAllowed };
}

export async function getMaxAllowed(requestType: string): Promise<number> {
  const supabase = await createClient();
  const settingKey = requestType === 'change_admin' ? 'max_change_admin_requests' : 'max_unlock_form01_requests';
  
  const { data } = await supabase
    .from('system_request_settings')
    .select('setting_value')
    .eq('setting_key', settingKey)
    .single();
  
  return parseInt(data?.setting_value || '1');
}
