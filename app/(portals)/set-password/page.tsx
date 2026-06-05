"use client";

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';

function SetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [inviteToken, setInviteToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(true);
  const [isInvite, setIsInvite] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const verifyInvite = async () => {
      const token = searchParams.get('token');
      const urlEmail = searchParams.get('email');
      const type = searchParams.get('type');
      
      if (!token || !urlEmail) {
        setError('Invalid invitation link');
        setIsVerifying(false);
        return;
      }
      
      setEmail(decodeURIComponent(urlEmail));
      setInviteToken(token);
      
      if (type === 'invite') {
        setIsInvite(true);
        // Verify the invitation token
        const { data: invite, error: inviteError } = await supabase
          .from('user_roles')
          .select('id, invitation_token, invitation_expires_at, accepted_at, user_id')
          .eq('invitation_token', token)
          .eq('email', decodeURIComponent(urlEmail))
          .single();
        
        if (inviteError || !invite) {
          setError('Invalid invitation link');
          setIsVerifying(false);
          return;
        }
        
        if (invite.accepted_at) {
          setError('This invitation has already been accepted');
          setIsVerifying(false);
          return;
        }
        
        if (new Date(invite.invitation_expires_at) < new Date()) {
          setError('This invitation has expired. Please ask for a new one.');
          setIsVerifying(false);
          return;
        }
        
        setIsVerifying(false);
        return;
      }
      
      // Regular magic link flow - verify OTP
      setIsInvite(false);
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: decodeURIComponent(urlEmail),
        token: token,
        type: 'magiclink',
      });
      
      if (verifyError) {
        setError(verifyError.message);
        setIsVerifying(false);
        return;
      }
      
      setIsVerifying(false);
    };
    
    verifyInvite();
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

    try {
      if (isInvite) {
        // Invite flow: Update the user's password via reset email
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `https://techfuseconsult.online/set-password?token=${inviteToken}&email=${email}&type=invite&step=reset`
        });
        
        if (resetError) {
          setError(resetError.message);
          setLoading(false);
          return;
        }
        
        // Mark invitation as accepted
        await supabase
          .from('user_roles')
          .update({ 
            invite_accepted_at: new Date().toISOString()
          })
          .eq('invitation_token', inviteToken);
        
        setError('Please check your email for a password reset link to complete your account setup.');
        setLoading(false);
        return;
      } else {
        // Regular magic link flow: Set the password directly
        const { error: updateError } = await supabase.auth.updateUser({
          password: password,
        });
        
        if (updateError) {
          setError(updateError.message);
          setLoading(false);
          return;
        }
        
        // Get user role and redirect
        const { data: { user } } = await supabase.auth.getUser();
        const { data: userRole } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user?.id)
          .single();
        
        const role = userRole?.role || 'client';
        
        if (role === 'owner') router.push('/owner/dashboard');
        else if (role === 'admin') router.push('/admin/dashboard');
        else if (role === 'agent') router.push('/agent/dashboard');
        else router.push('/client/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying your link...</p>
        </div>
      </div>
    );
  }

  // Show success message for invite flow
  if (error && error.includes('check your email')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-center mb-6">
            <Link href="/" className="inline-block">
              <Image src="/logo.png" alt="Techfuse" width={120} height={60} className="mx-auto" />
            </Link>
          </div>
          <div className="text-green-600 text-5xl mb-4">📧</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Check Your Email</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Invalid Link</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/signup')}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Sign Up Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block">
            <Image src="/logo.png" alt="Techfuse" width={120} height={60} className="mx-auto" />
          </Link>
        </div>
        
        <h1 className="mb-2 text-2xl font-bold text-gray-800">
          {isInvite ? 'Complete Your Registration' : 'Set Your Password'}
        </h1>
        <p className="mb-4 text-gray-600">
          {isInvite 
            ? `Create a password for ${email}`
            : `Create a password for ${email} to complete your account setup`
          }
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
              required
              minLength={6}
              placeholder="••••••••"
            />
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
              required
              placeholder="••••••••"
            />
          </div>

          {error && !error.includes('check your email') && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? (isInvite ? 'Sending reset link...' : 'Setting password...') : (isInvite ? 'Send Reset Link' : 'Set Password & Continue')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <SetPasswordForm />
    </Suspense>
  );
}
