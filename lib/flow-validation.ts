import { createClient } from '@/lib/supabase/client';

export interface FlowValidationResult {
  canAccess: boolean;
  redirectTo: number | null;
  error: string | null;
  flowState: any | null;
}

export async function validateFlowAccess(targetStep: number): Promise<FlowValidationResult> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.log('[validateFlowAccess] No user logged in');
    return {
      canAccess: false,
      redirectTo: null,
      error: 'Please log in',
      flowState: null
    };
  }

  console.log(`[validateFlowAccess] User: ${user.email}, Target Step: ${targetStep}`);

  // Get or create flow state
  let { data: flowState } = await supabase
    .from('client_flow_state')
    .select('*')
    .eq('client_id', user.id)
    .single();

  console.log('[validateFlowAccess] Existing flowState:', flowState);

  // If no flow state exists, create one for step 1
  if (!flowState) {
    console.log('[validateFlowAccess] No flow state found, creating new one');
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

    if (createError || !newFlow) {
      console.error('[validateFlowAccess] Error creating flow state:', createError);
      return {
        canAccess: false,
        redirectTo: 1,
        error: 'Unable to initialize flow state',
        flowState: null
      };
    }
    flowState = newFlow;
    console.log('[validateFlowAccess] Created new flowState:', flowState);
  }

  // Check if permanently locked
  if (flowState.lock_type === 'locked_permanent') {
    console.log('[validateFlowAccess] Permanently locked');
    return {
      canAccess: false,
      redirectTo: null,
      error: 'This application is locked. Contact owner for assistance.',
      flowState
    };
  }

  // Check if specific step is locked
  if (flowState.lock_type === 'locked_step' && flowState.locked_step === targetStep) {
    console.log(`[validateFlowAccess] Step ${targetStep} is locked`);
    return {
      canAccess: false,
      redirectTo: null,
      error: `Step ${targetStep} is locked. An unlock request has been submitted.`,
      flowState
    };
  }

  // Validate prerequisites
  const prerequisites: Record<number, number[]> = {
    1: [],
    2: [1],
    3: [1, 2],
    4: [1, 2, 3],
    5: [1, 2, 3, 4],
    6: [1, 2, 3, 4, 5]
  };

  const requiredSteps = prerequisites[targetStep] || [];
  console.log(`[validateFlowAccess] Required steps for ${targetStep}:`, requiredSteps);
  
  for (const step of requiredSteps) {
    let isComplete = false;
    switch (step) {
      case 1:
        isComplete = flowState.step_1_admin_selected;
        break;
      case 2:
        isComplete = flowState.step_2_payment_completed;
        break;
      case 3:
        isComplete = flowState.step_3_consent_completed;
        break;
      case 4:
        isComplete = flowState.step_4_form01_completed;
        break;
      case 5:
        isComplete = flowState.step_5_form_submitted;
        break;
    }
    
    console.log(`[validateFlowAccess] Step ${step} isComplete: ${isComplete}`);
    
    if (!isComplete) {
      console.log(`[validateFlowAccess] Redirecting to step ${step}`);
      return {
        canAccess: false,
        redirectTo: step,
        error: `Please complete Step ${step} before accessing Step ${targetStep}`,
        flowState
      };
    }
  }

  console.log(`[validateFlowAccess] Access granted to step ${targetStep}`);
  return {
    canAccess: true,
    redirectTo: null,
    error: null,
    flowState
  };
}

export async function advanceToNextStep(currentStep: number): Promise<{ success: boolean; error: string | null; nextStep: number }> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not logged in', nextStep: currentStep };
  }

  const response = await fetch('/api/client/flow/advance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ step: currentStep })
  });

  const data = await response.json();

  if (!response.ok) {
    return { success: false, error: data.error, nextStep: currentStep };
  }

  return { success: true, error: null, nextStep: data.nextStep };
}
