import { NextResponse } from 'next/server'
import { getLinks } from '@/app/actions'

export async function GET() {
  try {
    const links = await getLinks()
    return NextResponse.json({ success: true, data: links })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
