"use client";

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

  const loadFlowState = async () => {
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/login');
      return;
    }

    // Fetch flow state from our API
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
      // Create initial flow state
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
    // Validate if user can access this step
    if (!flowState) return;

    // Check if permanently locked
    if (flowState.lock_type === 'locked_permanent') {
      if (stepId === 6 && flowState.step_6_completed) {
        // Allow viewing completed forms
        router.push('/client/view-forms');
      } else {
        setError('This application is locked. Contact owner for assistance.');
      }
      return;
    }

    // Check if step is locked
    if (flowState.lock_type === 'locked_step' && flowState.locked_step === stepId) {
      setError(`Step ${stepId} is locked. An unlock request has been submitted.`);
      return;
    }

    // Check prerequisites
    const canAccess = await checkPrerequisites(stepId);
    if (!canAccess) {
      setError(`Please complete previous steps before accessing step ${stepId}.`);
      return;
    }

    router.push(path);
  };

  const checkPrerequisites = async (targetStep: number): Promise<boolean> => {
    if (!flowState) return false;

    // Step 1 has no prerequisites
    if (targetStep === 1) return true;

    // Step 2 requires step 1
    if (targetStep === 2) {
      return flowState.step_1_admin_selected === true;
    }

    // Step 3 requires steps 1-2
    if (targetStep === 3) {
      return flowState.step_1_admin_selected === true && 
             flowState.step_2_payment_completed === true;
    }

    // Step 4 requires steps 1-3
    if (targetStep === 4) {
      return flowState.step_1_admin_selected === true && 
             flowState.step_2_payment_completed === true &&
             flowState.step_3_consent_completed === true;
    }

    // Step 5 requires steps 1-4
    if (targetStep === 5) {
      return flowState.step_1_admin_selected === true && 
             flowState.step_2_payment_completed === true &&
             flowState.step_3_consent_completed === true &&
             flowState.step_4_form01_completed === true;
    }

    // Step 6 requires steps 1-5
    if (targetStep === 6) {
      return flowState.step_1_admin_selected === true && 
             flowState.step_2_payment_completed === true &&
             flowState.step_3_consent_completed === true &&
             flowState.step_4_form01_completed === true &&
             flowState.step_5_form_submitted === true;
    }

    return false;
  };

  const getButtonState = (stepId: number, completed: boolean) => {
    if (!flowState) return { disabled: true, label: 'Loading...', action: null };

    // Permanently locked
    if (flowState.lock_type === 'locked_permanent') {
      if (stepId === 6 && completed) {
        return { disabled: false, label: 'View Forms', action: () => router.push('/client/view-forms') };
      }
      return { disabled: true, label: 'Locked', action: null };
    }

    // Step specifically locked
    if (flowState.lock_type === 'locked_step' && flowState.locked_step === stepId) {
      return { disabled: true, label: 'Locked (Request Pending)', action: null };
    }

    // Already completed
    if (completed) {
      return { disabled: true, label: 'Completed ✓', action: null };
    }

    // Check if prerequisites are met
    const canAccess = (() => {
      if (stepId === 1) return true;
      if (stepId === 2) return flowState.step_1_admin_selected;
      if (stepId === 3) return flowState.step_1_admin_selected && flowState.step_2_payment_completed;
      if (stepId === 4) return flowState.step_1_admin_selected && flowState.step_2_payment_completed && flowState.step_3_consent_completed;
      if (stepId === 5) return flowState.step_1_admin_selected && flowState.step_2_payment_completed && flowState.step_3_consent_completed && flowState.step_4_form01_completed;
      if (stepId === 6) return flowState.step_1_admin_selected && flowState.step_2_payment_completed && flowState.step_3_consent_completed && flowState.step_4_form01_completed && flowState.step_5_form_submitted;
      return false;
    })();

    if (!canAccess) {
      return { disabled: true, label: 'Locked (Complete Previous)', action: null };
    }

    // Ready to start
    const paths: Record<number, string> = {
      1: '/client/select-admin',
      2: '/client/select-payment',
      3: '/client/consent',
      4: '/client/form-01',
      5: '/client/forms',
      6: '/client/confirm-submit',
    };

    return { 
      disabled: false, 
      label: 'Start', 
      action: () => router.push(paths[stepId])
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const steps = [
    { id: 1, name: 'Select Admin', completed: flowState?.step_1_admin_selected || false },
    { id: 2, name: 'Make Payment', completed: flowState?.step_2_payment_completed || false },
    { id: 3, name: 'Consent & Declaration', completed: flowState?.step_3_consent_completed || false },
    { id: 4, name: 'Complete Form-01', completed: flowState?.step_4_form01_completed || false },
    { id: 5, name: 'Complete Forms 02-17', completed: flowState?.step_5_form_submitted || false },
    { id: 6, name: 'Confirm & Submit', completed: flowState?.step_6_completed || false },
  ];

  const currentStep = steps.find(step => !step.completed);
  const isPermanentlyLocked = flowState?.lock_type === 'locked_permanent';

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 mb-8 rounded-lg shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Application Progress</h1>
          <p className="text-blue-100 mt-1">Complete all steps to submit your application</p>
        </div>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push('/login');
          }}
          className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="text-red-600 text-sm mt-1 underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Lock Status Banner */}
      {isPermanentlyLocked && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 font-medium">✓ Application Complete & Locked</p>
          <p className="text-green-600 text-sm mt-1">You can view and download your forms, but cannot make changes.</p>
        </div>
      )}

      {flowState?.lock_type === 'locked_step' && !isPermanentlyLocked && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-700 font-medium">⏳ Step {flowState.locked_step} Locked</p>
          <p className="text-yellow-600 text-sm mt-1">{flowState.locked_reason || 'Unlock request pending admin review.'}</p>
        </div>
      )}

      {/* Progress Steps */}
      <div className="space-y-4">
        {steps.map((step) => {
          const buttonState = getButtonState(step.id, step.completed);
          
          return (
            <div
              key={step.id}
              className={`border rounded-lg p-4 flex justify-between items-center ${
                step.completed ? 'bg-green-50 border-green-200' : 'bg-white'
              } ${buttonState.disabled && !step.completed ? 'opacity-60' : ''}`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">Step {step.id}</span>
                  <span className="text-gray-600">{step.name}</span>
                  {step.completed && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">✓ Complete</span>
                  )}
                  {!step.completed && buttonState.disabled && buttonState.label === 'Locked (Request Pending)' && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">⏳ Locked</span>
                  )}
                  {!step.completed && buttonState.disabled && buttonState.label === 'Locked (Complete Previous)' && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">🔒 Prerequisite Required</span>
                  )}
                </div>
                {step.completed && step.id === 6 && (
                  <p className="text-sm text-green-600 mt-1">Final confirmation completed</p>
                )}
              </div>
              {!step.completed && buttonState.disabled === false && buttonState.action && (
                <button
                  onClick={buttonState.action}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {buttonState.label}
                </button>
              )}
              {step.completed && step.id === 6 && (
                <button
                  onClick={() => router.push('/client/view-forms')}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  View Forms
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Next Step Indicator */}
      {currentStep && !isPermanentlyLocked && flowState?.lock_type !== 'locked_step' && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-700">
            <strong>Next:</strong> Complete {currentStep.name}
          </p>
        </div>
      )}
    </div>
  );
}
