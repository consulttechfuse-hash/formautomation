import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    
    // Exchange the code for a session - this stores the session in cookies
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Redirect to the client page for password setup
      return NextResponse.redirect(new URL('/auth/setup-password', request.url));
    }
    
    console.error('PKCE exchange error:', error);
    return NextResponse.redirect(new URL('/client-signup?error=magic-link-failed', request.url));
  }

  return NextResponse.redirect(new URL('/client-signup?error=no-code', request.url));
}
