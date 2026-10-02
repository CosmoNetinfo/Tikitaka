import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase client for use in the browser.
 * This client interacts with Supabase using the anon key and is subject to RLS policies.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
