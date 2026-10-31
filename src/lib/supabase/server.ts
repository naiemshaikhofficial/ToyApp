import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { cache } from 'react'

function isValidBase64Url(str: string): boolean {
  return /^[A-Za-z0-9_-]+$/.test(str)
}

export const createClient = cache(async () => {
  const cookieStore = await cookies()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be defined.')
  }

  const rawCookies = cookieStore.getAll()

  // 1. Detect if chunked cookies exist (.0). If so, drop any unchunked stale cookie with same root name
  const chunkedRoots = new Set(
    rawCookies
      .filter((c) => c.name.match(/^(.*)\.0$/))
      .map((c) => c.name.replace(/\.0$/, ''))
  )

  // 2. Filter out corrupt Base64URL payloads and stale unchunked cookies
  const filtered = rawCookies.filter((c) => {
    if (chunkedRoots.has(c.name)) {
      return false
    }

    if (
      (c.name.startsWith('sb-') || c.name.includes('-auth-token')) &&
      typeof c.value === 'string' &&
      c.value.startsWith('base64-')
    ) {
      const payload = c.value.substring(7)
      if (!isValidBase64Url(payload)) {
        return false
      }
    }
    return true
  })

  // 3. Deduplicate cookies with identical names (preferring latest set)
  const cookieMap = new Map<string, (typeof rawCookies)[0]>()
  for (const c of filtered) {
    cookieMap.set(c.name, c)
  }
  const sanitizedCookies = Array.from(cookieMap.values())

  const isProd = process.env.NODE_ENV === 'production'

  return createServerClient(url, key, {
    cookieOptions: {
      domain: isProd ? '.producertoy.com' : undefined,
      path: '/',
      sameSite: 'lax',
      secure: isProd,
    },
    cookies: {
      getAll() {
        return sanitizedCookies
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, {
              ...options,
              domain: isProd ? '.producertoy.com' : options?.domain,
            })
          )
        } catch {
          // Server component read-only fallback
        }
      },
    },
  })
})

export const getUser = cache(async () => {
  try {
    const cookieStore = await cookies()
    const hasSessionCookie = cookieStore
      .getAll()
      .some((c) => c.name.startsWith('sb-') || c.name.includes('-auth-token'))
    if (!hasSessionCookie) {
      return { data: { user: null }, error: null }
    }

    const supabase = await createClient()
    return await supabase.auth.getUser()
  } catch (err: any) {
    console.warn('[SERVER_AUTH_GETUSER_ERROR]', err)
    return { data: { user: null }, error: err }
  }
})
