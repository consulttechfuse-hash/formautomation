"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useFlowValidation } from '@/lib/hooks/useFlowValidation';

export default function ClientDashboard() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const loadDashboard = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        router.push('/login');
        return;
      }
      
      // Get flow state first
      let { data: flowState } = await supabase
        .from('client_flow_state')
        .select('*')
        .eq('client_id', authUser.id)
        .single();
      
      // If no flow state, create one
      if (!flowState) {
        const { data: newFlow } = await supabase
          .from('client_flow_state')
          .insert({
            client_id: authUser.id,
            current_step: 1,
            lock_type: 'unlocked',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        flowState = newFlow;
      }
      
      // Also get user_roles for backward compatibility
      let { data: userProgress } = await supabase
        .from('user_roles')
        .select('has_consented, onboarding_complete, onboarding_submitted, has_paid, assigned_admin_id')
        .eq('user_id', authUser.id)
        .single();
      
      setProgress({
        ...userProgress,
        flowState
      });
      setLoading(false);
    };
    
    loadDashboard();
  }, [router, supabase]);

  // Define steps based on flow state
  const getSteps = (flowState: any) => {
    const steps = [
      { id: 1, name: 'Select Admin', path: '/client/select-admin', 
        completed: flowState?.step_1_admin_selected || false,
        locked: flowState?.lock_type === 'locked_permanent' || (flowState?.lock_type === 'locked_step' && flowState?.locked_step === 1) },
      { id: 2, name: 'Make Payment', path: '/client/select-payment', 
        completed: flowState?.step_2_payment_completed || false,
        locked: flowState?.lock_type === 'locked_permanent' || (flowState?.lock_type === 'locked_step' && flowState?.locked_step === 2) },
      { id: 3, name: 'Consent & Declaration', path: '/client/consent', 
        completed: flowState?.step_3_consent_completed || false,
        locked: flowState?.lock_type === 'locked_permanent' || (flowState?.lock_type === 'locked_step' && flowState?.locked_step === 3) },
      { id: 4, name: 'Complete Form-01', path: '/client/form-01', 
        completed: flowState?.step_4_form01_completed || false,
        locked: flowState?.lock_type === 'locked_permanent' || (flowState?.lock_type === 'locked_step' && flowState?.locked_step === 4) },
      { id: 5, name: 'Complete Forms 02-17', path: '/client/forms', 
        completed: flowState?.step_5_form_submitted || false,
        locked: flowState?.lock_type === 'locked_permanent' || (flowState?.lock_type === 'locked_step' && flowState?.locked_step === 5) },
      { id: 6, name: 'Confirm & Submit', path: '/client/confirm-submit', 
        completed: flowState?.step_6_completed || false,
        locked: flowState?.lock_type === 'locked_permanent' },
    ];
    return steps;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  const steps = getSteps(progress?.flowState);
  const currentStep = steps.find(step => step.completed === false);
  const isPermanentlyLocked = progress?.flowState?.lock_type === 'locked_permanent';
  const isStepLocked = progress?.flowState?.lock_type === 'locked_step';

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-primary text-primary-foreground p-4 mb-8 rounded-lg shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Welcome to Techfuse DocControl</h1>
          <p className="text-primary-foreground/80 mt-1">Follow the steps below to complete your application.</p>
        </div>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push('/login');
          }}
          className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Lock Status Banner */}
      {isPermanentlyLocked && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-medium">🔒 This application is locked and complete.</p>
          <p className="text-red-600 text-sm mt-1">You can view and download your forms, but cannot make changes.</p>
        </div>
      )}

      {isStepLocked && !isPermanentlyLocked && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-700 font-medium">⏳ Unlock Request Pending</p>
          <p className="text-yellow-600 text-sm mt-1">Step {progress?.flowState?.locked_step} is locked. Your request is being reviewed by an admin.</p>
        </div>
      )}

      <div className="space-y-4">
        {steps.map((step) => {
          const isDisabled = step.locked || (step.completed && isPermanentlyLocked);
          
          return (
            <div
              key={step.id}
              className={`border rounded-lg p-4 flex justify-between items-center ${
                step.completed ? 'bg-green-50 border-green-200' : 'bg-white'
              } ${isDisabled ? 'opacity-60' : ''}`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{step.name}</h3>
                  {step.locked && !step.completed && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">🔒 Locked</span>
                  )}
                  {step.completed && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">✓ Completed</span>
                  )}
                </div>
                {step.completed && step.id === 6 && (
                  <p className="text-sm text-green-600 mt-1">Final confirmation complete</p>
                )}
              </div>
              {!step.completed && !step.locked && step.path && (
                <button
                  onClick={() => router.push(step.path)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Start
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

      {currentStep && !isPermanentlyLocked && !isStepLocked && (
        <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-primary">
            <strong>Next step:</strong> {currentStep.name}
          </p>
        </div>
      )}
    </div>
  );
}
