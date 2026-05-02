import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Sovereignty Audit Logging (Law 25 / Bill 96 Compliance)
  const city = req.headers.get('x-vercel-ip-city');
  const region = req.headers.get('x-vercel-ip-country-region');
  if (city || region) {
    console.log(`[Sovereignty Audit] Request from ${city || 'Unknown City'}, ${region || 'Unknown Region'}`);
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
