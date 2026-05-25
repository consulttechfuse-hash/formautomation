'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import PaymentStatus from '../../components/PaymentStatus';

export default function AgentPaymentStatus() {
  const [agentId, setAgentId] = useState('');
  const supabase = createClient();

  useEffect(() => {
    const getAgentId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single();
        setAgentId(data?.id || '');
      }
    };
    getAgentId();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Client Payment Status</h2>
      <PaymentStatus role="agent" agentId={agentId} />
    </div>
  );
}
