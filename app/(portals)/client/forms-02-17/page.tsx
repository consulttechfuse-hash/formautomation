'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle, Lock, AlertTriangle } from 'lucide-react';

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
  const [formData, setFormData] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [completedForms, setCompletedForms] = useState<Set<number>>(new Set());
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
      .select('step_4_form01_completed, step_5_form_submitted')
      .eq('client_id', user.id)
      .single();

    if (!flowState?.step_4_form01_completed) {
      router.push('/client/form01');
      return;
    }

    // Load Form-01 data
    const { data: form01Data } = await supabase
      .from('form01_data')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (form01Data) {
      setFormData(form01Data);
    }

    // Load all form templates from 2 to 17
    const { data: templates } = await supabase
      .from('form_templates')
      .select('*')
      .in('form_number', [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17])
      .order('form_number', { ascending: true });

    setForms(templates || []);
    
    // Load completed forms
    const { data: generatedForms } = await supabase
      .from('generated_forms')
      .select('form_number, is_submitted')
      .eq('user_id', user.id);

    const completed = new Set<number>();
    generatedForms?.forEach(f => {
      if (f.is_submitted) {
        completed.add(f.form_number);
      }
    });
    setCompletedForms(completed);

    // Check if step 5 is already marked complete
    if (!flowState?.step_5_form_submitted) {
      // Auto-generate first uncompleted form
      const firstUncompleted = templates?.find(t => !completed.has(t.form_number));
      if (firstUncompleted && formData) {
        await generateForm(firstUncompleted, formData);
      }
    }
    
    setLoading(false);
  };

  const generateForm = async (template: FormTemplate, data: any) => {
    if (!userId) return '';
    
    let html = template.template_html;
    
    // Replace placeholders
    const placeholders = html.match(/{{(.*?)}}/g) || [];
    
    for (const placeholder of placeholders) {
      const fieldName = placeholder.replace(/[{}]/g, '');
      let value = data[fieldName] || '';
      
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
    
    // Add anti-copy CSS
    const antiCopyCSS = `
      <style>
        @media print { body { display: none; } }
        * { user-select: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; }
        .confirmation-section { margin-top: 40px; padding-top: 20px; border-top: 2px solid #ccc; }
        .confirm-checkbox { margin-top: 20px; }
        .warning-banner { background-color: #fff3cd; border: 1px solid #ffeeba; padding: 10px; margin-bottom: 20px; border-radius: 5px; color: #856404; }
      </style>
    `;
    
    // Add confirmation section
    const confirmationSection = `
      <div class="confirmation-section">
        <div class="warning-banner">
          📋 Please ensure all your information is correct before confirming.
        </div>
        <div class="confirm-checkbox">
          <label>
            <input type="checkbox" id="formConfirmCheckbox" onchange="window.parent.postMessage({type: 'confirm', value: this.checked}, '*')" />
            <span> I confirm all information in this form is correct</span>
          </label>
        </div>
      </div>
    `;
    
    html = html.replace('</body>', confirmationSection + antiCopyCSS + '</body>');
    
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
      .select('filled_html, is_submitted')
      .eq('user_id', userId)
      .eq('form_number', form.form_number)
      .single();
    
    if (existing?.filled_html) {
      setSelectedForm(form);
      setFilledHtml(existing.filled_html);
      setConfirmed(existing.is_submitted);
    } else if (formData) {
      const html = await generateForm(form, formData);
      setSelectedForm(form);
      setFilledHtml(html);
      setConfirmed(false);
    }
  };

  const handleConfirm = async () => {
    if (!confirmed || !selectedForm) return;
    
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
      alert('Error confirming form: ' + error.message);
    } else {
      // Add to completed set
      setCompletedForms(prev => new Set([...prev, selectedForm.form_number]));
      setSelectedForm(null);
      setFilledHtml('');
      
      // Check if all forms are completed
      const allForms = [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17];
      const allCompleted = allForms.every(f => completedForms.has(f) || f === selectedForm.form_number);
      
      if (allCompleted) {
        // Mark step 5 as completed
        await supabase
          .from('client_flow_state')
          .update({
            step_5_form_submitted: true,
            current_step: 6,
            updated_at: new Date().toISOString()
          })
          .eq('client_id', userId);
        
        alert('All forms completed! Please proceed to final confirmation.');
        router.push('/client/confirm-submit');
      } else {
        alert(`Form ${selectedForm.form_number} confirmed! Proceed to the next form.`);
      }
    }
    
    setSubmitting(false);
  };

  // Listen for checkbox changes from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'confirm') {
        setConfirmed(event.data.value);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (selectedForm) {
    const isAlreadySubmitted = completedForms.has(selectedForm.form_number);
    
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
                    setConfirmed(false);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  ← Back to List
                </button>
                {!isAlreadySubmitted && (
                  <button
                    onClick={handleConfirm}
                    disabled={!confirmed || submitting}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {submitting ? 'Confirming...' : 'Confirm & Continue →'}
                  </button>
                )}
              </div>
            </div>
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              {isAlreadySubmitted ? (
                <div className="text-center py-12">
                  <Lock className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Form Already Confirmed</h2>
                  <p className="text-gray-600 mb-6">This form has already been submitted and locked.</p>
                  <button
                    onClick={() => setSelectedForm(null)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Back to Forms List
                  </button>
                </div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: filledHtml }} />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get next form to complete
  const nextFormNumber = [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17].find(n => !completedForms.has(n));
  const allCompleted = !nextFormNumber;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Forms 02-17</h1>
            <p className="text-blue-100 mt-1">Complete each form in order. You cannot go back once confirmed.</p>
          </div>
          
          <div className="p-6">
            {allCompleted ? (
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">All Forms Completed!</h2>
                <p className="text-gray-600 mb-6">You have successfully completed all forms.</p>
                <button
                  onClick={() => router.push('/client/confirm-submit')}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Proceed to Final Confirmation →
                </button>
              </div>
            ) : (
              <>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-medium">Important:</span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    Please review each form carefully. Once you confirm a form, it will be locked and you cannot go back.
                    Complete forms in order from 02 to 17.
                  </p>
                </div>

                <div className="space-y-4">
                  {forms.map((form) => {
                    const isCompleted = completedForms.has(form.form_number);
                    const isNext = form.form_number === nextFormNumber;
                    const isLocked = !isNext && !isCompleted;
                    
                    return (
                      <div key={form.form_number} className={`border rounded-lg p-4 flex justify-between items-center ${
                        isCompleted ? 'bg-green-50 border-green-200' : 
                        isNext ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div>
                          <h3 className="font-semibold text-lg">
                            Form {form.form_number}
                            {isCompleted && <span className="ml-2 text-green-600 text-sm">✓ Completed</span>}
                            {isNext && <span className="ml-2 text-blue-600 text-sm">← Next to complete</span>}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {isCompleted ? 'Already confirmed and locked' : 
                             isNext ? 'Review and confirm this form' : 'Complete previous forms first'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleViewForm(form)}
                          disabled={isLocked}
                          className={`px-6 py-2 rounded-lg transition-colors ${
                            isCompleted 
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : isNext 
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {isCompleted ? 'Completed' : isNext ? 'Open Form →' : 'Locked'}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => router.push('/client/dashboard')}
                    className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    ← Back to Dashboard
                  </button>
                  <button
                    onClick={() => router.push('/client/confirm-submit')}
                    disabled={!allCompleted}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    Skip to Final Confirmation →
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
