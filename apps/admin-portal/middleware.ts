import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/app/lib/auth'
import { getRoleBasedLandingPage } from '@/app/lib/role-based-routing'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Only handle dashboard redirects for authenticated users
  if (pathname === '/dashboard') {
    const session = await auth()
    
    if (session?.user) {
      const user = session.user as any
      
      // Get the optimal landing page for this user
      const landingPage = getRoleBasedLandingPage(user, request.nextUrl.origin)
      
      // If the landing page is different from the current path, redirect
      const landingPath = new URL(landingPage).pathname
      if (landingPath !== pathname) {
        return NextResponse.redirect(new URL(landingPage, request.url))
      }
    }
  }
  
  // Handle mock authentication for development
  if (pathname === '/auth/signin' && process.env.NODE_ENV === 'development') {
    const mockUser = request.nextUrl.searchParams.get('mockUser')
    const callbackUrl = request.nextUrl.searchParams.get('callbackUrl')
    
    if (mockUser && callbackUrl) {
      // For testing scenarios, we'll auto-authenticate and redirect
      const response = NextResponse.redirect(new URL(callbackUrl, request.url))
      
      // Set a cookie or session data for mock authentication
      // This would need to be handled by the auth provider
      response.headers.set('X-Mock-User', mockUser)
      
      return response
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/signin'
  ]
}