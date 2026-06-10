'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface FlowState {
  id: string;
  client_id: string;
  current_step: number;
  step_1_admin_selected: boolean;
  step_2_payment_completed: boolean;
  step_3_consent_completed: boolean;
  step_4_form01_completed: boolean;
  step_5_form_submitted: boolean;
  step_6_completed: boolean;
  lock_type: string;
  locked_step: number;
  locked_reason: string;
}

export default function ClientDashboard() {
  const [loading, setLoading] = useState(true);
  const [flowState, setFlowState] = useState<FlowState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadFlowState();
  }, []);

  const handleSignOut = async () => {
    // Set presence to offline with current timestamp
    await fetch('/api/presence/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'offline' })
    }).catch(() => {});
    
    // Small delay to ensure API call completes
    await new Promise(resolve => setTimeout(resolve, 100));
    
    await supabase.auth.signOut();
    router.push('/login');
  };

  const loadFlowState = async () => {
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/login');
      return;
    }

    const response = await fetch('/api/client/flow');
    const data = await response.json();

    if (!response.ok) {
      setError(data.error || 'Failed to load your progress');
      setLoading(false);
      return;
    }

    if (data.flowStates && data.flowStates.length > 0) {
      setFlowState(data.flowStates[0]);
    } else {
      const { data: newFlow, error: createError } = await supabase
        .from('client_flow_state')
        .insert({
          client_id: user.id,
          current_step: 1,
          lock_type: 'unlocked',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (!createError && newFlow) {
        setFlowState(newFlow);
      }
    }

    setLoading(false);
  };

  const handleStepClick = async (stepId: number, path: string) => {
    if (!flowState) return;

    if (flowState.lock_type === 'locked_permanent') {
      if (stepId === 6 && flowState.step_6_completed) {
        router.push('/client/view-forms');
      } else {
        setError('This application is locked. Contact owner for assistance.');
      }
      return;
    }

    if (flowState.lock_type === 'locked_step' && flowState.locked_step === stepId) {
      setError(`Step ${stepId} is locked. An unlock request has been submitted.`);
      return;
    }

    const canAccess = await checkPrerequisites(stepId);
    if (!canAccess) {
      setError('Please complete previous steps first.');
      return;
    }

    router.push(path);
  };

  const checkPrerequisites = async (stepId: number): Promise<boolean> => {
    if (!flowState) return false;
    
    switch (stepId) {
      case 1: return true;
      case 2: return flowState.step_1_admin_selected === true;
      case 3: return flowState.step_2_payment_completed === true;
      case 4: return flowState.step_3_consent_completed === true;
      case 5: return flowState.step_4_form01_completed === true;
      case 6: return flowState.step_5_form_submitted === true;
      default: return false;
    }
  };

  const steps = [
    { id: 1, name: 'Select Admin', path: '/client/select-admin', completed: flowState?.step_1_admin_selected || false, locked: false },
    { id: 2, name: 'Make Payment', path: '/client/select-payment', completed: flowState?.step_2_payment_completed || false, locked: !flowState?.step_1_admin_selected },
    { id: 3, name: 'Consent & Declaration', path: '/client/consent', completed: flowState?.step_3_consent_completed || false, locked: !flowState?.step_2_payment_completed },
    { id: 4, name: 'Complete Form-01', path: '/client/form01', completed: flowState?.step_4_form01_completed || false, locked: !flowState?.step_3_consent_completed },
    { id: 5, name: 'Complete Forms 02-17', path: '/client/forms-02-17', completed: flowState?.step_5_form_submitted || false, locked: !flowState?.step_4_form01_completed },
    { id: 6, name: 'Confirm & Submit', path: '/client/confirm-submit', completed: flowState?.step_6_completed || false, locked: !flowState?.step_5_form_submitted },
  ];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Application Progress</h1>
          <button onClick={handleSignOut} className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">Sign Out</button>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-gray-600 mb-8">Complete all steps to submit your application</p>
        
        <div className="space-y-4">
          {steps.map((step) => (
            <div key={step.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    step.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step.completed ? '✓' : step.id}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Step {step.id}: {step.name}</h3>
                    {step.locked && <p className="text-sm text-gray-500">Prerequisite Required</p>}
                    {step.completed && <p className="text-sm text-green-600">Complete</p>}
                  </div>
                </div>
                <button
                  onClick={() => handleStepClick(step.id, step.path)}
                  disabled={step.locked}
                  className={`px-6 py-2 rounded-lg transition-colors ${
                    step.completed 
                      ? 'bg-gray-100 text-gray-500 cursor-default'
                      : step.locked 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {step.completed ? 'Completed' : 'Start'}
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
