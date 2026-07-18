import type { ExportDot } from '@/lib/kv'

// Client-side storage utilities
export class ClientStorage {
  // Fetch all active dots from KV and export as CSV
  static async downloadCSV(): Promise<void> {
    if (typeof window === 'undefined') return

    try {
      const header = 'Timestamp,X-coordinate,Y-coordinate\n'
      let rows = ''

      try {
        // Full permanent archive (not the 90-day matrix window). This endpoint
        // returns only { timestamp, x, y } — no id/color/name ever reach the CSV.
        const res = await fetch('/api/dots/export')
        if (res.ok) {
          const dots: ExportDot[] = await res.json()
          rows = dots
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
            .map(dot => `${dot.timestamp},${dot.x},${dot.y}`)
            .join('\n')
        }
      } catch (error) {
        console.error('Failed to fetch dots for CSV:', error)
      }

      // Fallback: if API returned nothing, use localStorage
      if (!rows) {
        const saved = localStorage.getItem('aiPositionResult')
        if (saved) {
          const result = JSON.parse(saved)
          rows = `${result.timestamp ?? new Date().toISOString()},${result.position.x},${result.position.y}`
        }
      }

      const csvContent = header + rows
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')

      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `aipos-data-${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error downloading CSV:', error)
    }
  }
}
