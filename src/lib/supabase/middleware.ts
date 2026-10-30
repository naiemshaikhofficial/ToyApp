import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // 1. Quick presence check: If no Supabase auth cookies, skip auth call
  const hasSessionCookie = request.cookies
    .getAll()
    .some((c) => c.name.startsWith('sb-') || c.name.includes('-auth-token'))

  if (!hasSessionCookie) {
    return { supabaseResponse, user: null }
  }

  // 2. Prefetch optimization: Skip expensive network call on hover prefetch
  const isPrefetch =
    request.headers.get('purpose') === 'prefetch' ||
    request.headers.get('sec-purpose') === 'prefetch' ||
    request.headers.get('x-middleware-prefetch') === '1' ||
    request.headers.get('next-router-prefetch') === '1'

  if (isPrefetch) {
    return { supabaseResponse, user: null }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  if (!url || !key) {
    return { supabaseResponse, user: null }
  }

  const host = request.headers.get('host') || ''
  const isProdHost = host.includes('producertoy.com')

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, {
            ...options,
            domain: isProdHost ? '.producertoy.com' : options?.domain,
          })
        )
      },
    },
  })

  // This automatically refreshes the token with Supabase if it is near expiry
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { supabaseResponse, user }
}
