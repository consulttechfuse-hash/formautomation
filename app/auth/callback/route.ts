import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirect = requestUrl.searchParams.get('redirect') || '/client/select-admin';

  if (code) {
    const supabase = await createClient();
    
    // Exchange the code for a session - this uses cookies for PKCE storage
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Get the user to determine their role
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Get user role from user_roles
        const { data: userRole } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        
        const role = userRole?.role || 'client';
        
        // Redirect based on role
        const roleRedirects: Record<string, string> = {
          owner: '/owner/dashboard',
          admin: '/admin/dashboard',
          agent: '/agent/dashboard',
          client: redirect,
        };
        
        const destination = roleRedirects[role] || redirect;
        return NextResponse.redirect(new URL(destination, request.url));
      }
      
      return NextResponse.redirect(new URL(redirect, request.url));
    }
    
    console.error('PKCE exchange error:', error);
    return NextResponse.redirect(new URL('/sign-in?error=magic-link-failed', request.url));
  }

  // If there's no code, redirect to sign-in
  return NextResponse.redirect(new URL('/sign-in?error=no-code', request.url));
}
