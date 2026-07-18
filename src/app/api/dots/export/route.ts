import { NextResponse } from 'next/server'
import { getExportDots } from '@/lib/kv'

// Full permanent archive for CSV export.
// Outbound shape is deliberately narrower than GET /api/dots: only
// { timestamp, x, y } — no id, no color, no name, no responses. This is the
// tightest boundary in the app; see CLAUDE.md "Privacy Boundary" and PRD §NFR-003.5.
export async function GET() {
  const dots = await getExportDots()
  return NextResponse.json(dots)
}
