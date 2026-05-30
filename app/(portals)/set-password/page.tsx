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
  const [inviteToken, setInviteToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(true);
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
      
      // For invite type, verify the token in user_roles
      if (type === 'invite') {
        const { data: invite, error: inviteError } = await supabase
          .from('user_roles')
          .select('id, invitation_token, invitation_expires_at, accepted_at')
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
        
        // Invitation is valid, show password form
        setIsVerifying(false);
        return;
      }
      
      // For magic link flow (existing)
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

    const type = searchParams.get('type');
    
    try {
      if (type === 'invite') {
        // For invites: check if user exists in auth, create if not
        const { data: { user: existingUser } } = await supabase.auth.getUser();
        
        if (!existingUser) {
          // Create new auth user
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
              emailRedirectTo: `https://techfuseconsult.online/set-password?token=${inviteToken}&email=${email}&type=invite`
            }
          });
          
          if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
            return;
          }
          
          // Update user_roles with the new user_id
          await supabase
            .from('user_roles')
            .update({ 
              user_id: signUpData.user?.id,
              accepted_at: new Date().toISOString()
            })
            .eq('invitation_token', inviteToken);
          
          // Sign them in
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
          });
          
          if (signInError) {
            setError(signInError.message);
            setLoading(false);
            return;
          }
        } else {
          // User exists, just update password
          const { error: updateError } = await supabase.auth.updateUser({
            password: password,
          });
          
          if (updateError) {
            setError(updateError.message);
            setLoading(false);
            return;
          }
          
          // Update user_roles
          await supabase
            .from('user_roles')
            .update({ 
              user_id: existingUser.id,
              accepted_at: new Date().toISOString()
            })
            .eq('invitation_token', inviteToken);
        }
      } else {
        // For magic link flow
        const { error: updateError } = await supabase.auth.updateUser({
          password: password,
        });
        
        if (updateError) {
          setError(updateError.message);
          setLoading(false);
          return;
        }
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
          <p className="mt-4 text-gray-600">Verifying your invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Invalid Invitation</h1>
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">Create Your Account</h1>
        <p className="mb-4 text-gray-600">
          Welcome! Please create a password for your account: <strong>{email}</strong>
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
              className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
              required
              minLength={6}
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
              className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account & Continue'}
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
