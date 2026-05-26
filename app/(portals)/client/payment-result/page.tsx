'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get('status') || 'unknown';
  const message = searchParams.get('message') || '';

  const isSuccess = status === 'success';

  return (
    <div className="max-w-md mx-auto p-6 mt-10">
      <div className="bg-white rounded-lg shadow p-6 text-center">
        {isSuccess ? (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">Your payment has been processed successfully.</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h1>
            <p className="text-gray-600 mb-6">{message || 'There was an issue processing your payment.'}</p>
          </>
        )}
        
        <button
          onClick={() => router.push('/client/dashboard')}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <PaymentResultContent />
    </Suspense>
  );
}
