#!/bin/bash
echo "Fixing .env.local file..."

# Fix the Supabase URL
sed -i 's|NEXT_PUBLIC_SUPABASE_URL=.*|NEXT_PUBLIC_SUPABASE_URL=https://tmwwvpjetfndyfknxlfl.supabase.co|' .env.local

# Show the corrected value
echo "Corrected URL:"
grep NEXT_PUBLIC_SUPABASE_URL .env.local

# Clear cache
echo "Clearing Next.js cache..."
rm -rf .next

# Restart server
echo "Restarting dev server..."
npm run dev
