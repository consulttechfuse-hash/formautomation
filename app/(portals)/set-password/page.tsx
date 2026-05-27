"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const verify = async () => {
      const token = searchParams.get('token');
      const urlEmail = searchParams.get('email');
      
      console.log('Token from URL:', token);
      console.log('Email from URL:', urlEmail);
      
      if (!token || !urlEmail) {
        setError('Invalid invitation link');
        setIsVerifying(false);
        return;
      }
      
      setEmail(decodeURIComponent(urlEmail));
      
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: decodeURIComponent(urlEmail),
        token: token,
        type: 'magiclink',
      });
      
      if (verifyError) {
        console.error('Verify error:', verifyError);
        setError(verifyError.message);
        setIsVerifying(false);
        return;
      }
      
      console.log('Token verified successfully');
      setIsVerifying(false);
    };
    
    verify();
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
      console.error('Update error:', updateError);
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.push('/client/dashboard');
  };

  if (isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Verifying your link...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-2">{error}</div>
          <button
            onClick={() => router.push('/login')}
            className="text-blue-600 underline"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-2xl font-bold">Set Your Password</h1>
        <p className="mb-4 text-gray-600">
          Welcome! Please set a password for your account: <strong>{email}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">Password</label>
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
            <label className="mb-2 block text-sm font-medium">Confirm Password</label>
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
            {loading ? 'Setting Password...' : 'Set Password & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
