// test-otp-directly.js - Test Supabase OTP endpoint with your actual keys
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

console.log('=== Testing Supabase OTP Endpoint ===');
console.log('URL:', supabaseUrl);
console.log('Key prefix:', supabaseAnonKey.slice(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

(async () => {
  const testEmail = `test-${Date.now()}@example.com`;
  console.log(`Sending OTP to ${testEmail}...`);
  
  const { error } = await supabase.auth.signInWithOtp({
    email: testEmail,
    options: {
      emailRedirectTo: 'https://techfuseconsult.online/set-password',
    },
  });

  if (error) {
    console.error('❌ OTP request failed:', error.message);
    console.error('Full error:', error);
  } else {
    console.log('✅ OTP request succeeded! Check your Supabase logs.');
  }
})();
