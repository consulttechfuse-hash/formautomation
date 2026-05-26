'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function ConsentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const clientName = searchParams.get('client_name') || 'Application';
  const scope = searchParams.get('scope') || 'Profile, Email';

  const handleAllow = () => {
    // Handle consent approval
    router.push('/oauth/callback?status=approved');
  };

  const handleDeny = () => {
    router.push('/oauth/callback?status=denied');
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-10">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Authorization Request</h1>
        <p className="text-gray-600 mb-4">
          <strong>{clientName}</strong> is requesting access to your account.
        </p>
        <div className="bg-gray-50 p-4 rounded mb-4">
          <p className="font-medium mb-2">This application will be able to:</p>
          <ul className="list-disc list-inside text-sm text-gray-600">
            {scope.split(' ').map((s, i) => (
              <li key={i}>Access your {s.toLowerCase()} information</li>
            ))}
          </ul>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAllow}
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Allow
          </button>
          <button
            onClick={handleDeny}
            className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
          >
            Deny
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ConsentPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <ConsentContent />
    </Suspense>
  );
}
