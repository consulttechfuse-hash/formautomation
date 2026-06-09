'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<'loading' | 'password' | 'error'>('loading');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const handleCallback = async () => {
      // Check if we already have a session (from route.ts exchange)
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setStep('error');
        setError('No session found. Please request a new magic link.');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      // Check if user needs to set a password
      const needsPassword = !user?.user_metadata?.password_set;
      
      if (needsPassword) {
        setStep('password');
      } else {
        await redirectToDashboard();
      }
    };

    handleCallback();
  }, []);

  const redirectToDashboard = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/sign-in');
      return;
    }

    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    const role = userRole?.role || 'client';
    
    if (role === 'owner') router.push('/owner/dashboard');
    else if (role === 'admin') router.push('/admin/dashboard');
    else if (role === 'agent') router.push('/agent/dashboard');
    else router.push('/client/dashboard');
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
      data: { password_set: true }
    });

    if (updateError) {
      console.error('Update password error:', updateError);
      setError(updateError.message);
      setLoading(false);
      return;
    }

    await redirectToDashboard();
  };

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying your account...</p>
        </div>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Verification Failed</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/client-signup" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg">
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <Link href="/">
            <Image src="/logo.png" alt="Techfuse" width={120} height={60} className="mx-auto" />
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-center mb-8">Set Your Password</h1>
        <form onSubmit={handleSetPassword} className="space-y-4">
          <input
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg p-2"
            required
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border rounded-lg p-2"
            required
          />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded-lg">
            {loading ? 'Setting up...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">Loading...</div>}>
      <CallbackContent />
    </Suspense>
  );
}
