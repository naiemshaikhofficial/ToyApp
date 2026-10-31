import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Validates whether a payload conforms strictly to RFC 4648 Base64URL encoding.
 * Prevents @supabase/ssr stringFromBase64URL from throwing fatal unhandled exceptions
 * on legacy JWT cookies or malformed tokens containing '.' or invalid characters.
 */
function isValidBase64Url(str: string): boolean {
  return /^[A-Za-z0-9_-]+$/.test(str)
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  try {
    const rawCookies = request.cookies.getAll()

    // 1. Quick presence check: If no Supabase auth cookies, skip auth call
    const hasSessionCookie = rawCookies.some(
      (c) => c.name.startsWith('sb-') || c.name.includes('-auth-token')
    )

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

    const host = request.headers.get('host') || ''
    const isProdHost = host.includes('producertoy.com')

    // 3. Detect if chunked cookies exist (.0). If so, drop any unchunked stale cookie with same root name
    const chunkedRoots = new Set(
      rawCookies
        .filter((c) => c.name.match(/^(.*)\.0$/))
        .map((c) => c.name.replace(/\.0$/, ''))
    )

    // 4. Cookie Sanitization: filter out corrupt or legacy cookies with dots/invalid chars
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

    // 5. Deduplicate cookies with identical names (preferring latest set)
    const cookieMap = new Map<string, (typeof rawCookies)[0]>()
    for (const c of filtered) {
      cookieMap.set(c.name, c)
    }
    const sanitizedCookies = Array.from(cookieMap.values())

    const hasValidSessionCookie = sanitizedCookies.some(
      (c) => c.name.startsWith('sb-') || c.name.includes('-auth-token')
    )

    if (!hasValidSessionCookie) {
      return { supabaseResponse, user: null }
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || ''
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || ''

    if (!url || !key) {
      return { supabaseResponse, user: null }
    }

    const supabase = createServerClient(url, key, {
      cookieOptions: {
        domain: isProdHost ? '.producertoy.com' : undefined,
        path: '/',
        sameSite: 'lax',
        secure: isProdHost,
      },
      cookies: {
        getAll() {
          return sanitizedCookies
        },
        setAll(cookiesToSet) {
          try {
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
          } catch (cookieErr) {
            console.warn('Middleware cookie synchronization warning:', cookieErr)
          }
        },
      },
    })

    // This automatically refreshes the token with Supabase if it is near expiry
    let user = null
    try {
      const { data } = await supabase.auth.getUser()
      user = data.user
    } catch (authErr) {
      console.warn('Middleware Supabase getUser failed gracefully:', authErr)
    }

    return { supabaseResponse, user }
  } catch (err) {
    console.error('Middleware updateSession critical fallback:', err)
    return { supabaseResponse, user: null }
  }
}
