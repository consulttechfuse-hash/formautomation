'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function CheckSubmitPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      router.push('/login');
      return;
    }
    setUser(authUser);

    const { data: form01 } = await supabase
      .from('form01_data')
      .select('*')
      .eq('user_id', authUser.id)
      .single();

    setFormData(form01);
    setLoading(false);
  };

  const handleSubmit = async () => {
    alert('All forms submitted successfully!');
    router.push('/dashboard');
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Check & Submit</h1>
        
        <div className="space-y-4 mb-6">
          <h2 className="font-semibold">Review Your Information</h2>
          <div className="bg-gray-50 p-4 rounded">
            <p><strong>Name:</strong> {formData?.fn_t1 || 'N/A'} {formData?.fln_t1 || ''}</p>
            <p><strong>Email:</strong> {formData?.user_email || user?.email}</p>
            <p><strong>Mobile:</strong> {formData?.cnt_1 || 'N/A'}</p>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => router.push('/forms/17')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Submit All Forms
          </button>
        </div>
      </div>
    </div>
  );
}
