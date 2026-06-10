import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getSASTISOString } from '@/lib/timezone';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { stepCompleted, stepData } = await request.json();
    
    // Use SAST timestamp
    const sastTimestamp = getSASTISOString();
    
    // Update flow state with SAST timestamp
    const updateData: any = {
      [`step_${stepCompleted}_completed`]: true,
      current_step: stepCompleted + 1,
      updated_at: sastTimestamp
    };
    
    if (stepCompleted === 4) {
      updateData.step_4_form01_completed_at = sastTimestamp;
    }
    
    const { error } = await supabase
      .from('client_flow_state')
      .update(updateData)
      .eq('client_id', user.id);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      newStep: stepCompleted + 1,
      timestamp: sastTimestamp
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
