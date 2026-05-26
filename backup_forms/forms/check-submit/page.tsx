export const dynamic = 'force-dynamic';
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function CheckSubmitPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { data } = await supabase
      .from('generated_forms')
      .select('*')
      .eq('user_id', user.id)
      .order('form_number', { ascending: true });

    setForms(data || []);
    setLoading(false);
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Check & Submit</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 mb-4">Review your forms before submitting:</p>
        {forms.map((form) => (
          <div key={form.id} className="border-b py-2">
            <span className="font-medium">Form {form.form_number}</span>
            <span className="ml-2 text-sm text-gray-500">
              {form.is_submitted ? '✅ Submitted' : '⏳ Pending'}
            </span>
          </div>
        ))}
        <button
          onClick={() => router.push('/forms/submit-all')}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit All Forms
        </button>
      </div>
    </div>
  );
}
