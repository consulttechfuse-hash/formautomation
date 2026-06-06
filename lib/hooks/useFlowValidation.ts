import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface FlowState {
  current_step: number;
  lock_type: string;
  locked_step: number;
  step_1_admin_selected: boolean;
  step_2_payment_completed: boolean;
  step_3_consent_completed: boolean;
  step_4_form01_completed: boolean;
  step_5_form_submitted: boolean;
  step_6_completed: boolean;
}

export function useFlowValidation(targetStep: number) {
  const [flowState, setFlowState] = useState<FlowState | null>(null);
  const [loading, setLoading] = useState(true);
  const [canAccess, setCanAccess] = useState(false);
  const [redirectTo, setRedirectTo] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const validateAccess = async () => {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setRedirectTo(-1); // redirect to login
        setLoading(false);
        return;
      }

      // Get flow state
      const { data: flowData, error: flowError } = await supabase
        .from('client_flow_state')
        .select('*')
        .eq('client_id', user.id)
        .single();

      if (flowError || !flowData) {
        // No flow state means client is at step 1
        if (targetStep === 1) {
          setCanAccess(true);
        } else {
          setRedirectTo(1);
          setError('Please complete previous steps first.');
        }
        setLoading(false);
        return;
      }

      setFlowState(flowData);

      // Check if permanently locked
      if (flowData.lock_type === 'locked_permanent') {
        setError('This record is locked. Contact owner for assistance.');
        setCanAccess(false);
        setLoading(false);
        return;
      }

      // Check if specific step is locked
      if (flowData.lock_type === 'locked_step' && flowData.locked_step === targetStep) {
        setError('This step is locked. An unlock request has been submitted.');
        setCanAccess(false);
        setLoading(false);
        return;
      }

      // Validate step order
      const requiredSteps: Record<number, number[]> = {
        1: [], // No prerequisites
        2: [1], // Need step 1
        3: [1, 2], // Need steps 1-2
        4: [1, 2, 3], // Need steps 1-3
        5: [1, 2, 3, 4], // Need steps 1-4
        6: [1, 2, 3, 4, 5], // Need steps 1-5
      };

      const prereqs = requiredSteps[targetStep] || [];
      let allPrereqsComplete = true;
      let missingStep = 1;

      for (const step of prereqs) {
        let isComplete = false;
        switch (step) {
          case 1:
            isComplete = flowData.step_1_admin_selected;
            break;
          case 2:
            isComplete = flowData.step_2_payment_completed;
            break;
          case 3:
            isComplete = flowData.step_3_consent_completed;
            break;
          case 4:
            isComplete = flowData.step_4_form01_completed;
            break;
          case 5:
            isComplete = flowData.step_5_form_submitted;
            break;
        }
        if (!isComplete) {
          allPrereqsComplete = false;
          missingStep = step;
          break;
        }
      }

      if (!allPrereqsComplete) {
        setRedirectTo(missingStep);
        setError(`Please complete step ${missingStep} before accessing step ${targetStep}.`);
        setCanAccess(false);
      } else {
        setCanAccess(true);
        setError(null);
      }

      setLoading(false);
    };

    validateAccess();
  }, [targetStep]);

  return { loading, canAccess, redirectTo, error, flowState };
}
