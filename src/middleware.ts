import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// ============================================================================
// RATE LIMITING CONFIGURATION (Edge-compatible, in-memory)
// ============================================================================

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

const RATE_LIMITS = {
  general: { maxRequests: 240, windowMs: 60 * 1000 },
  sensitive: { maxRequests: 60, windowMs: 60 * 1000 }, // 60 req/min on mutations & sensitive actions
}

const SENSITIVE_PATTERNS = ['/api/auth', '/api/license']

let lastCleanup = Date.now()
const CLEANUP_INTERVAL = 5 * 60 * 1000

function cleanupRateLimitStore() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return

  lastCleanup = now
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

function checkRateLimit(ip: string, isSensitive: boolean): { allowed: boolean; remaining: number; resetIn: number } {
  cleanupRateLimitStore()

  const config = isSensitive ? RATE_LIMITS.sensitive : RATE_LIMITS.general
  const key = `${ip}:${isSensitive ? 'sensitive' : 'general'}`
  const now = Date.now()

  const entry = rateLimitStore.get(key)

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs })
    return { allowed: true, remaining: config.maxRequests - 1, resetIn: config.windowMs }
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetIn: entry.resetTime - now }
  }

  entry.count++
  rateLimitStore.set(key, entry)

  return { allowed: true, remaining: config.maxRequests - entry.count, resetIn: entry.resetTime - now }
}

// ============================================================================
// PRODUCER TOY ADMIN EDGE MIDDLEWARE
// ============================================================================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get('host') || ''
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1')

  // 1. IP Rate Limiting on sensitive endpoints & admin server actions
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    '127.0.0.1'

  const isApi = pathname.startsWith('/api')
  const isServerAction = request.headers.has('next-action') || request.method === 'POST'

  if (isApi || isServerAction) {
    const isSensitive = isServerAction || SENSITIVE_PATTERNS.some((p) => pathname.startsWith(p))
    const rateLimit = checkRateLimit(ip, isSensitive)
    if (!rateLimit.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too Many Requests',
          message: 'Administrative request threshold exceeded. Please try again later.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil(rateLimit.resetIn / 1000).toString(),
          },
        }
      )
    }
  }

  // 2. Public auth routes (do not require session)
  const isPublicAuthRoute =
    pathname === '/login' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password'

  // 3. Automatic Supabase Session Synchronization & Token Refresh
  let supabaseResponse = NextResponse.next({ request })
  let user = null
  try {
    const sessionResult = await updateSession(request)
    supabaseResponse = sessionResult.supabaseResponse
    user = sessionResult.user
  } catch (syncErr) {
    console.error('Middleware updateSession unexpected error:', syncErr)
  }

  const hasSessionCookie = request.cookies
    .getAll()
    .some((c) => c.name.startsWith('sb-') || c.name.includes('-auth-token'))

  // Guard protected admin routes: if no cookie exists or session is expired, redirect to /login
  if (!isPublicAuthRoute && !pathname.startsWith('/api/')) {
    if (!hasSessionCookie || !user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      const redirectResponse = NextResponse.redirect(loginUrl)
      // Carry over any cookie updates (such as expired bad cookies or refreshed tokens)
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
      })
      return redirectResponse
    }
  }

  // 4. CORS handling for admin API routes
  const origin = request.headers.get('origin')
  const allowedOrigins = [
    'https://producertoy.com',
    'https://store.producertoy.com',
    'https://creators.producertoy.com',
    'https://app.producertoy.com',
  ]
  if (isLocal && origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
    allowedOrigins.push(origin)
  }

  const isAllowedOrigin = origin && allowedOrigins.includes(origin)

  if (pathname.startsWith('/api') && request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': isAllowedOrigin ? origin : allowedOrigins[0],
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  const response = supabaseResponse

  // Strict administrative security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  if (isAllowedOrigin && origin) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all admin paths except static Next.js assets, favicons, mascots, etc.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
