import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');

  if (!path) {
    return NextResponse.json({ error: 'No path provided' }, { status: 400 });
  }

  // Get signed URL from Supabase
  const { data, error } = await supabase.storage
    .from('pops')
    .createSignedUrl(path, 300);

  if (error) {
    console.error('Signed URL error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data?.signedUrl) {
    return NextResponse.json({ error: 'Could not generate URL' }, { status: 500 });
  }

  // Fetch the file from Supabase
  const response = await fetch(data.signedUrl);
  const blob = await response.blob();

  // Return the file with correct headers
  return new NextResponse(blob, {
    headers: {
      'Content-Type': response.headers.get('content-type') || 'application/pdf',
      'Content-Disposition': 'inline',
    },
  });
}
