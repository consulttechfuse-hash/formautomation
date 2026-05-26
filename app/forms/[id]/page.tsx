'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function DynamicFormPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params?.id as string;
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    loadFormData();
  }, [formId]);

  const loadFormData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    // Load Form-01 data for placeholders
    const { data: form01 } = await supabase
      .from('form01_data')
      .select('*')
      .eq('user_id', user.id)
      .single();

    setFormData(form01);
    setLoading(false);
  };

  if (!mounted || loading) {
    return <div className="p-8">Loading form...</div>;
  }

  const formNum = parseInt(formId);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Form {formId}</h1>
        
        {formNum === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <input
                type="text"
                defaultValue={formData?.fn_t1 || ''}
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Middle Name</label>
              <input
                type="text"
                defaultValue={formData?.mdn_t1 || ''}
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Surname</label>
              <input
                type="text"
                defaultValue={formData?.fln_t1 || ''}
                className="w-full border rounded p-2"
              />
            </div>
          </div>
        )}

        {formNum > 1 && (
          <div className="space-y-4">
            <p className="text-gray-600">
              This form will be populated with your Form-01 data.
            </p>
            <div className="bg-gray-50 p-4 rounded">
              <p className="font-medium">Form-01 Data:</p>
              <p>Name: {formData?.fn_t1 || 'N/A'} {formData?.fln_t1 || ''}</p>
              <p>Email: {formData?.user_email || 'N/A'}</p>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6">
          {formNum > 1 && (
            <button
              onClick={() => router.push(`/forms/${formNum - 1}`)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Previous
            </button>
          )}
          {formNum < 17 ? (
            <button
              onClick={() => router.push(`/forms/${formNum + 1}`)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ml-auto"
            >
              Next
            </button>
          ) : (
            <button
              onClick={() => router.push('/forms/check-submit')}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ml-auto"
            >
              Review & Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
