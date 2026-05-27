"use client";

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const router = useRouter();

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const redirectUrl = 'https://techfuseconsult.online/set-password';

  useEffect(() => {
    // Load Turnstile script
    if (!document.querySelector('script[src*="turnstile"]')) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const initTurnstile = () => {
      const anyWindow = window as any;
      if (anyWindow.turnstile && turnstileRef.current && !widgetIdRef.current) {
        widgetIdRef.current = anyWindow.turnstile.render(turnstileRef.current, {
          sitekey: siteKey,
          mode: 'invisible',
          execution: 'execute',
          callback: (token: string) => {
            setCaptchaToken(token);
            setError(null);
            handleSubmitWithToken(token);
          },
          'error-callback': () => {
            setError('Security verification failed. Please try again.');
            setLoading(false);
          },
        });
      }
    };

    const anyWindow = window as any;
    if (anyWindow.turnstile) {
      initTurnstile();
    } else {
      const checkInterval = setInterval(() => {
        if (anyWindow.turnstile) {
          clearInterval(checkInterval);
          initTurnstile();
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }
  }, [siteKey]);

  const handleSubmitWithToken = async (token: string) => {
    if (!email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: redirectUrl,
          captchaToken: token,
        },
      });

      if (error) {
        console.error("Supabase error:", error);
        setError(error.message);
        setLoading(false);
      } else {
        setMagicLinkSent(true);
      }
    } catch (err: any) {
      console.error("Exception:", err);
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError(null);

    const anyWindow = window as any;
    if (widgetIdRef.current && anyWindow.turnstile) {
      anyWindow.turnstile.execute(widgetIdRef.current);
    } else {
      setError('Security verification not ready. Please refresh the page.');
      setLoading(false);
    }
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

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div ref={turnstileRef} />

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
