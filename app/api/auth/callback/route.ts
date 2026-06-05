import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get('token');
  const email = requestUrl.searchParams.get('email');

  if (!token || !email) {
    return NextResponse.redirect(new URL('/login?error=invalid_link', request.url));
  }

  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: any) { cookieStore.set(name, value, options); },
        remove(name: string, options: any) { cookieStore.set(name, '', { ...options, maxAge: 0 }); },
      },
    }
  );

  const { error } = await supabase.auth.verifyOtp({
    email: email,
    token: token,
    type: 'magiclink',
  });

  if (error) {
    console.error('Verification error:', error);
    return NextResponse.redirect(new URL(`/login?error=${error.message}`, request.url));
  }

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.redirect(new URL('/login?error=no_user', request.url));
  }

  // Check if user exists in user_roles table
  const { data: existingUserRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (!existingUserRole) {
    // Create records in BOTH tables for new users
    console.log(`Creating new client user: ${user.email}`);
    
    // Insert into users table
    await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email,
        role: 'client',
        status: 'pending',
        created_at: new Date().toISOString(),
      });
    
    // Insert into user_roles table
    await supabase
      .from('user_roles')
      .insert({
        user_id: user.id,
        email: user.email,
        role: 'client',
        has_consented: false,
        onboarding_complete: false,
        onboarding_submitted: false,
        has_paid: false,
        created_at: new Date().toISOString(),
      });
    
    // New client goes to set password
    return NextResponse.redirect(new URL('/set-password', request.url));
  }

  // Existing user - get role from user_roles
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();
  
  const role = userRole?.role || 'client';
  
  // Redirect based on role
  if (role === 'owner') return NextResponse.redirect(new URL('/owner/dashboard', request.url));
  if (role === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  if (role === 'agent') return NextResponse.redirect(new URL('/agent/dashboard', request.url));
  
  return NextResponse.redirect(new URL('/client/dashboard', request.url));
}

export const dynamic = "force-dynamic";
