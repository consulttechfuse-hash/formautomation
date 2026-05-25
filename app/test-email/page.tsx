'use client';

import { useState } from 'react';

export default function TestEmailPage() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('techbatur@gmail.com');

  const sendTestEmail = async () => {
    setLoading(true);
    setStatus('Sending...');
    
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: 'Test Email from Techfuse DocControl',
          html: '<h1>Test Successful!</h1><p>Your Resend integration is working.</p>'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus('✅ Email sent! Check your inbox.');
      } else {
        setStatus('❌ Failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      setStatus('❌ Error: ' + err);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test Email</h1>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>
      <button 
        onClick={sendTestEmail} 
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Send Test Email'}
      </button>
      {status && <p className="mt-4">{status}</p>}
    </div>
  );
}
