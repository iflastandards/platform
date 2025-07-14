import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",                // Public home page
  "/sign-in(.*)",     // Public sign-in
  "/sign-up(.*)",     // Public sign-up
  "/request-invite",  // Public invitation request
  // Add other public routes as needed
]);

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
