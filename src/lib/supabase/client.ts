import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://voalgeyexfhfitlyorfl.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_AFTgvwUXdDPCgTny9uDIuQ_NGiDyAJD'
  )
}
