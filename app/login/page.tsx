'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Turnstile } from '@marsidev/react-turnstile';
import Link from 'next/link';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [resetCaptchaToken, setResetCaptchaToken] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const router = useRouter();

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    if (!captchaToken) {
      setError('Please complete the security check');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
        options: {
          captchaToken: captchaToken,  // ← Pass token to Supabase
        }
      });

      if (error) throw error;

      if (data.user) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single();

        const role = profile?.role;
        
        if (role === 'owner') router.push('/owner/dashboard');
        else if (role === 'admin') router.push('/admin/dashboard');
        else if (role === 'agent') router.push('/agent/dashboard');
        else router.push('/client/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordReset(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    if (!resetCaptchaToken) {
      setError('Please complete the security check');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
        captchaToken: resetCaptchaToken,  // ← Pass token to Supabase
      });

      if (error) throw error;
      setResetSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const onTurnstileSuccess = (token: string) => {
    setCaptchaToken(token);
    setError(null);
  };

  const onResetTurnstileSuccess = (token: string) => {
    setResetCaptchaToken(token);
    setError(null);
  };

  const onTurnstileError = () => {
    setError('Security verification failed. Please refresh and try again.');
  };

  if (resetSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Check your email</h1>
          <p className="text-gray-600 mb-2">
            We sent a password reset link to <strong>{email}</strong>.
          </p>
          <p className="text-amber-600 text-sm mb-4">
            ⚠️ If you don't see the email, please check your spam/junk folder.
          </p>
          <button
            onClick={() => {
              setShowResetForm(false);
              setResetSent(false);
              setEmail('');
            }}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            ← Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  if (showResetForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Reset Password</h1>
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {siteKey && (
              <Turnstile
                siteKey={siteKey}
                onSuccess={onResetTurnstileSuccess}
                onError={onTurnstileError}
                options={{ theme: 'light', size: 'normal' }}
              />
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setShowResetForm(false)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              ← Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {siteKey && (
            <Turnstile
              siteKey={siteKey}
              onSuccess={onTurnstileSuccess}
              onError={onTurnstileError}
              options={{ theme: 'light', size: 'normal' }}
            />
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setShowResetForm(true)}
            className="text-sm text-blue-600 hover:text-blue-800 mr-4"
          >
            Forgot Password?
          </button>
          <Link href="/signup" className="text-sm text-blue-600 hover:text-blue-800">
            Create Account
          </Link>
        </div>

        <div className="mt-6 text-center text-xs text-gray-400">
          <p>Questions? Contact support@techfuseconsulting.online</p>
        </div>
      </div>
    </div>
  );
}
