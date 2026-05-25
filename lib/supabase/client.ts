import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a single supabase client for the browser using ssr package
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// For compatibility with existing code that expects a function
export function createClient() {
  return supabase
}
