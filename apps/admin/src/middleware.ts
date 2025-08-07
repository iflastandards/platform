import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/', // Public home page with SignInButton modal
  '/request-invite', // Public invitation request
  '/api/auth/callback', // Public auth callback API
  '/api/request-invite', // Public request invite API
  '/api/hello', // Public hello API for testing
  '/api/health', // Public health check endpoint
  // Add other public routes as needed
]);

export default clerkMiddleware((auth, request) => {
  // Skip authentication in test environment
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  // Temporarily disable auth protection to debug deployment
  if (process.env.NODE_ENV === 'production') {
    console.log('Skipping auth protection in production for debugging');
    return NextResponse.next();
  }

  if (!isPublicRoute(request)) {
    auth.protect();
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
