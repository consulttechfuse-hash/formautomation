import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    
    // Exchange the code for a session - this uses cookies for PKCE storage
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // CRITICAL FIX: Redirect to the callback PAGE (not dashboard)
      // The page.tsx will handle password setup for new users
      return NextResponse.redirect(new URL('/auth/callback', request.url));
    }
    
    console.error('PKCE exchange error:', error);
    return NextResponse.redirect(new URL('/client-signup?error=magic-link-failed', request.url));
  }

  // If there's no code, still show the callback page (it will check session)
  return NextResponse.next();
}
