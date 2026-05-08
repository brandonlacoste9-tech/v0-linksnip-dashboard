import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { links, clicks } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * Internal Edge Resolution API
 * ─────────────────────────────
 * Used by proxy.ts to resolve short codes and log clicks at the Edge.
 */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const visitorHash = searchParams.get('v');
  const internalSecret = request.headers.get('x-edge-internal');

  // Security Gate
  if (internalSecret !== process.env.EDGE_INTERNAL_SECRET && internalSecret !== 'linksnip-edge-v1') {
    return NextResponse.json({ error: 'Unauthorized Edge Access' }, { status: 401 });
  }

  if (!code) {
    return NextResponse.json({ error: 'Code missing' }, { status: 400 });
  }

  try {
    // 1. Resolve Link
    const result = await db.select().from(links).where(eq(links.shortCode, code)).limit(1);
    
    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const link = result[0];

    // 2. Log Click Asynchronously (Fire and forget from Edge perspective)
    const country = request.headers.get('x-vercel-ip-country') || 'Unknown';
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const referrer = request.headers.get('referer') || 'Direct';

    // We use a raw SQL insert for maximum performance
    db.insert(clicks).values({
      linkId: link.id,
      visitorHash: visitorHash || null,
      country,
      userAgent,
      referrer,
    }).execute();

    // Increment click count
    db.update(links)
      .set({ clicks: sql`${links.clicks} + 1` })
      .where(eq(links.id, link.id))
      .execute();

    return NextResponse.json({ url: link.originalUrl });
  } catch (error) {
    console.error('[Edge-Resolve-API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
