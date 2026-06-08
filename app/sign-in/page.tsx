'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'signin' | 'magic'>('signin');

  const supabase = createClient();

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(redirect);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}` },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    alert('Check your email for the magic link!');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">Sign in to Techfuse</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or <Link href="/client-signup" className="font-medium text-blue-600 hover:text-blue-500">create a new account</Link>
          </p>
        </div>

        <div className="flex gap-2 border-b pb-2">
          <button onClick={() => setMode('signin')} className={`flex-1 py-2 text-sm font-medium ${mode === 'signin' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Password Sign In</button>
          <button onClick={() => setMode('magic')} className={`flex-1 py-2 text-sm font-medium ${mode === 'magic' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Magic Link</button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

        <form className="mt-8 space-y-6" onSubmit={mode === 'signin' ? handlePasswordSignIn : handleMagicLink}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
          </div>
          {mode === 'signin' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
          )}
          <div>
            <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Send Magic Link'}
            </button>
          </div>
        </form>

        {mode === 'signin' && (
          <div className="text-center">
            <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">Forgot your password?</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}
