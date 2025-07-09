import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/app/lib/auth';
import { getRoleBasedLandingPage } from '@/app/lib/role-based-routing';

// Allowed origins for CORS - Portal and all Docusaurus sites for development
const allowedOrigins =
  process.env.NODE_ENV === 'production'
    ? ['https://www.iflastandards.info'] // Production portal
    : process.env.VERCEL_ENV === 'preview' ||
        process.env.GITHUB_PAGES === 'true'
      ? ['https://iflastandards.github.io'] // Preview environment (GitHub Pages)
      : [
          'http://localhost:3000', // Portal
          'http://localhost:3001', // ISBDM
          'http://localhost:3002', // LRM
          'http://localhost:3003', // FRBR
          'http://localhost:3004', // ISBD
          'http://localhost:3005', // MulDiCat
          'http://localhost:3006', // UniMARC
          'http://localhost:3008', // NewTest
        ]; // Development - all sites

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle CORS for API and auth routes
  if (pathname.startsWith('/api/') || pathname.startsWith('/auth/')) {
    // Get the origin from the request
    const origin = request.headers.get('origin') || '';

    // Debug logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[MIDDLEWARE] ${request.method} ${pathname} from origin: ${origin}`,
      );
      console.log(`[MIDDLEWARE] Allowed origins:`, allowedOrigins);
    }

    // Check if the origin is allowed
    const isAllowedOrigin = allowedOrigins.includes(origin);

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 200 });

      if (isAllowedOrigin) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Credentials', 'true');
        response.headers.set(
          'Access-Control-Allow-Methods',
          'GET, POST, PUT, DELETE, OPTIONS',
        );
        response.headers.set(
          'Access-Control-Allow-Headers',
          'Content-Type, Authorization, Cookie',
        );
        response.headers.set('Access-Control-Max-Age', '86400');
      }

      return response;
    }

    // Handle actual requests - continue processing but add CORS headers at the end
    const response = await handleNonCorsLogic(request);

    if (isAllowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    return response;
  }

  // Handle non-CORS logic for other routes
  return handleNonCorsLogic(request);
}

async function handleNonCorsLogic(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only handle dashboard redirects for authenticated users
  if (pathname === '/dashboard') {
    const session = await auth();

    if (session?.user) {
      const user = session.user as {
        id: string;
        roles: string[];
        attributes?: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
      };

      // Get the optimal landing page for this user
      const landingPage = getRoleBasedLandingPage(user, request.nextUrl.origin);

      // If the landing page is different from the current path, redirect
      const landingPath = new URL(landingPage).pathname;
      if (landingPath !== pathname) {
        return NextResponse.redirect(new URL(landingPage, request.url));
      }
    }
  }

  // Handle mock authentication for development
  if (pathname === '/auth/signin' && process.env.NODE_ENV === 'development') {
    const mockUser = request.nextUrl.searchParams.get('mockUser');
    const callbackUrl = request.nextUrl.searchParams.get('callbackUrl');

    if (mockUser && callbackUrl) {
      // For testing scenarios, we'll auto-authenticate and redirect
      const response = NextResponse.redirect(new URL(callbackUrl, request.url));

      // Set a cookie or session data for mock authentication
      // This would need to be handled by the auth provider
      response.headers.set('X-Mock-User', mockUser);

      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*', '/api/:path*'],
};
