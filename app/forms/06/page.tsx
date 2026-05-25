'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import JumpButton from '@/components/JumpButton';

export default function Form06() {
  const [loading, setLoading] = useState(true);
  const [html, setHtml] = useState('');
  const [form01Data, setForm01Data] = useState<any>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>('');
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadForm();
  }, []);

  function replacePlaceholders(text: string, data: any, photoImg: string): string {
    if (!data || !text) return text;
    let result = text;
    
    // Replace form01 placeholders
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      const value = data[key] || '';
      result = result.replace(regex, value);
    });
    
    // Replace profile_picture placeholder
    result = result.replace(/{{profile_picture}}/g, photoImg);
    
    // Replace common placeholders
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
    
    // Get profile photo URL
    const { data: userData } = await supabase
      .from('users')
      .select('profile_photo_url')
      .eq('id', session.user.id)
      .single();
    
    let photoImg = '';
    if (userData?.profile_photo_url) {
      photoImg = `<img src="${userData.profile_photo_url}" style="width:100%;height:100%;object-fit:cover;" alt="Profile Photo">`;
    } else {
      photoImg = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#999;">No photo uploaded</div>';
    }
    setProfilePhotoUrl(photoImg);
    
    // Get template from form_templates table
    const { data: template } = await supabase
      .from('form_templates')
      .select('template_html')
      .eq('form_number', 6)
      .single();

    let renderedHtml = '';
    if (template?.template_html) {
      renderedHtml = replacePlaceholders(template.template_html, form01, photoImg);
    } else {
      // Fallback if no template exists
      const fullName = `${form01?.fn_t1 || ''} ${form01?.mdn_t1 || ''} ${form01?.srn_t1 || ''}`.trim();
      renderedHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px;">
          <h2>Form 06 - Witness Testimony</h2>
          <div style="display:flex; gap:20px;">
            <div style="flex:2;">
              <p><strong>Full Name:</strong> ${fullName}</p>
            </div>
            <div style="flex:1;">
              <div style="border:1px solid black; width:120px; height:150px;">
                ${photoImg}
              </div>
            </div>
          </div>
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
          form_number: 6,
          filled_html: html,
          is_locked: false,
          is_submitted: false,
          generated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,form_number'
        });
    }
    router.push('/forms/07');
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 py-12 flex justify-center items-center">Loading Form 06...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <JumpButton />
          <h1 className="text-2xl font-bold">Form 06</h1>
          <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save & Continue →</button>
        </div>
        <div className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
    </div>
  );
}
