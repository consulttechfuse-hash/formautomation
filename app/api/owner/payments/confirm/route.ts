import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { paymentId, clientId, clientEmail } = await request.json();
    
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
    
    // Update payment request to confirmed
    const { error: updateError } = await supabase
      .from('manual_payment_requests')
      .update({ 
        status: 'confirmed', 
        confirmed_at: new Date().toISOString(), 
        confirmed_by: user.id 
      })
      .eq('id', paymentId);
    
    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    
    // Update user_roles has_paid
    await supabase
      .from('user_roles')
      .update({ has_paid: true })
      .eq('user_id', clientId);
    
    // Send confirmation email
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-payment-confirmation`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ email: clientEmail, clientId, status: 'approved' }) 
    }).catch(err => console.error('Email error:', err));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Confirm payment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
