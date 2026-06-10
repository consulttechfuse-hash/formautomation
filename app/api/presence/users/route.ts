import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // If not authenticated, return empty array (not an error)
    if (!user) {
      return NextResponse.json({ users: [] });
    }

    const url = new URL(request.url);
    const userIds = url.searchParams.get('ids')?.split(',') || [];

    let query = supabase.from('user_presence').select('*');
    
    if (userIds.length > 0) {
      query = query.in('user_id', userIds);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ users: [] });
    }

    return NextResponse.json({ users: data || [] });
  } catch (error) {
    return NextResponse.json({ users: [] });
  }
}
