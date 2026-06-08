'use client';

import { Suspense } from 'react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Turnstile } from '@marsidev/react-turnstile';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'signin' | 'magic'>('signin');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const supabase = createClient();
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const onTurnstileSuccess = (token: string) => {
    setCaptchaToken(token);
    setError(null);
  };

  const onTurnstileError = () => {
    setError('Security verification failed. Please refresh and try again.');
  };

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!captchaToken) {
      setError('Please complete the security check');
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ 
      email, 
      password,
      options: { captchaToken }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(redirect);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!captchaToken) {
      setError('Please complete the security check');
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { 
        emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}`,
        captchaToken
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMagicLinkSent(true);
    setLoading(false);
  };

  if (magicLinkSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-center mb-6">
            <Link href="/" className="inline-block">
              <Image src="/logo.png" alt="Techfuse" width={120} height={60} className="mx-auto" />
            </Link>
          </div>
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Check your email</h1>
          <p className="text-gray-600 mb-4">
            We sent a magic link to <strong>{email}</strong>
          </p>
          <button
            onClick={() => router.push('/sign-in')}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block">
            <Image src="/logo.png" alt="Techfuse" width={120} height={60} className="mx-auto" />
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Sign in to Techfuse</h1>
          <p className="text-gray-600 mt-2">
            Or{' '}
            <Link href="/client-signup" className="text-blue-600 hover:text-blue-800 font-medium">
              create a new account
            </Link>
          </p>
        </div>

        <div className="flex gap-2 border-b pb-2 mb-6">
          <button
            onClick={() => setMode('signin')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              mode === 'signin'
                ? 'text-blue-600 border-b-2 border-blue-600 -mb-[2px]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Password Sign In
          </button>
          <button
            onClick={() => setMode('magic')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              mode === 'magic'
                ? 'text-blue-600 border-b-2 border-blue-600 -mb-[2px]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Magic Link
          </button>
        </div>

        <form className="space-y-4" onSubmit={mode === 'signin' ? handlePasswordSignIn : handleMagicLink}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="you@example.com"
              required
              disabled={loading}
            />
          </div>

          {mode === 'signin' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>
          )}

          {siteKey && (
            <div className="flex justify-center">
              <Turnstile
                siteKey={siteKey}
                onSuccess={onTurnstileSuccess}
                onError={onTurnstileError}
                options={{ theme: 'light' }}
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !captchaToken}
            className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Send Magic Link'}
          </button>
        </form>

        {mode === 'signin' && (
          <div className="mt-6 text-center">
            <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
              Forgot your password?
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}
