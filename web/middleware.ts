import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Next.js Middleware for authentication and authorization
 * Runs on edge runtime before the page is rendered
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware
 */

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/login']

// Routes that require specific roles (example - can be expanded)
const ADMIN_ONLY_ROUTES = ['/administrators']

/**
 * Check if JWT token is expired
 */
function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    const exp = decoded.exp

    if (!exp) {
      return true
    }

    return exp < Math.floor(Date.now() / 1000)
  } catch {
    return true
  }
}

/**
 * Extract user role from JWT token
 */
function getUserRoleFromToken(token: string): string | null {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return decoded.role || decoded.authorities?.[0] || null
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next()
  }

  // Check for token in cookie (preferred) or Authorization header
  const tokenFromCookie = request.cookies.get('token')?.value
  const authHeader = request.headers.get('authorization')
  const tokenFromHeader = authHeader?.replace('Bearer ', '')

  const token = tokenFromCookie || tokenFromHeader

  // No token found - redirect to login
  if (!token) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Token expired - redirect to login
  if (isTokenExpired(token)) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.searchParams.set('redirect', pathname)
    url.searchParams.set('reason', 'session-expired')

    // Clear the cookie
    const response = NextResponse.redirect(url)
    response.cookies.delete('token')
    return response
  }

  // Check role-based access (example for admin routes)
  if (ADMIN_ONLY_ROUTES.some(route => pathname.startsWith(route))) {
    const userRole = getUserRoleFromToken(token)

    if (userRole !== 'ADMIN' && userRole !== 'ROLE_ADMIN') {
      // Forbidden - redirect to dashboard with error
      const url = request.nextUrl.clone()
      url.pathname = '/schedule'
      url.searchParams.set('error', 'forbidden')
      return NextResponse.redirect(url)
    }
  }

  // Token is valid - continue
  return NextResponse.next()
}

/**
 * Middleware config - specify which routes should run this middleware
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}


