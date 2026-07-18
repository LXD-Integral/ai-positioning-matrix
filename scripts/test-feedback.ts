// Run with: node --experimental-strip-types scripts/test-feedback.ts
// Tests getUserFeedback() + getQuadrantName() across the 13-state model:
// 4 quadrants + 8 axis-aligned (each pole at moderate "Tending" and far "Predominantly") + 1 centre.

import { getQuadrantName, getUserFeedback } from '../src/lib/feedback.ts'

interface Scenario {
  label: string
  x: number
  y: number
}

const scenarios: Scenario[] = [
  // Centre — Balanced or Deferred Judgement (both axes close)
  { label: 'Centre (0, 0)', x: 0, y: 0 },

  // Pace-dominant (nature neutral) — Tending vs Predominantly
  { label: 'Tending Accelerationist (x=0, y=2)', x: 0, y: 2 },
  { label: 'Predominantly Accelerationist (x=0, y=4)', x: 0, y: 4 },
  { label: 'Tending Decelerationist (x=0, y=-2)', x: 0, y: -2 },
  { label: 'Predominantly Decelerationist (x=0, y=-4)', x: 0, y: -4 },

  // Nature-dominant (pace neutral) — Tending vs Predominantly
  { label: 'Tending Anthropomorphic (x=2, y=0)', x: 2, y: 0 },
  { label: 'Predominantly Anthropomorphic (x=4, y=0)', x: 4, y: 0 },
  { label: 'Tending Mechanomorphic (x=-2, y=0)', x: -2, y: 0 },
  { label: 'Predominantly Mechanomorphic (x=-4, y=0)', x: -4, y: 0 },

  // Four quadrants — both axes non-neutral
  { label: 'Pragmatic Innovator (x=-4, y=4)', x: -4, y: 4 },
  { label: 'Visionary Innovator (x=4, y=4)', x: 4, y: 4 },
  { label: 'Pragmatic Guardian (x=-4, y=-4)', x: -4, y: -4 },
  { label: 'Visionary Guardian (x=4, y=-4)', x: 4, y: -4 },

  // Boundary cases — confirm bucket edges (close ≤1, moderate ≤3, far >3)
  { label: 'Boundary: y=1 (close, → Balanced stance via centre)', x: 0, y: 1 },
  { label: 'Boundary: y=1.1 (just into Tending)', x: 0, y: 1.1 },
  { label: 'Boundary: y=3 (top of moderate/Tending)', x: 0, y: 3 },
  { label: 'Boundary: y=3.1 (into far/Predominantly)', x: 0, y: 3.1 },
  { label: 'Mild lean both axes → full quadrant (x=1.1, y=1.1)', x: 1.1, y: 1.1 },
]

const DIVIDER = '─'.repeat(80)

for (const { label, x, y } of scenarios) {
  const fb = getUserFeedback(x, y)

  console.log(`\n${DIVIDER}`)
  console.log(`SCENARIO:  ${label}`)
  console.log(`STANCE:    ${getQuadrantName(x, y)}`)
  console.log(`QUADRANT:  ${fb.quadrant.statement}`)
  console.log(`Y-AXIS:    ${fb.yAxis.statement}`)
  console.log(`X-AXIS:    ${fb.xAxis.statement}`)
}

console.log(`\n${DIVIDER}`)
console.log('Done.')
