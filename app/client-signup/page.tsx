"use client";

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

function ClientSignupForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verifying, setVerifying] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          setError('Invalid or expired magic link. Please request a new one.');
          setVerifying(false);
          return;
        }
        
        setEmail(user.email || (emailParam ? decodeURIComponent(emailParam) : ''));
        
        // Check if user already has profile data
        const { data: userRole } = await supabase
          .from('user_roles')
          .select('first_name, last_name')
          .eq('user_id', user.id)
          .single();
        
        if (userRole && userRole.first_name && userRole.last_name) {
          // Already completed, redirect to dashboard
          router.push('/client/dashboard');
          return;
        }
        
        setVerifying(false);
      } catch (err) {
        setError('Failed to verify magic link. Please try again.');
        setVerifying(false);
      }
    };
    
    checkAuth();
  }, [supabase.auth, emailParam, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim()) {
      setError('Please enter your first name');
      return;
    }
    
    if (!lastName.trim()) {
      setError('Please enter your last name');
      return;
    }
    
    if (!password) {
      setError('Please enter a password');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('Session expired. Please request a new magic link.');
        setLoading(false);
        return;
      }
      
      // Update password first
      await supabase.auth.updateUser({ password: password });
      
      const finalEmail = email || user.email || '';
      
      // Call the working accept-invite API
      // We need to create a temporary invitation token for the client
      // First, check if user_roles exists for this user
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (!existingRole) {
        // Create a temporary invitation token
        const tempToken = crypto.randomUUID();
        
        // Insert user_roles first
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            email: finalEmail,
            role: 'client',
            invitation_token: tempToken,
            created_at: new Date().toISOString(),
          });
        
        if (insertError) {
          console.error('Insert error:', insertError);
          setError('Failed to create profile');
          setLoading(false);
          return;
        }
        
        // Now call accept-invite API to update with names
        const response = await fetch('/api/accept-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: tempToken,
            email: finalEmail,
            firstName: firstName,
            lastName: lastName,
            phoneNumber: phoneNumber,
            password: password,
            role: 'client',
          }),
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          console.error('Accept invite error:', result);
          setError(result.error || 'Failed to save profile');
          setLoading(false);
          return;
        }
        
        console.log('Profile saved via accept-invite:', result);
      } else {
        // Update existing record directly
        const { error: updateError } = await supabase
          .from('user_roles')
          .update({
            first_name: firstName,
            last_name: lastName,
            phone_number: phoneNumber,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);
        
        if (updateError) {
          console.error('Update error:', updateError);
          setError('Failed to save profile');
          setLoading(false);
          return;
        }
        
        // Also update users table
        await supabase
          .from('users')
          .upsert({
            id: user.id,
            email: finalEmail,
            role: 'client',
            status: 'active',
            first_name: firstName,
            last_name: lastName,
            phone_number: phoneNumber,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' });
      }
      
      router.push('/client/dashboard');
    } catch (err) {
      console.error('Submit error:', err);
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Verifying your link...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2">Invalid Magic Link</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/signup" className="text-blue-600">Request New Magic Link</Link>
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
          <h1 className="text-3xl font-bold text-gray-800">Complete Your Registration</h1>
          <p className="text-gray-600 mt-2">Create your account to get started with DocControl</p>
          <p className="text-gray-600 text-sm mt-1">Email: <strong>{email}</strong></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="John"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Doe"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="+27 XX XXX XXXX"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ClientSignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ClientSignupForm />
    </Suspense>
  );
}
