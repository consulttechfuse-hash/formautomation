import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Sign in error:', error);
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // Return success with user info
    return NextResponse.json({ 
      success: true, 
      user: data.user,
      session: data.session
    });
  } catch (error) {
    console.error('Sign in API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
