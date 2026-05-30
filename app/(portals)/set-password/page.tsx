"use client";

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function SetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(true);
  const [inviteType, setInviteType] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const verify = async () => {
      const token = searchParams.get('token');
      const urlEmail = searchParams.get('email');
      const type = searchParams.get('type');
      
      setInviteType(type);
      
      if (!token || !urlEmail) {
        setError('Invalid invitation link');
        setIsVerifying(false);
        return;
      }
      
      setEmail(decodeURIComponent(urlEmail));
      
      if (type === 'invite') {
        // For invites: check if user already exists, if not create them
        const { data: existingUser } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('email', decodeURIComponent(urlEmail))
          .single();
        
        if (!existingUser?.user_id) {
          // Create auth user with email confirmation
          const { error: signUpError } = await supabase.auth.signUp({
            email: decodeURIComponent(urlEmail),
            password: 'temporary', // Will be updated when user sets password
            options: {
              emailRedirectTo: `https://techfuseconsult.online/set-password?token=${token}&email=${urlEmail}&type=invite`
            }
          });
          
          if (signUpError && signUpError.message !== 'User already registered') {
            setError(signUpError.message);
            setIsVerifying(false);
            return;
          }
        }
        
        // No OTP verification needed for invites
        setIsVerifying(false);
        return;
      }
      
      // For magic link (existing flow)
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

    // For invite flow, sign in first then update password
    if (inviteType === 'invite') {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: 'temporary',
      });
      
      if (signInError && !signInError.message.includes('Invalid login credentials')) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
    }
    
    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }
    
    // Update user_roles to mark as accepted
    if (inviteType === 'invite') {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('user_roles')
          .update({ 
            user_id: user.id,
            accepted_at: new Date().toISOString()
          })
          .eq('email', email);
      }
    }

    // Redirect based on role
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
        <h1 className="mb-6 text-2xl font-bold">
          {inviteType === 'invite' ? 'Create Your Account' : 'Set Your Password'}
        </h1>
        <p className="mb-4 text-gray-600">
          {inviteType === 'invite' 
            ? `Welcome! Please create a password for your account: `
            : `Welcome! Please set a password for your account: `}
          <strong>{email}</strong>
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

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <SetPasswordForm />
    </Suspense>
  );
}
