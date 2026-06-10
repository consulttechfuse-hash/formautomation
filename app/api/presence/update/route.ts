import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await request.json();
    
    if (!['online', 'away', 'invisible', 'offline'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Use SAST (UTC+2)
    const now = new Date();
    const sastTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const sastISO = sastTime.toISOString().replace('Z', '+02:00');

    const { error } = await supabase
      .from('user_presence')
      .upsert({
        user_id: user.id,
        status: status,
        last_seen_at: sastISO,
        updated_at: sastISO
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, status, timestamp: sastISO });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
