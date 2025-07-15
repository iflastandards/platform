import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/', // Public home page with SignInButton modal
  '/request-invite', // Public invitation request
  '/api/auth/callback', // Public auth callback API
  '/api/request-invite', // Public request invite API
  // Add other public routes as needed
]);

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth.protect();
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
