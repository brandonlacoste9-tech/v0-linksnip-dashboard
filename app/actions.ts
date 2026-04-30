'use server'

import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { links } from '@/lib/db/schema'
import { eq, desc, sql } from 'drizzle-orm'

export interface Link {
  id: number
  original_url: string
  short_code: string
  clicks: number
  created_at: Date
}

export async function createLink(originalUrl: string, shortCode: string): Promise<Link> {
  try {
    // Validate URL format
    new URL(originalUrl)
    
    const result = await db.insert(links).values({
      originalUrl,
      shortCode,
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
  try {
    const result = await db.select().from(links).orderBy(desc(links.createdAt))
    
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

export async function getLinkByCode(code: string): Promise<Link | null> {
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

export async function handleLinkClick(code: string) {
  try {
    // Increment the click count
    await incrementLinkClicks(code)
    
    // Get the original URL
    const link = await getLinkByCode(code)
    
    if (link && link.original_url) {
      redirect(link.original_url)
    }
  } catch (error) {
    console.error('Error handling link click:', error)
  }
}
