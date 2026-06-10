import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getSASTISOString } from '@/lib/timezone';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use SAST timestamp
    const sastTimestamp = getSASTISOString();

    const { error } = await supabase
      .from('user_presence')
      .upsert({
        user_id: user.id,
        last_seen_at: sastTimestamp,
        updated_at: sastTimestamp
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, timestamp: sastTimestamp });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
