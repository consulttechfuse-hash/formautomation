'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import PaymentStatus from '../../components/PaymentStatus';

export default function AdminPaymentStatus() {
  const [adminId, setAdminId] = useState('');
  const supabase = createClient();

  useEffect(() => {
    const getAdminId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAdminId(user.id);
      }
    };
    getAdminId();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Payment Status</h2>
      <PaymentStatus role="admin" adminId={adminId} />
    </div>
  );
}
