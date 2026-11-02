import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let cachedAdminClient: SupabaseClient | null = null

export function getAdminClient(): SupabaseClient {
  if (cachedAdminClient) return cachedAdminClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required for Supabase admin client.')
  }

  const key =
    serviceKey && !serviceKey.includes('placeholder') && serviceKey.length > 20
      ? serviceKey
      : anonKey

  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY is required for Supabase client.')
  }

  cachedAdminClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  return cachedAdminClient
}

export const createAdminClient = getAdminClient
