import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: invitation, error } = await supabase
    .from('user_roles')
    .select('email, role')
    .eq('invitation_token', token)
    .is('user_id', null)
    .is('accepted_at', null)
    .gt('invitation_expires_at', new Date().toISOString())
    .single();

  if (error || !invitation) {
    return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404 });
  }

  return NextResponse.json({
    email: invitation.email,
    role: invitation.role,
  });
}
