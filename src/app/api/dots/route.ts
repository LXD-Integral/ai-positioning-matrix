import { NextRequest, NextResponse } from 'next/server'
import { storeDot, getVisibleDots } from '@/lib/kv'

// Returns only the dots within the visibility window (default 90 days) for the
// matrix. The full permanent archive is served separately by /api/dots/export.
export async function GET() {
  const dots = await getVisibleDots()
  return NextResponse.json(dots)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, color, position, responses, timestamp } = body

    if (!name || !color || !position || typeof position.x !== 'number' || typeof position.y !== 'number') {
      return NextResponse.json({ error: 'Invalid dot data' }, { status: 400 })
    }

    const id = await storeDot({
      name,
      color,
      position,
      responses: responses ?? [],
      timestamp: timestamp ?? new Date().toISOString()
    })

    return NextResponse.json({ id })
  } catch (error) {
    console.error('Failed to store dot:', error)
    return NextResponse.json({ error: 'Failed to store dot' }, { status: 500 })
  }
}
