/**
 * API Client Interceptor for authentication
 * Handles token injection, refresh token logic, and error responses
 */

import type { Config } from '@/lib/api-client/core/types'

/**
 * Get the current auth token from storage
 * Priority: Cookie > localStorage
 */
export function getAuthToken(): string | undefined {
  // In browser environment
  if (typeof window !== 'undefined') {
    // Try localStorage first (current implementation)
    const token = localStorage.getItem('token')
    if (token) {
      return token
    }

    // Fallback to cookie if implemented
    const cookieValue = document.cookie
      .split('; ')
      .find((row) => row.startsWith('token='))
      ?.split('=')[1]

    return cookieValue
  }

  // Server-side: no token available (middleware handles this)
  return undefined
}

/**
 * Store auth token
 * TODO: Migrate to HTTP-only cookies for better security
 */
export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token)
    // TODO: Set HTTP-only cookie via backend response instead
  }
}

/**
 * Clear auth token (logout)
 */
export function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userName')
    localStorage.removeItem('userId')

    // Clear cookie if exists
    document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict'
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
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
 * Refresh token logic
 * TODO: Implement when backend refresh token endpoint is ready
 */
export async function refreshAuthToken(): Promise<string | null> {
  try {
    // TODO: Call backend /auth/refresh endpoint
    // const response = await fetch('/auth/refresh', {
    //   method: 'POST',
    //   credentials: 'include', // Send refresh token cookie
    // })
    // 
    // if (!response.ok) {
    //   throw new Error('Failed to refresh token')
    // }
    // 
    // const { token } = await response.json()
    // setAuthToken(token)
    // return token

    console.warn('Refresh token not implemented yet')
    return null
  } catch (error) {
    console.error('Failed to refresh token:', error)
    clearAuthToken()
    return null
  }
}

/**
 * Auth interceptor configuration for API client
 * Automatically injects Bearer token into requests
 */
export const authInterceptor: Config['auth'] = () => {
  const token = getAuthToken()

  if (!token) {
    return undefined
  }

  // Check if token is expired
  if (isTokenExpired(token)) {
    console.warn('Token expired, clearing auth')
    clearAuthToken()
    // Redirect to login if we're in browser
    if (typeof window !== 'undefined') {
      window.location.href = '/?reason=session-expired'
    }
    return undefined
  }

  return token
}

/**
 * Response error interceptor
 * Handles 401 errors by attempting token refresh or forcing logout
 */
export function handleUnauthorizedError(error: unknown): void {
  // Check if error is 401 Unauthorized
  const isUnauthorized = 
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    (error as { status: number }).status === 401

  if (isUnauthorized && typeof window !== 'undefined') {
    console.warn('Received 401 Unauthorized, clearing auth')
    clearAuthToken()
    
    // Redirect to login page
    const currentPath = window.location.pathname
    if (currentPath !== '/') {
      window.location.href = `/?redirect=${encodeURIComponent(currentPath)}&reason=session-expired`
    }
  }
}

/**
 * Extract user info from JWT token
 */
export interface TokenPayload {
  sub?: string // username/email
  exp?: number // expiration timestamp
  iat?: number // issued at timestamp
  role?: string
  authorities?: string[]
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

/**
 * Get current user role from token
 */
export function getUserRole(): string | null {
  const token = getAuthToken()
  if (!token) {
    return null
  }

  const payload = decodeToken(token)
  return payload?.role || payload?.authorities?.[0] || null
}

/**
 * Check if user has specific role
 */
export function hasRole(role: string): boolean {
  const userRole = getUserRole()
  return userRole === role || userRole === `ROLE_${role}`
}

/**
 * Check if user is admin
 */
export function isAdmin(): boolean {
  return hasRole('ADMIN')
}

/**
 * Check if user is trainer
 */
export function isTrainer(): boolean {
  return hasRole('TRAINER')
}

