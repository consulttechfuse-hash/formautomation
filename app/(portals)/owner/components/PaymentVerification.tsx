'use client';

import PaymentStatus from '../../components/PaymentStatus';

export default function PaymentVerification() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Manual Payment Verification</h2>
      <PaymentStatus role="owner" />
    </div>
  );
}
