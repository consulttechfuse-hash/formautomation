"use client";

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const verifyToken = async () => {
      let token = searchParams.get('token');
      let email = searchParams.get('email');
      
      // Also check hash fragment
      const hash = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hash);
      if (!token) token = hashParams.get('access_token');
      if (!email) {
        const hashEmail = hashParams.get('email');
        if (hashEmail) email = hashEmail;
      }
      
      console.log('Token present:', !!token);
      console.log('Email present:', !!email);
      
      if (!token || !email) {
        setError('Invalid reset link. Please request a new one.');
        setIsVerifying(false);
        return;
      }
      
      // Try to verify with recovery type
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: decodeURIComponent(email),
        token: token,
        type: 'recovery',
      });
      
      if (verifyError) {
        console.error('Verification error:', verifyError);
        setError(verifyError.message);
        setIsVerifying(false);
        return;
      }
      
      setIsVerifying(false);
    };
    
    verifyToken();
  }, [searchParams, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.push('/login?reset=success');
  };

  if (isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Verifying your reset link...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-2">{error}</div>
          <button
            onClick={() => router.push('/forgot-password')}
            className="text-blue-600 underline"
          >
            Request new reset link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-2xl font-bold">Reset Password</h1>
        <p className="mb-4 text-gray-600">Enter your new password below.</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
              required
              minLength={6}
            />
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => router.push('/login')}
            className="text-sm text-blue-600 hover:underline"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
