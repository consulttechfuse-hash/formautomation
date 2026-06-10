'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface FormTemplate {
  id: number;
  form_number: number;
  template_html: string;
  unlock_after_form: number;
}

export default function Forms0217Page() {
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState<FormTemplate[]>([]);
  const [selectedForm, setSelectedForm] = useState<FormTemplate | null>(null);
  const [filledHtml, setFilledHtml] = useState('');
  const [form01Data, setForm01Data] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadFormsAndData();
  }, []);

  const loadFormsAndData = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setUserId(user.id);

    // Check if Form-01 is completed
    const { data: flowState } = await supabase
      .from('client_flow_state')
      .select('step_4_form01_completed')
      .eq('client_id', user.id)
      .single();

    if (!flowState?.step_4_form01_completed) {
      router.push('/client/form01');
      return;
    }

    // Load Form-01 data for auto-population
    const { data: form01DataResult } = await supabase
      .from('form01_data')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (form01DataResult) {
      setForm01Data(form01DataResult);
    }

    // Load all form templates from 2 to 17
    const { data: templates } = await supabase
      .from('form_templates')
      .select('*')
      .in('form_number', [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17])
      .order('form_number', { ascending: true });

    setForms(templates || []);
    
    // Load existing generated forms
    const { data: generatedForms } = await supabase
      .from('generated_forms')
      .select('form_number, filled_html, is_submitted')
      .eq('user_id', user.id);

    // Mark which forms are already submitted
    const submittedMap = new Map();
    generatedForms?.forEach(f => submittedMap.set(f.form_number, { filled_html: f.filled_html, is_submitted: f.is_submitted }));
    
    setLoading(false);
  };

  const generateForm = async (template: FormTemplate, data: any) => {
    if (!userId) return '';
    
    let html = template.template_html;
    
    // Replace all placeholders with actual data from Form-01
    const placeholders = html.match(/{{(.*?)}}/g) || [];
    
    for (const placeholder of placeholders) {
      const fieldName = placeholder.replace(/[{}]/g, '');
      let value = data[fieldName] || '';
      
      // Handle special date calculations
      if (fieldName === 'sdy_t1') {
        value = new Date().getDate().toString();
      } else if (fieldName === 'smth_t1') {
        value = new Date().toLocaleString('default', { month: 'long' });
      } else if (fieldName === 'gen_t1') {
        value = data['gen_t1'] || 'person';
      } else if (fieldName === 'fln_t1') {
        value = `${data['fn_t1'] || ''} ${data['mdn_t1'] || ''} ${data['srn_t1'] || ''}`.trim().replace(/\s+/g, ' ');
      }
      
      html = html.replace(new RegExp(`{{${fieldName}}}`, 'g'), value || `[${fieldName}]`);
    }
    
    // Save generated form
    const { error } = await supabase
      .from('generated_forms')
      .upsert({
        user_id: userId,
        form_number: template.form_number,
        filled_html: html,
        generated_at: new Date().toISOString(),
        is_locked: false,
        is_submitted: false
      }, {
        onConflict: 'user_id,form_number'
      });
    
    if (error) {
      console.error(`Error generating form ${template.form_number}:`, error);
    }
    
    return html;
  };

  const handleViewForm = async (form: FormTemplate) => {
    if (!userId) return;
    
    // Get existing generated form
    const { data: existing } = await supabase
      .from('generated_forms')
      .select('filled_html')
      .eq('user_id', userId)
      .eq('form_number', form.form_number)
      .single();
    
    if (existing?.filled_html) {
      setSelectedForm(form);
      setFilledHtml(existing.filled_html);
    } else if (form01Data) {
      const html = await generateForm(form, form01Data);
      setSelectedForm(form);
      setFilledHtml(html);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(filledHtml);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleSubmit = async () => {
    if (!selectedForm || !userId) return;
    
    setSubmitting(true);
    
    const { error } = await supabase
      .from('generated_forms')
      .update({
        is_submitted: true,
        submitted_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('form_number', selectedForm.form_number);
    
    if (error) {
      alert('Error submitting form: ' + error.message);
    } else {
      alert(`Form ${selectedForm.form_number} submitted successfully!`);
      setSelectedForm(null);
      setFilledHtml('');
      // Refresh to show updated status
      await loadFormsAndData();
    }
    
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (selectedForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">Form {selectedForm.form_number}</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedForm(null);
                    setFilledHtml('');
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  ← Back to List
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  🖨️ Print
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : '✓ Submit Form'}
                </button>
              </div>
            </div>
            <div className="p-6">
              <div dangerouslySetInnerHTML={{ __html: filledHtml }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Forms 02-17</h1>
            <p className="text-blue-100 mt-1">Complete and submit each form below</p>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {forms.map((form) => (
                <div key={form.form_number} className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50">
                  <div>
                    <h3 className="font-semibold text-lg">Form {form.form_number}</h3>
                    <p className="text-sm text-gray-500">Click to view and complete this form</p>
                  </div>
                  <button
                    onClick={() => handleViewForm(form)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Open Form →
                  </button>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-between">
              <button
                onClick={() => router.push('/client/dashboard')}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50"
              >
                ← Back to Dashboard
              </button>
              <button
                onClick={async () => {
                  if (!userId) return;
                  await supabase
                    .from('client_flow_state')
                    .update({
                      step_5_form_submitted: true,
                      current_step: 6,
                      updated_at: new Date().toISOString()
                    })
                    .eq('client_id', userId);
                  router.push('/client/confirm-submit');
                }}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Continue to Step 6 →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
