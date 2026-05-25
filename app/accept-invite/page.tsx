'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function AcceptInvitePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    const handleInvite = async () => {
      try {
        // Get the full URL fragment (everything after #)
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        
        console.log('Hash:', hash);
        console.log('Access token present:', !!accessToken);
        
        if (!accessToken) {
          setError('No invitation token found. Please use the link from your email.');
          setStatus('error');
          return;
        }

        const supabase = createClient();
        
        // Set the session with the access token
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });

        if (sessionError) {
          console.error('Session error:', sessionError);
          setError(sessionError.message);
          setStatus('error');
          return;
        }

        // Success! Redirect based on invite type
        setStatus('success');
        if (type === 'invite' || type === 'signup') {
          router.push('/set-password');
        } else {
          router.push('/agent/dashboard');
        }
        
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred');
        setStatus('error');
      }
    };

    handleInvite();
  }, [router]);

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center max-w-md p-6">
          <h1 className="text-xl font-bold text-red-600 mb-4">Invitation Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-4">Make sure you're using the link from your invitation email.</p>
          <a href="/" className="text-blue-600 hover:underline">Return Home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 text-lg">Verifying your invitation...</div>
        <div className="text-sm text-gray-500">Please wait while we set up your account.</div>
      </div>
    </div>
  );
}
