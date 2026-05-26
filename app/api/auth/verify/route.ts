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

  const cookieStore = cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: any) {
          cookieStore.set(name, '', { ...options, maxAge: 0 });
        },
      },
    }
  );

  // Verify the OTP token (no captcha needed here - already verified at signup)
  const { error } = await supabase.auth.verifyOtp({
    email: email,
    token: token,
    type: 'magiclink',
  });

  if (error) {
    console.error('Verification error:', error);
    return NextResponse.redirect(new URL(`/login?error=${error.message}`, request.url));
  }

  // Get user role to determine dashboard
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role;
    
    if (role === 'owner') return NextResponse.redirect(new URL('/owner/dashboard', request.url));
    if (role === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    if (role === 'agent') return NextResponse.redirect(new URL('/agent/dashboard', request.url));
  }
  
  return NextResponse.redirect(new URL('/client/dashboard', request.url));
}
