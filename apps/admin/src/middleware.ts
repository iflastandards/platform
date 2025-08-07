import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/', // Public home page with SignInButton modal
  '/sign-in', // Public sign-in page
  '/sign-up', // Public sign-up page
  '/sso-callback', // SSO callback page
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

  if (!isPublicRoute(request)) {
    auth.protect();
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
