'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function StepRedirect() {
  const params = useParams();
  const router = useRouter();
  const stepNumber = parseInt(params.stepNumber as string);

  const stepPaths: Record<number, string> = {
    1: '/client/select-admin',
    2: '/client/select-payment',
    3: '/client/consent',
    4: '/client/form-01',
    5: '/client/forms',
    6: '/client/confirm-submit',
  };

  useEffect(() => {
    const path = stepPaths[stepNumber];
    if (path) {
      router.replace(path);
    } else {
      router.replace('/client/dashboard');
    }
  }, [stepNumber, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600">Redirecting to step {stepNumber}...</p>
    </div>
  );
}
