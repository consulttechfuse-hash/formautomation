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
        if (role === 'owner') {
          return NextResponse.redirect(new URL('/owner/dashboard', request.url));
        }
        if (role === 'admin') {
          return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
        if (role === 'agent') {
          return NextResponse.redirect(new URL('/agent/dashboard', request.url));
        }
      }
      
      // Default redirect for clients
      return NextResponse.redirect(new URL(redirect, request.url));
    }
    
    console.error('PKCE exchange error:', error);
    return NextResponse.redirect(new URL('/client-signup?error=magic-link-failed', request.url));
  }

  // If there's no code, redirect to signup
  return NextResponse.redirect(new URL('/client-signup?error=no-code', request.url));
}
