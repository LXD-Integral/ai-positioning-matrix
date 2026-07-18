import { kv } from '@vercel/kv'
import type { MatrixDot } from '@/types'

// Retention & visibility policy (2026-07-17):
// - Dots are stored PERMANENTLY (no TTL). The archive accumulates indefinitely.
// - The matrix renders only a bounded VISIBILITY window (see getVisibleDots).
// - The CSV export reads the full archive (see getExportDots).
// Retention != visibility: a dot outlives its time on the matrix.
export const VISIBILITY_DAYS = 90

// Redis keys
const DOT_KEY = (id: string) => `dot:${id}`
const ACTIVE_DOTS_SET = 'active_dots' // full membership set (unbounded, permanent)
const DOTS_BY_TIME = 'dots_by_time' // sorted set: score = timestamp ms, member = id

export interface StoredDot {
  id: string
  name: string
  color: string
  position: { x: number; y: number }
  responses: number[]
  timestamp: string
}

// Minimal outbound shape for the CSV export — timestamp + the two axis values ONLY.
// No id, no color, no name, no responses ever cross this boundary. See CLAUDE.md
// "Privacy Boundary" and PRD §NFR-003.5.
export interface ExportDot {
  timestamp: string
  x: number
  y: number
}

// Generate unique ID for dots
export function generateDotId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Store a new dot with PERMANENT retention (no expiry).
export async function storeDot(dot: Omit<StoredDot, 'id'>): Promise<string> {
  try {
    const id = generateDotId()
    const storedDot: StoredDot = { ...dot, id }

    // Permanent payload — no setex, no TTL.
    await kv.set(DOT_KEY(id), JSON.stringify(storedDot))

    // Full membership set (used for enumeration / migration). No expiry.
    await kv.sadd(ACTIVE_DOTS_SET, id)

    // Time-sorted index so the matrix can fetch a bounded window cheaply
    // regardless of how large the archive grows.
    const score = new Date(storedDot.timestamp).getTime()
    await kv.zadd(DOTS_BY_TIME, { score, member: id })

    return id
  } catch (error) {
    console.error('Failed to store dot:', error)
    throw new Error('Database storage failed')
  }
}

// Map a stored dot down to the outbound whitelist (id/color/position/timestamp).
// name + responses are dropped here and never leave the server.
function toMatrixDot(dot: StoredDot): MatrixDot {
  return {
    id: dot.id,
    color: dot.color,
    position: dot.position,
    timestamp: dot.timestamp
  }
}

// Fetch payloads for a set of ids, filtering out any missing keys.
async function fetchDots(ids: string[]): Promise<StoredDot[]> {
  if (!ids || ids.length === 0) return []
  const keys = ids.map(DOT_KEY)
  const dots = await kv.mget<StoredDot[]>(...keys)
  return dots.filter((dot): dot is StoredDot => !!dot)
}

// Dots VISIBLE on the matrix: those created within the visibility window.
// Bounded ZSET range keeps this query cheap as the archive grows.
export async function getVisibleDots(days: number = VISIBILITY_DAYS): Promise<MatrixDot[]> {
  try {
    const now = Date.now()
    const cutoff = now - days * 24 * 60 * 60 * 1000
    const ids = (await kv.zrange<string[]>(DOTS_BY_TIME, cutoff, now, { byScore: true })) || []
    const dots = await fetchDots(ids)
    return dots.map(toMatrixDot)
  } catch (error) {
    console.error('Failed to get visible dots:', error)
    return []
  }
}

// Full permanent archive for CSV export — projected to the minimal {timestamp,x,y}
// shape. Ordered ascending by timestamp (ZSET rank order). On-demand only.
export async function getExportDots(): Promise<ExportDot[]> {
  try {
    const ids = (await kv.zrange<string[]>(DOTS_BY_TIME, 0, -1)) || []
    const dots = await fetchDots(ids)
    return dots.map((dot) => ({
      timestamp: dot.timestamp,
      x: dot.position.x,
      y: dot.position.y
    }))
  } catch (error) {
    console.error('Failed to get export dots:', error)
    return []
  }
}

// One-time migration to permanent retention (2026-07-17).
// - Strips the legacy 30-day TTL off existing dot keys (kv.persist) so the ~30 days
//   we currently hold survive into the permanent archive.
// - Backfills the dots_by_time sorted-set index for pre-existing dots.
// Idempotent: safe to run more than once (persist + zadd both converge).
// NON-DESTRUCTIVE: never deletes a dot.
export async function migrateToPermanentRetention(): Promise<{
  processed: number
  persisted: number
  indexed: number
  orphansPruned: number
}> {
  const ids = ((await kv.smembers(ACTIVE_DOTS_SET)) as string[]) || []
  let persisted = 0
  let indexed = 0
  let orphansPruned = 0

  for (const id of ids) {
    const key = DOT_KEY(id)
    const dot = await kv.get<StoredDot>(key)

    if (!dot) {
      // Payload already gone (expired under the old policy before migration).
      // Drop the dangling index entries — this is the only removal we do.
      await kv.srem(ACTIVE_DOTS_SET, id)
      await kv.zrem(DOTS_BY_TIME, id)
      orphansPruned++
      continue
    }

    await kv.persist(key) // remove any remaining TTL → permanent
    persisted++

    const score = new Date(dot.timestamp).getTime()
    await kv.zadd(DOTS_BY_TIME, { score, member: id })
    indexed++
  }

  // Keep the membership set itself permanent too.
  await kv.persist(ACTIVE_DOTS_SET)

  return { processed: ids.length, persisted, indexed, orphansPruned }
}

// Store analytics event (kept at 30-day retention — behavioral events are not
// part of the permanent participation archive).
export async function storeAnalyticsEvent(event: {
  event_type: string
  timestamp: string
  quadrant?: string
  completion_rate?: number
  user_agent?: string
}): Promise<void> {
  try {
    const eventId = generateDotId()
    await kv.setex(`analytics:${eventId}`, 30 * 24 * 60 * 60, JSON.stringify(event)) // 30 days retention
  } catch (error) {
    console.error('Failed to store analytics event:', error)
  }
}
