'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle, Lock, FileText } from 'lucide-react';

export default function ConfirmSubmitPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');
  const [formStatus, setFormStatus] = useState({
    consent: false,
    form01: false,
    forms0217: false
  });
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { data: flowState } = await supabase
      .from('client_flow_state')
      .select('step_3_consent_completed, step_4_form01_completed, step_5_form_submitted, step_6_completed')
      .eq('client_id', user.id)
      .single();

    if (flowState?.step_6_completed) {
      router.push('/client/dashboard');
      return;
    }

    setFormStatus({
      consent: flowState?.step_3_consent_completed || false,
      form01: flowState?.step_4_form01_completed || false,
      forms0217: flowState?.step_5_form_submitted || false
    });

    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!confirmed) {
      setError('You must confirm that all information is correct');
      return;
    }

    setSubmitting(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Session expired');
      setSubmitting(false);
      return;
    }

    // Update flow state to completed
    const { error: updateError } = await supabase
      .from('client_flow_state')
      .update({
        step_6_completed: true,
        current_step: 6,
        lock_type: 'locked_permanent',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('client_id', user.id);

    if (updateError) {
      setError(updateError.message);
      setSubmitting(false);
      return;
    }

    router.push('/client/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const allFormsCompleted = formStatus.consent && formStatus.form01 && formStatus.forms0217;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Confirm & Submit</h1>
            <p className="text-blue-100 mt-1">Final review of your application</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Completion Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Completion Status</h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Consent Declaration</span>
                  {formStatus.consent ? (
                    <span className="text-green-600 flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Completed</span>
                  ) : (
                    <span className="text-red-600">Incomplete</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Form-01 (Application Form)</span>
                  {formStatus.form01 ? (
                    <span className="text-green-600 flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Completed</span>
                  ) : (
                    <span className="text-red-600">Incomplete</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Forms 02-17</span>
                  {formStatus.forms0217 ? (
                    <span className="text-green-600 flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Completed</span>
                  ) : (
                    <span className="text-red-600">Incomplete</span>
                  )}
                </div>
              </div>
            </div>

            {/* Warning Message */}
            {!allFormsCompleted && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  ⚠️ Please complete all forms before submitting. Incomplete forms are highlighted above.
                </p>
              </div>
            )}

            {/* Lock Message */}
            {allFormsCompleted && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Once submitted, all forms will be permanently locked. No further changes will be allowed.
                </p>
              </div>
            )}

            {/* Final Confirmation Checkbox */}
            <div className="border-t pt-6">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  disabled={!allFormsCompleted}
                  className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                />
                <span className="text-gray-700">
                  I confirm that all information provided across all 17 forms is true, accurate, and complete to the best of my knowledge.
                </span>
              </label>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push('/client/dashboard')}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50"
              >
                Back to Dashboard
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !confirmed || !allFormsCompleted}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? 'Submitting...' : '✓ Submit Application'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
