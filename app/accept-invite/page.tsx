"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';

function AcceptInviteForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inviteDetails, setInviteDetails] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [inviteAccepted, setInviteAccepted] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const verifyInvitation = async () => {
      if (!token) {
        setError('Invalid invitation link');
        setLoading(false);
        return;
      }
      
      // Verify the invitation token
      const { data: invitation, error: inviteError } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', token)
        .eq('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .single();
      
      if (inviteError || !invitation) {
        setError('Invalid or expired invitation link');
        setLoading(false);
        return;
      }
      
      setInviteDetails(invitation);
      setEmail(invitation.email);
      
      // Check if user already has an account
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // User is already logged in, accept the invitation
        await acceptInvitation(session.user.id, invitation);
      } else {
        // Send magic link to accept invitation
        setLoading(false);
      }
    };
    
    verifyInvitation();
  }, [token]);
  
  const acceptInvitation = async (userId: string, invitation: any) => {
    // Update user's role in public.users
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        role: invitation.role,
        assigned_agent_id: invitation.assigned_to_id
      })
      .eq('id', userId);
    
    if (updateError) {
      setError('Failed to accept invitation');
      return false;
    }
    
    // Mark invitation as accepted
    await supabase
      .from('invitations')
      .update({ accepted_at: new Date().toISOString(), user_id: userId })
      .eq('id', invitation.id);
    
    return true;
  };
  
  const handleSendMagicLink = async () => {
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: `https://techfuseconsult.online/accept-invite?token=${token}`,
      },
    });
    
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setInviteAccepted(true);
    }
  };
  
  if (loading && !inviteAccepted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (inviteAccepted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-center mb-6">
            <Link href="/" className="inline-block">
              <Image src="/logo.png" alt="Techfuse" width={120} height={60} className="mx-auto" />
            </Link>
          </div>
          <div className="text-green-600 text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-bold mb-2">Invitation Accepted!</h1>
          <p className="text-gray-600 mb-6">
            Check your email for the magic link to complete your account setup.
          </p>
          <button onClick={() => router.push('/login')} className="text-blue-600">
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
          <h1 className="text-2xl font-bold mb-2">Invalid Invitation</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/" className="text-blue-600">Go to Home</Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block">
            <Image src="/logo.png" alt="Techfuse" width={120} height={60} className="mx-auto" />
          </Link>
        </div>
        
        <h1 className="text-2xl font-bold mb-2">You've Been Invited!</h1>
        <p className="text-gray-600 mb-6">
          {inviteDetails?.role === 'admin' 
            ? 'You are being invited as an Administrator.' 
            : 'You are being invited as an Agent.'}
        </p>
        <p className="text-gray-600 mb-6">
          An account will be created for <strong>{email}</strong>
        </p>
        
        <button
          onClick={handleSendMagicLink}
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700"
        >
          {loading ? 'Sending...' : 'Accept Invitation'}
        </button>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AcceptInviteForm />
    </Suspense>
  );
}
