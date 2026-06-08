import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  
  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }
  
  const supabase = await createClient();
  
  // Check if user exists in auth (via user_roles or users table)
  const { data: existingUserRole } = await supabase
    .from('user_roles')
    .select('id, user_id, role')
    .eq('email', email)
    .not('user_id', 'is', null)
    .maybeSingle();
  
  if (existingUserRole) {
    return NextResponse.json({ 
      exists: true, 
      role: existingUserRole.role,
      message: `User already exists as ${existingUserRole.role}`
    });
  }
  
  // Also check users table
  const { data: existingUser } = await supabase
    .from('users')
    .select('id, role')
    .eq('email', email)
    .maybeSingle();
  
  if (existingUser) {
    return NextResponse.json({ 
      exists: true, 
      role: existingUser.role,
      message: `User already exists as ${existingUser.role}`
    });
  }
  
  return NextResponse.json({ exists: false });
}
