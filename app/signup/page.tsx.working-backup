"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Sending...');
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: { emailRedirectTo: 'https://techfuseconsult.online/set-password' }
      });
      
      if (error) {
        setMessage('Error: ' + error.message);
        alert('Supabase error: ' + error.message);
      } else {
        setMessage('Check your email for the magic link!');
        alert('Magic link sent!');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setMessage('Exception: ' + errorMessage);
      alert('Exception: ' + errorMessage);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Sign Up (Debug)</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          style={{ padding: '0.5rem', width: '200px' }}
        />
        <button type="submit" style={{ padding: '0.5rem 1rem', marginLeft: '0.5rem' }}>
          Send Magic Link
        </button>
      </form>
      <p>{message}</p>
    </div>
  );
}
