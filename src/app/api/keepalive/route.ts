import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

// Vercel Cron Job handler — pings KV to prevent Upstash from archiving
// the database due to inactivity. Scheduled via vercel.json cron config.
export async function GET() {
  try {
    await kv.set('keepalive', new Date().toISOString())
    return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() })
  } catch (error) {
    console.error('Keepalive ping failed:', error)
    return NextResponse.json({ status: 'error' }, { status: 500 })
  }
}
