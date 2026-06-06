import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { step } = await request.json();

    let { data: flowState } = await supabase
      .from('client_flow_state')
      .select('*')
      .eq('client_id', user.id)
      .single();

    if (!flowState) {
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

      if (createError) {
        return NextResponse.json({ error: 'Failed to create flow state' }, { status: 500 });
      }
      flowState = newFlow;
    }

    if (flowState.lock_type === 'locked_permanent') {
      return NextResponse.json({ 
        error: 'This client record is permanently locked. Contact owner for override.' 
      }, { status: 403 });
    }

    if (flowState.lock_type === 'locked_step' && flowState.locked_step === step) {
      return NextResponse.json({ 
        error: 'This step is locked. An unlock request has been submitted.' 
      }, { status: 403 });
    }

    const expectedStep = flowState.current_step;
    if (step !== expectedStep) {
      return NextResponse.json({ 
        error: `Invalid step order. Expected step ${expectedStep}, received step ${step}` 
      }, { status: 400 });
    }

    const updates: any = {
      updated_at: new Date().toISOString(),
      last_step_update: new Date().toISOString()
    };

    switch (step) {
      case 1:
        updates.step_1_admin_selected = true;
        updates.current_step = 2;
        break;
      case 2:
        updates.step_2_payment_completed = true;
        updates.current_step = 3;
        break;
      case 3:
        updates.step_3_consent_completed = true;
        updates.current_step = 4;
        break;
      case 4:
        updates.step_4_form01_completed = true;
        updates.current_step = 5;
        break;
      case 5:
        updates.step_5_form_submitted = true;
        updates.current_step = 6;
        break;
      case 6:
        updates.step_6_completed = true;
        updates.completed_at = new Date().toISOString();
        updates.lock_type = 'locked_permanent';
        updates.current_step = 6;
        break;
      default:
        return NextResponse.json({ error: 'Invalid step number' }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from('client_flow_state')
      .update(updates)
      .eq('client_id', user.id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update flow state' }, { status: 500 });
    }

    await supabase
      .from('flow_audit_log')
      .insert({
        client_id: user.id,
        action: 'step_complete',
        previous_state: flowState,
        new_state: { ...flowState, ...updates },
        performed_by: user.id,
        performed_by_role: 'client',
        created_at: new Date().toISOString()
      });

    return NextResponse.json({ 
      success: true, 
      nextStep: updates.current_step,
      isComplete: updates.step_6_completed === true
    });
  } catch (error) {
    console.error('Flow advance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
