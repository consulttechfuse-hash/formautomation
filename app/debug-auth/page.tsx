'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function DebugAuthPage() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testOtp = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    
    const supabase = createClient();
    const testEmail = `debug-${Date.now()}@example.com`;
    
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email: testEmail,
        options: {
          emailRedirectTo: 'https://techfuseconsult.online/set-password',
        },
      });
      
      if (error) {
        setError({ message: error.message, details: error });
      } else {
        setResult({ message: 'OTP sent successfully!', data });
      }
    } catch (err: any) {
      setError({ message: err?.message || String(err), stack: err?.stack });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Auth Debugger</h1>
      <button
        onClick={testOtp}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Test Magic Link'}
      </button>
      
      {result && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded">
          <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded">
          <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}
      
      <div className="mt-8 text-gray-600">
        <p>Open your browser's Developer Tools (F12) → Network tab and watch for the request to <code>/auth/v1/otp</code>.</p>
        <p>If the request is missing or shows a red status, click on it to see details.</p>
      </div>
    </div>
  );
}
