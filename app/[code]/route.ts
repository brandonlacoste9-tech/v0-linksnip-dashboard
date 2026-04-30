import { handleLinkClick } from '@/app/actions'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  
  try {
    await handleLinkClick(code)
  } catch (error) {
    console.error('Error in redirect route:', error)
  }
  
  // If no redirect happened, return 404
  return new Response('Not Found', { status: 404 })
}
