import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { paymentId, clientId, clientEmail, reason } = await request.json();
    
    if (!paymentId || !clientId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const supabase = await createClient();
    
    // Verify the user is an owner
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    if (userRole?.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden - Owner access required' }, { status: 403 });
    }
    
    // Update payment request to rejected
    const { error: updateError } = await supabase
      .from('manual_payment_requests')
      .update({ 
        status: 'rejected', 
        admin_notes: reason 
      })
      .eq('id', paymentId);
    
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    
    // Send rejection email
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-payment-confirmation`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ email: clientEmail, clientId, status: 'rejected', adminNotes: reason }) 
    }).catch(err => console.error('Email error:', err));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reject payment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
