"use client";

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [isChecking, setIsChecking] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('Unable to verify your session. Please request a new reset link.');
          setIsChecking(false);
          return;
        }
        
        if (session) {
          setEmail(session.user.email || '');
          setIsChecking(false);
        } else {
          setError('Invalid or expired reset link. Please request a new one.');
          setIsChecking(false);
        }
      } catch (err) {
        console.error('Error checking session:', err);
        setError('Something went wrong. Please request a new reset link.');
        setIsChecking(false);
      }
    };
    
    checkSession();
  }, [supabase]);

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

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      router.push('/login?reset=success');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
      setLoading(false);
    }
  };

  const handleRequestNewLink = () => {
    router.push('/forgot-password');
  };

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying your reset link...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Invalid Reset Link</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleRequestNewLink}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Request New Reset Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">Reset Password</h1>
        <p className="mb-4 text-gray-600">
          Set a new password for: <strong>{email}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
              required
              minLength={6}
            />
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
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
