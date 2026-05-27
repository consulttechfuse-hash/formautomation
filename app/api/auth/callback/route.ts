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

  // Verify the OTP token
  const { error } = await supabase.auth.verifyOtp({
    email: email,
    token: token,
    type: 'magiclink',
  });

  if (error) {
    console.error('Verification error:', error);
    return NextResponse.redirect(new URL(`/login?error=${error.message}`, request.url));
  }

  // Get the user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.redirect(new URL('/login?error=no_user', request.url));
  }

  // Check if user exists in your users table
  let { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  // If user doesn't exist, create them as CLIENT (this is the only way they can get a role)
  if (!profile) {
    console.log(`Creating new client user: ${user.email}`);
    
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email,
        role: 'client',  // ← ALL new signups are clients
        status: 'pending',
        created_at: new Date().toISOString(),
        has_paid: false,
        has_consented: false,
        onboarding_complete: false,
        onboarding_submitted: false,
      });
    
    if (insertError) {
      console.error('Failed to create user record:', insertError);
      return NextResponse.redirect(new URL('/login?error=account_creation_failed', request.url));
    }
    
    // New client users go to set-password
    return NextResponse.redirect(new URL('/set-password', request.url));
  }

  // Existing user - redirect based on stored role
  const role = profile.role;
  
  if (role === 'owner') return NextResponse.redirect(new URL('/owner/dashboard', request.url));
  if (role === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  if (role === 'agent') return NextResponse.redirect(new URL('/agent/dashboard', request.url));
  
  // Default to client dashboard (for clients or any other role)
  return NextResponse.redirect(new URL('/client/dashboard', request.url));
}
