'use server'

import { neon } from '@neondatabase/serverless'
import { redirect } from 'next/navigation'

// Create a function to get the SQL client to defer execution until runtime
function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set')
  }
  return neon(process.env.DATABASE_URL)
}

export interface Link {
  id: string
  original_url: string
  short_code: string
  clicks: number
  created_at: string
}

export async function createLink(originalUrl: string, shortCode: string): Promise<Link> {
  try {
    const sql = getSql()
    
    // Validate URL format
    new URL(originalUrl)
    
    const result = await sql`
      INSERT INTO links (original_url, short_code)
      VALUES (${originalUrl}, ${shortCode})
      RETURNING id, original_url, short_code, clicks, created_at
    `
    
    if (!result || result.length === 0) {
      throw new Error('Failed to create link')
    }
    
    return result[0] as Link
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('unique constraint')) {
        throw new Error('Short code already exists')
      }
      throw new Error(error.message)
    }
    throw new Error('Failed to create link')
  }
}

export async function getLinks(): Promise<Link[]> {
  try {
    const sql = getSql()
    
    const result = await sql`
      SELECT id, original_url, short_code, clicks, created_at
      FROM links
      ORDER BY created_at DESC
    `
    
    return result as Link[]
  } catch (error) {
    console.error('Error fetching links:', error)
    return []
  }
}

export async function getLinkByCode(code: string): Promise<Link | null> {
  try {
    const sql = getSql()
    
    const result = await sql`
      SELECT id, original_url, short_code, clicks, created_at
      FROM links
      WHERE short_code = ${code}
      LIMIT 1
    `
    
    if (!result || result.length === 0) {
      return null
    }
    
    return result[0] as Link
  } catch (error) {
    console.error('Error fetching link:', error)
    return null
  }
}

export async function incrementLinkClicks(code: string): Promise<boolean> {
  try {
    const sql = getSql()
    
    const result = await sql`
      UPDATE links
      SET clicks = clicks + 1
      WHERE short_code = ${code}
      RETURNING id
    `
    
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
