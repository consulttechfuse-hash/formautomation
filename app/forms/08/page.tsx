'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import JumpButton from '@/components/JumpButton';

export default function FormPage() {
  const [loading, setLoading] = useState(true);
  const [html, setHtml] = useState('');
  const [form01Data, setForm01Data] = useState<any>(null);
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const pathParts = window.location.pathname.split('/');
  const currentFormNumber = parseInt(pathParts[pathParts.length - 1], 10);

  useEffect(() => {
    loadForm();
  }, []);

  function replacePlaceholders(text: string, data: any): string {
    if (!data || !text) return text;
    let result = text;
    
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      const value = data[key] || '';
      result = result.replace(regex, value);
    });
    
    const fullName = `${data?.fn_t1 || ''} ${data?.mdn_t1 || ''} ${data?.srn_t1 || ''}`.trim();
    result = result.replace(/{{full_name}}/g, fullName);
    result = result.replace(/{{full_name_upper}}/g, fullName.toUpperCase());
    result = result.replace(/{{current_date}}/g, new Date().toLocaleDateString());
    result = result.replace(/{{current_year}}/g, new Date().getFullYear().toString());
    result = result.replace(/{{current_month}}/g, (new Date().getMonth() + 1).toString());
    result = result.replace(/{{current_day}}/g, new Date().getDate().toString());
    result = result.replace(/{{sdy_t1}}/g, new Date().getDate().toString());
    result = result.replace(/{{smth_t1}}/g, new Date().toLocaleString('default', { month: 'long' }));
    
    return result;
  }

  async function loadForm() {
    setLoading(true);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }

    // Get Form-01 data
    const { data: form01 } = await supabase
      .from('form01_data')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
    setForm01Data(form01 || {});
    
    // Get template from form_templates table
    const { data: template } = await supabase
      .from('form_templates')
      .select('template_html')
      .eq('form_number', currentFormNumber)
      .single();

    let renderedHtml = '';
    if (template?.template_html) {
      renderedHtml = replacePlaceholders(template.template_html, form01);
    } else {
      // Fallback if no template exists
      const fullName = `${form01?.fn_t1 || ''} ${form01?.mdn_t1 || ''} ${form01?.srn_t1 || ''}`.trim();
      renderedHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px;">
          <h2>Form ${currentFormNumber}</h2>
          <p><strong>Full Name:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${form01?.ema_t1 || ''}</p>
          <p><strong>Phone:</strong> ${form01?.cnt_1 || ''}</p>
        </div>
      `;
    }
    
    setHtml(renderedHtml);
    setLoading(false);
  }

  const handleSubmit = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session && html) {
      await supabase
        .from('generated_forms')
        .upsert({
          user_id: session.user.id,
          user_email: session.user.email,
          form_number: currentFormNumber,
          filled_html: html,
          is_locked: false,
          is_submitted: false,
          generated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,form_number'
        });
    }
    
    const nextForm = currentFormNumber + 1;
    if (nextForm <= 17) {
      router.push(`/forms/${String(nextForm).padStart(2, '0')}`);
    } else {
      router.push('/forms/check-submit');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 py-12 flex justify-center items-center">Loading Form {currentFormNumber}...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <JumpButton />
          <h1 className="text-2xl font-bold">Form {currentFormNumber}</h1>
          <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save & Continue →</button>
        </div>
        <div className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
    </div>
  );
}
