'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import JumpButton from '@/components/JumpButton';

export default function Form02() {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [displayHtml, setDisplayHtml] = useState('');
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      
      const { data: form01 } = await supabase
        .from('form01_data')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      
      setFormData(form01);
      const firstName = form01?.fn_t1 || '';
      const middleName = form01?.mdn_t1 || '';
      const surname = form01?.srn_t1 || '';
      const name = `${firstName} ${middleName} ${surname}`.trim();
      setFullName(name);
      
      const currentDate = new Date();
      
      // HTML for frontend display (with styling)
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6;">
          <h1 style="text-align: center; text-transform: uppercase; font-size: 18px; font-weight: bold;">COMMON CARRY DECLARATION</h1>
          
          <p>I, ${name}, a living ${form01?.gen_t1 || 'man'} over the age of 21, a declared South African National, of sound mind and body, do affirm and declare that I responsibly exercise my right to bear arms, as a peaceful, private South African on South African land and soil, commonly known as South African, in fulfilling my duty to uphold the public law and keep the peace, I will utilize my weapons through visible or concealed carry as is appropriate.</p>
          
          <p>So signed and sealed this ${currentDate.getDate()} day of ${currentDate.toLocaleString('default', { month: 'long' })}, ${currentDate.getFullYear()}</p>
          
          <p>By: ${name}</p>
          
          <hr />
          
          <h3>We are living Witnesses to the Declarant's signature:</h3>
          
          <p><strong>Witness 1:</strong> ${form01?.wtn1_t1 || '_________________'}<br />
          <strong>Email:</strong> ${form01?.wtn1_t3 || '_________________'}</p>
          
          <p><strong>Witness 2:</strong> ${form01?.wtn2_t1 || '_________________'}<br />
          <strong>Email:</strong> ${form01?.wtn2_t3 || '_________________'}</p>
          
          <hr />
          
          <h3>Public Notary:</h3>
          
          <p>I, a Recording Secretary and International Notarial Witness approved by The Land Recording Office, South Africa hereby affirm that the Declarant has been positively identified, and I have witnessed their autographing of this Common Carry Declaration. Established under International- and National Law documents.</p>
          
          <p>On this ______ day of ______ month ______ year<br />
          By: _________________________<br />
          <span style="color: red;">Public Notary Printed name</span></p>
        </div>
      `;
      
      setDisplayHtml(html);
      setLoading(false);
    }
    
    load();
  }, []);

  const handleSubmit = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session && displayHtml) {
      // Save clean HTML (without any extra wrapper)
      await supabase
        .from('generated_forms')
        .upsert({
          user_id: session.user.id,
          user_email: session.user.email,
          form_number: 2,
          filled_html: displayHtml,
          is_locked: false,
          is_submitted: false,
          generated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,form_number'
        });
    }
    router.push('/forms/03');
  };

  if (loading) {
    return <div className="p-12 text-center">Loading Form 02...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <JumpButton />
          <h1 className="text-2xl font-bold">Form 02</h1>
          <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save & Continue →</button>
        </div>
        
        <div className="max-w-none">
          <div dangerouslySetInnerHTML={{ __html: displayHtml }} />
        </div>
      </div>
    </div>
  );
}
