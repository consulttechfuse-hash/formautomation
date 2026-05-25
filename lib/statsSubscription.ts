import { createClient } from '@/lib/supabase/client';

export function subscribeToPaymentChanges(callback: () => void) {
  const supabase = createClient();
  
  const subscription = supabase
    .channel('payment_stats_changes')
    .on('postgres_changes', 
      { event: 'UPDATE', schema: 'public', table: 'users', filter: 'has_paid=eq.true' },
      () => callback()
    )
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'manual_payment_requests' },
      () => callback()
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}
