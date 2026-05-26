'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Turnstile } from '@marsidev/react-turnstile';
import Link from 'next/link';

export default function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const router = useRouter();

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const redirectUrl = 'https://reply.techfuseconsult.online/auth/callback''https://formautomation-taupe.vercel.app/auth/callback';

  async function handleMagicLinkSignup(e: React.FormEvent) {
    e.preventDefault();
    
    console.log("Starting signup flow");
    console.log("Email:", email);
    console.log("Captcha token present:", !!captchaToken);
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    if (!captchaToken) {
      setError('Please complete the security check');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First, verify the Turnstile token with your API
      console.log("Verifying Turnstile token...");
      const verifyRes = await fetch('/api/auth/verify-turnstile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: captchaToken }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        console.error("Turnstile verification failed:", verifyData.error);
        setError(verifyData.error || 'Security verification failed');
        setCaptchaToken(null);
        setLoading(false);
        return;
      }
      console.log("Turnstile verified successfully");

      // Now send the magic link with the same token
      console.log("Sending magic link to Supabase...");
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: redirectUrl,
          captchaToken: captchaToken,
        },
      });

      if (error) {
        console.error("Supabase error:", error);
        setError(error.message);
      } else {
        console.log("Magic link sent successfully");
        setMagicLinkSent(true);
      }
    } catch (err: any) {
      console.error("Exception:", err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const onTurnstileSuccess = (token: string) => {
    console.log("Turnstile success, token received");
    setCaptchaToken(token);
    setError(null);
  };

  const onTurnstileError = () => {
    console.error("Turnstile error");
    setError('Security verification failed. Please refresh and try again.');
  };

  if (magicLinkSent) {
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
            We sent a magic link to <strong>{email}</strong>.
          </p>
          <p className="text-amber-600 text-sm mb-4">
            ⚠️ If you don't see the email, please check your spam/junk folder.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
          <p className="text-gray-600 mt-2">Sign up to get started</p>
        </div>

        <form onSubmit={handleMagicLinkSignup} className="space-y-4">
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
            className="w-full bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Sign up with Magic Link'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-blue-600 hover:text-blue-800">
            Already have an account? Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
