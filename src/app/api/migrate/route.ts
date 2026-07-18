import { NextResponse } from 'next/server'
import { migrateToPermanentRetention } from '@/lib/kv'

// One-time migration to permanent retention (2026-07-17).
// Persists existing dot keys (strips the legacy 30-day TTL) and backfills the
// dots_by_time sorted-set index so the ~30 days we currently hold survive.
//
// Guarded to NON-PRODUCTION only. Local dev shares the production KV store
// (.env.development.local), so running `GET http://localhost:3000/api/migrate`
// once locally migrates the live data. The deployed site runs with
// NODE_ENV=production and returns 403, so this can never be triggered publicly.
//
// Idempotent and non-destructive: safe to run more than once; never deletes a dot.
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Migration route is disabled in production' },
      { status: 403 }
    )
  }

  try {
    const result = await migrateToPermanentRetention()
    return NextResponse.json({ status: 'ok', ...result })
  } catch (error) {
    console.error('Migration failed:', error)
    return NextResponse.json({ status: 'error' }, { status: 500 })
  }
}
