'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function Form01() {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});
  const router = useRouter();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Save form data logic here
    router.push('/forms/02');
  };

  if (loading) {
    return <div className="text-center p-12">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Form 01 - Personal Information</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input type="text" className="w-full p-2 border rounded" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" className="w-full p-2 border rounded" />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">
            Continue to Form 02 →
          </button>
        </form>
        <div className="mt-4 text-sm text-gray-400">
          <a href="/forms/06">Skip to Form 06 (Test Photo)</a>
        </div>
      </div>
    </div>
  );
}
