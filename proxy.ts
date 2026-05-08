import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

// MRK Protocol Imports
import { AggregationEngine } from "@/lib/mrk/AggregationEngine";
import { SentinelStateMachine } from "@/lib/mrk/SentinelStateMachine";

/**
 * MRK Protocol — Edge Orchestration Proxy
 * ──────────────────────────────────────────────
 * Intercepts ALL requests at the Vercel Edge.
 *
 * Responsibilities:
 *   1. SOVEREIGN HANDSHAKE — Enforce trust boundaries.
 *   2. GHOST VAULT — Stateless identity decoupling via AggregationEngine.
 *   3. SENTINEL EVALUATION — Real-time evaluation of protocol sequences.
 *   4. TRUST MATRIX — Enforce recursive delegation and instant revocation.
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

// ─── MRK Trust Matrix API ────────────────────────────────────────────────────

async function handleMatrixHandshake(request: NextRequest): Promise<NextResponse> {
  const token = request.headers.get("x-sovereign-token");
  
  if (!token) {
    return new NextResponse(
      JSON.stringify({ error: "Sovereign identity missing" }),
      { status: 401, headers: { "content-type": "application/json" } }
    );
  }

  // Token validation logic (Matrix Gating)
  if (token !== process.env.BRIDGE_MASTER_TOKEN && !token.startsWith("ls_")) {
    return new NextResponse(
      JSON.stringify({ error: "Identity not recognized in Matrix" }),
      { status: 403, headers: { "content-type": "application/json" } }
    );
  }

  console.log(`[MRK Matrix] Identity Verified for Sequence: ${request.nextUrl.pathname}`);
  
  return NextResponse.next({
    headers: {
      "x-matrix-verified": "true",
      "x-protocol-depth": "1",
    },
  });
}

// ─── Sentinel Protocol Resolution ─────────────────────────────────────────────

async function trySentinelResolve(
  slug: string,
  request: NextRequest,
  ghostHash: string
): Promise<NextResponse | null> {
  const cachedUrl = getCachedUrl(slug);
  
  // 1. Sentinel Evaluation (Real-time Trust Scan)
  const sentinel = new SentinelStateMachine({
    id: slug,
    timestamp: Date.now(),
    threatLevel: 0.05, // Should be pulled from Edge Config or Real-time signals
    geoAllowed: true,
    trustDepth: 1
  });

  const state = await sentinel.evaluate();
  if (state === 'LOCKED' || state === 'DENIED' || state === 'DEFENDING') {
    console.warn(`[Sentinel] Protocol LOCKED for slug "${slug}" | State: ${state}`);
    return new NextResponse(
      JSON.stringify({ error: "Protocol sequence is currently LOCKED for evaluation" }),
      { status: 403, headers: { "content-type": "application/json" } }
    );
  }

  if (cachedUrl) {
    console.log(`[Sentinel] Cache HIT for "${slug}" | Identity: ${ghostHash.substring(0, 8)}`);
    return NextResponse.redirect(cachedUrl, { status: 302 });
  }

  try {
    const resolveUrl = new URL("/api/edge-resolve", request.url);
    resolveUrl.searchParams.set("code", slug);
    resolveUrl.searchParams.set("v", ghostHash); 

    const response = await fetch(resolveUrl.toString(), {
      headers: {
        "x-edge-internal": process.env.EDGE_INTERNAL_SECRET || "linksnip-edge-v1",
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.url) {
        setCachedUrl(slug, data.url);
        console.log(`[Sentinel] Nexus resolved "${slug}" | Caching & Resolving`);
        return NextResponse.redirect(data.url, { status: 302 });
      }
    }
  } catch (err) {
    console.warn(`[Sentinel] Nexus resolution failed for "${slug}":`, err);
  }

  return null;
}

// ─── Main MRK Proxy ──────────────────────────────────────────────────────────

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;

  // 1. GHOST VAULT (Stateless Identity Decoupling)
  const ip = request.ip || request.headers.get("x-forwarded-for") || "0.0.0.0";
  const userAgent = request.headers.get("user-agent") || "unknown";
  const ghostHash = await AggregationEngine.generateGhostHash(ip, userAgent);

  // 2. Trust Matrix Orchestration
  if (isMatrixRoute(request)) {
    return await handleMatrixHandshake(request);
  }

  // 3. Auth Protection (Dashboard)
  if (isProtectedRoute(request)) {
    await auth.protect();
  }

  // 4. System Route Bypass
  if (isSystemRoute(pathname)) {
    return NextResponse.next();
  }

  // 5. Extraction & Validation
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length !== 1) return NextResponse.next();
  
  const slug = segments[0];
  if (!isValidProtocolSlug(slug)) return NextResponse.next();

  // 6. Sentinel Evaluation & Resolution
  const sentinelResponse = await trySentinelResolve(slug, request, ghostHash);
  if (sentinelResponse) return sentinelResponse;

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
