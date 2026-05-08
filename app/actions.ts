'use server'

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { links, clicks, authorizedUsers } from '@/lib/db/schema'
import { eq, desc, sql, gte, lte, and } from 'drizzle-orm'
import { headers } from 'next/headers'
import { unstable_cacheLife as cacheLife, unstable_cacheTag as cacheTag } from 'next/cache'

export interface Link {
  id: number
  original_url: string
  short_code: string
  clicks: number
  created_at: Date
}

export interface AuthorizedUser {
  id: number
  clerkId: string
  email: string | null
  role: string
  createdAt: Date
}

// Helper to check if current user is an admin (either in Env allowlist or Database)
export async function checkIsAdmin(): Promise<boolean> {
  const { userId } = await auth()
  if (!userId) return false

  // 1. Check Environment Bootstrap Admins
  const envUsers = process.env.AUTHORIZED_USER_IDS || ""
  const bootstrapAdmins = envUsers.split(",").map(id => id.trim()).filter(Boolean)
  if (bootstrapAdmins.includes(userId)) return true

  // 2. Check Database
  const dbUser = await db.select()
    .from(authorizedUsers)
    .where(eq(authorizedUsers.clerkId, userId))
    .limit(1)

  return dbUser.length > 0
}

export async function createLink(originalUrl: string, shortCode: string): Promise<Link> {
  const { userId } = await auth()
  
  try {
    // Validate URL format
    new URL(originalUrl)

    // Simple Rate Limiting: Check if any link was created in the last 1 second
    const recentLink = await db.select({ id: links.id }).from(links).where(sql`created_at > now() - interval '1 second'`).limit(1)
    if (recentLink.length > 0) {
      throw new Error('Please wait a moment before creating another link.')
    }
    
    const result = await db.insert(links).values({
      originalUrl,
      shortCode,
      userId: userId || null, // Allow null for trial links
    }).returning()
    
    if (!result || result.length === 0) {
      throw new Error('Failed to create link')
    }
    
    const link = result[0]
    return {
      id: link.id,
      original_url: link.originalUrl,
      short_code: link.shortCode,
      clicks: link.clicks,
      created_at: link.createdAt,
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('unique constraint') || error.message.includes('duplicate key')) {
        throw new Error('Short code already exists')
      }
      throw new Error(error.message)
    }
    throw new Error('Failed to create link')
  }
}

export async function getLinks(): Promise<Link[]> {
  const { userId } = await auth()
  
  async function fetchLinks() {
    'use cache'
    cacheLife('minutes')
    if (userId) cacheTag(`links-${userId}`)
    
    try {
      const query = db.select().from(links)
      
      if (userId) {
        query.where(eq(links.userId, userId as string))
      } else {
        // If no user, only show trial links (null userId)
        query.where(sql`${links.userId} IS NULL`)
      }

      const result = await query.orderBy(desc(links.createdAt))
      
      return result.map((link) => ({
        id: link.id,
        original_url: link.originalUrl,
        short_code: link.shortCode,
        clicks: link.clicks,
        created_at: link.createdAt,
      }))
    } catch (error) {
      console.error('Error fetching links:', error)
      return []
    }
  }

  return fetchLinks()
}

export async function getLinkByCode(code: string): Promise<Link | null> {
  async function fetchLink() {
    'use cache'
    cacheLife('minutes')
    cacheTag(`link-${code}`)
    
    try {
      const result = await db.select().from(links).where(eq(links.shortCode, code)).limit(1)
      
      if (!result || result.length === 0) {
        return null
      }
      
      const link = result[0]
      return {
        id: link.id,
        original_url: link.originalUrl,
        short_code: link.shortCode,
        clicks: link.clicks,
        created_at: link.createdAt,
      }
    } catch (error) {
      console.error('Error fetching link:', error)
      return null
    }
  }
  return fetchLink()
}

export async function incrementLinkClicks(code: string): Promise<boolean> {
  try {
    const result = await db
      .update(links)
      .set({ clicks: sql`${links.clicks} + 1` })
      .where(eq(links.shortCode, code))
      .returning({ id: links.id })
    
    return result && result.length > 0
  } catch (error) {
    console.error('Error incrementing clicks:', error)
    return false
  }
}

export async function logClick(code: string, visitorHash?: string) {
  try {
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip')
    const country = headersList.get('x-vercel-ip-country') || 'Unknown'
    const userAgent = headersList.get('user-agent')
    const referrer = headersList.get('referer')

    // Get the link first to get its ID
    const link = await getLinkByCode(code)
    if (!link) return

    // Log the granular click with decoupled identity
    await db.insert(clicks).values({
      linkId: link.id,
      ipAddress: ip,
      visitorHash: visitorHash || null,
      country,
      userAgent,
      referrer,
    })

    // Increment the total click count on the link record
    await incrementLinkClicks(code)
    return link
  } catch (error) {
    console.error('Error logging click:', error)
    return null
  }
}

// ─── Sovereign Bridge Management ─────────────────────────────────────────────

export async function getBridgeTokens() {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  try {
    return await db.select().from(bridgeTokens).where(eq(bridgeTokens.userId, userId)).orderBy(desc(bridgeTokens.createdAt))
  } catch (error) {
    console.error('Error fetching bridge tokens:', error)
    return []
  }
}

export async function createBridgeToken(name: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const token = `ls_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`
  
  try {
    const [newToken] = await db.insert(bridgeTokens).values({
      name,
      token,
      userId,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    }).returning()
    return newToken
  } catch (error) {
    console.error('Error creating bridge token:', error)
    throw new Error('Failed to generate token')
  }
}

export async function revokeBridgeToken(id: number) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  try {
    await db.delete(bridgeTokens).where(and(eq(bridgeTokens.id, id), eq(bridgeTokens.userId, userId)))
    return true
  } catch (error) {
    console.error('Error revoking bridge token:', error)
    return false
  }
}

export async function handleLinkClick(code: string) {
  const link = await logClick(code)
  if (link && link.original_url) {
    redirect(link.original_url)
  }
}

export async function getAnalyticsData() {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  async function fetchAnalytics() {
    'use cache'
    cacheLife('minutes')
    cacheTag(`analytics-${userId}`)

    try {
      const now = new Date()
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      // 1. Hourly Clicks (Last 24h)
      const hourlyData = await db
        .select({
          hour: sql<string>`to_char(${clicks.timestamp}, 'HH24:00')`,
          count: sql<number>`count(*)::int`,
        })
        .from(clicks)
        .innerJoin(links, eq(clicks.linkId, links.id))
        .where(and(
          gte(clicks.timestamp, twentyFourHoursAgo),
          eq(links.userId, userId as string)
        ))
        .groupBy(sql`to_char(${clicks.timestamp}, 'HH24:00')`)
        .orderBy(sql`to_char(${clicks.timestamp}, 'HH24:00')`)

      // 2. Weekly Clicks (Last 7d)
      const weeklyData = await db
        .select({
          day: sql<string>`to_char(${clicks.timestamp}, 'Dy')`,
          count: sql<number>`count(*)::int`,
        })
        .from(clicks)
        .innerJoin(links, eq(clicks.linkId, links.id))
        .where(and(
          gte(clicks.timestamp, sevenDaysAgo),
          eq(links.userId, userId as string)
        ))
        .groupBy(sql`to_char(${clicks.timestamp}, 'Dy')`)
        .orderBy(sql`min(${clicks.timestamp})`)

      // 3. Top Referrers
      const referrersData = await db
        .select({
          source: sql<string>`COALESCE(${clicks.referrer}, 'Direct')`,
          count: sql<number>`count(*)::int`,
        })
        .from(clicks)
        .innerJoin(links, eq(clicks.linkId, links.id))
        .where(eq(links.userId, userId as string))
        .groupBy(sql`COALESCE(${clicks.referrer}, 'Direct')`)
        .orderBy(sql`count(*) desc`)
        .limit(6)

      // 4. Geo Distribution
      const geoData = await db
        .select({
          country: sql<string>`COALESCE(${clicks.country}, 'Unknown')`,
          count: sql<number>`count(*)::int`,
        })
        .from(clicks)
        .innerJoin(links, eq(clicks.linkId, links.id))
        .where(eq(links.userId, userId as string))
        .groupBy(sql`COALESCE(${clicks.country}, 'Unknown')`)
        .orderBy(sql`count(*) desc`)
        .limit(6)

      // 5. Totals
      const [totals] = await db
        .select({
          totalClicks: sql<number>`count(*)::int`,
          uniqueVisitors: sql<number>`count(distinct ${clicks.ipAddress})::int`,
        })
        .from(clicks)
        .innerJoin(links, eq(clicks.linkId, links.id))
        .where(eq(links.userId, userId as string))

      return {
        hourlyData,
        weeklyData,
        referrersData,
        geoData,
        totals: totals || { totalClicks: 0, uniqueVisitors: 0 }
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error)
      throw new Error('Failed to fetch analytics data')
    }
  }

  return fetchAnalytics()
}

// Admin Management Actions
export async function getAuthorizedUsersList(): Promise<AuthorizedUser[]> {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) throw new Error('Unauthorized')

  try {
    const result = await db.select().from(authorizedUsers).orderBy(desc(authorizedUsers.createdAt))
    return result.map(user => ({
      id: user.id,
      clerkId: user.clerkId,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    }))
  } catch (error) {
    console.error('Error fetching authorized users:', error)
    return []
  }
}

export async function addAuthorizedUser(clerkId: string, email?: string): Promise<AuthorizedUser> {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) throw new Error('Unauthorized')

  try {
    const [user] = await db.insert(authorizedUsers).values({
      clerkId,
      email: email || null,
      role: 'admin',
    }).returning()
    
    return {
      id: user.id,
      clerkId: user.clerkId,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    }
  } catch (error) {
    console.error('Error adding authorized user:', error)
    throw new Error('Failed to add user')
  }
}

export async function removeAuthorizedUser(id: number): Promise<boolean> {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) throw new Error('Unauthorized')

  try {
    await db.delete(authorizedUsers).where(eq(authorizedUsers.id, id))
    return true
  } catch (error) {
    console.error('Error removing authorized user:', error)
    throw new Error('Failed to remove user')
  }
}

export async function getClicksExportData() {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  try {
    const result = await db
      .select({
        shortCode: links.shortCode,
        originalUrl: links.originalUrl,
        timestamp: clicks.timestamp,
        ipAddress: clicks.ipAddress,
        country: clicks.country,
        userAgent: clicks.userAgent,
        referrer: clicks.referrer,
      })
      .from(clicks)
      .innerJoin(links, eq(clicks.linkId, links.id))
      .where(eq(links.userId, userId as string))
      .orderBy(desc(clicks.timestamp))

    return result
  } catch (error) {
    console.error('Error fetching export data:', error)
    throw new Error('Failed to fetch export data')
  }
}

export async function getLatestClicks(limit: number = 5) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  try {
    const result = await db
      .select({
        id: clicks.id,
        shortCode: links.shortCode,
        timestamp: clicks.timestamp,
        country: clicks.country,
        userAgent: clicks.userAgent,
      })
      .from(clicks)
      .innerJoin(links, eq(clicks.linkId, links.id))
      .where(eq(links.userId, userId as string))
      .orderBy(desc(clicks.timestamp))
      .limit(limit)

    return result
  } catch (error) {
    console.error('Error fetching latest clicks:', error)
    return []
  }
}

export async function getLinkMetadata(url: string) {
  async function fetchMetadata() {
    'use cache'
    cacheLife('hours')
    cacheTag(`metadata-${url}`)

    try {
      const response = await fetch(url, { next: { revalidate: 3600 } })
      const html = await response.text()
      
      // Basic meta tag scraping
      const title = html.match(/<title>(.*?)<\/title>/)?.[1] || ""
      const description = html.match(/<meta name="description" content="(.*?)"/)?.[1] || ""
      const ogImage = html.match(/<meta property="og:image" content="(.*?)"/)?.[1] || ""

      return { title, description, ogImage }
    } catch (error) {
      return { title: "Sovereign Link", description: "Redirecting via LinkSnip", ogImage: "" }
    }
  }
  return fetchMetadata()
}
