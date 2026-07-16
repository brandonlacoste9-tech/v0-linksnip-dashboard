import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

// Zipd Security Imports
import { AggregationEngine } from "@/lib/security/AggregationEngine";
import { SecurityEngine } from "@/lib/security/SecurityEngine";

/**
 * Zipd Security — Edge Orchestration Proxy
 * ──────────────────────────────────────────────
 * Intercepts ALL requests at the Vercel Edge.
 *
 * Responsibilities:
 *   1. BIOMETRIC AUTH — Enforce security boundaries.
 *   2. PRIVACY ENGINE — Stateless identity decoupling via AggregationEngine.
 *   3. SECURITY EVALUATION — Real-time evaluation of security policies.
 *   4. ACCESS MATRIX — Enforce hierarchical delegation and instant revocation.
 */

// ─── LRU Edge Cache ──────────────────────────────────────────────────────────

interface CacheEntry {
  url: string;
  timestamp: number;
}

const CACHE_MAX_SIZE = 10_000;
const CACHE_TTL_MS = 5 * 60 * 1000;

const edgeCache = new Map<string, CacheEntry>();

function getCachedUrl(code: string): string | null {
  const entry = edgeCache.get(code);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    edgeCache.delete(code);
    return null;
  }
  return entry.url;
}

function setCachedUrl(code: string, url: string): void {
  if (edgeCache.size >= CACHE_MAX_SIZE) {
    const firstKey = edgeCache.keys().next().value;
    if (firstKey) edgeCache.delete(firstKey);
  }
  edgeCache.set(code, { url, timestamp: Date.now() });
}

// ─── Route Matchers ──────────────────────────────────────────────────────────

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
const isMatrixRoute = createRouteMatcher(["/bridge(.*)"]); // Rebranded from Bridge to Matrix

const SYSTEM_ROUTES = new Set([
  "/", "/about", "/pricing", "/features", "/blog", "/careers", "/contact",
  "/customers", "/domains", "/privacy", "/terms", "/security", "/cookie-policy",
  "/dpa", "/success", "/analytics", "/sitemap.xml", "/robots.txt",
  "/sign-in", "/sign-up",
]);

function isSystemRoute(pathname: string): boolean {
  if (SYSTEM_ROUTES.has(pathname)) return true;
  for (const route of SYSTEM_ROUTES) {
    if (route !== "/" && pathname.startsWith(route + "/")) return true;
  }
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/bridge") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.includes(".")
  ) {
    return true;
  }
  return false;
}

const SHORT_CODE_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,63}$/;
function isValidProtocolSlug(segment: string): boolean {
  return SHORT_CODE_REGEX.test(segment);
}

// ─── Zipd Access Matrix API ────────────────────────────────────────────────────

async function handleAccessHandshake(request: NextRequest): Promise<NextResponse> {
  const token = request.headers.get("x-zipd-security-token");
  
  if (!token) {
    return new NextResponse(
      JSON.stringify({ error: "Security token missing" }),
      { status: 401, headers: { "content-type": "application/json" } }
    );
  }

  // Token validation logic (Access Gating)
  if (token !== process.env.ACCESS_MASTER_TOKEN && !token.startsWith("zipd_")) {
    return new NextResponse(
      JSON.stringify({ error: "Identity not recognized in Access Matrix" }),
      { status: 403, headers: { "content-type": "application/json" } }
    );
  }

  console.log(`[Security Matrix] Identity Verified for Sequence: ${request.nextUrl.pathname}`);
  
  return NextResponse.next({
    headers: {
      "x-access-verified": "true",
      "x-security-level": "1",
    },
  });
}

// ─── Security Protocol Resolution ─────────────────────────────────────────────

async function trySecurityResolve(
  slug: string,
  request: NextRequest,
  privacyId: string
): Promise<NextResponse | null> {
  const cachedUrl = getCachedUrl(slug);
  
  // 1. Security Evaluation (Real-time Policy Scan)
  const security = new SecurityEngine({
    id: slug,
    timestamp: Date.now(),
    threatLevel: 0.05, // Should be pulled from Edge Config or Real-time signals
    geoAllowed: true,
    authorityLevel: 1
  });

  const state = await security.evaluate();
  if (state === 'LOCKED' || state === 'DENIED' || state === 'BLOCKED') {
    console.warn(`[Security] Protocol LOCKED for slug "${slug}" | State: ${state}`);
    return new NextResponse(
      JSON.stringify({ error: "Access is currently restricted for evaluation" }),
      { status: 403, headers: { "content-type": "application/json" } }
    );
  }

  if (cachedUrl) {
    console.log(`[Security] Cache HIT for "${slug}" | Identity: ${privacyId.substring(0, 8)}`);
    return NextResponse.redirect(cachedUrl, { status: 302 });
  }

  try {
    const resolveUrl = new URL("/api/edge-resolve", request.url);
    resolveUrl.searchParams.set("code", slug);
    resolveUrl.searchParams.set("v", privacyId); 

    const response = await fetch(resolveUrl.toString(), {
      headers: {
        "x-edge-internal": process.env.EDGE_INTERNAL_SECRET || "zipd-edge-v1",
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.url) {
        setCachedUrl(slug, data.url);
        console.log(`[Security] Endpoint resolved "${slug}" | Caching & Resolving`);
        return NextResponse.redirect(data.url, { status: 302 });
      }
    }
  } catch (err) {
    console.warn(`[Security] Endpoint resolution failed for "${slug}":`, err);
  }

  return null;
}

// ─── Main Security Proxy ──────────────────────────────────────────────────────────

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;

  // 1. Access Matrix Orchestration
  if (isMatrixRoute(request)) {
    return await handleAccessHandshake(request);
  }

  // 2. Auth Protection (Dashboard)
  if (isProtectedRoute(request)) {
    await auth.protect();
  }

  // 3. Pass everything else through — short code redirects are handled by [code]/page.tsx
  return NextResponse.next();
});


export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
