'use client'

import { useEffect, useState } from 'react'
import type { MatrixDot } from '@/types'

interface MatrixVisualizationProps {
  userPosition: { x: number; y: number }
  userName: string
  userColor: string
  currentDotId?: string | null
  showOtherDots?: boolean
}

export default function MatrixVisualization({
  userPosition,
  userName,
  userColor,
  currentDotId,
  showOtherDots = true
}: MatrixVisualizationProps) {
  const [otherDots, setOtherDots] = useState<MatrixDot[]>([])
  const [loading, setLoading] = useState(true)

  // Dot rendering policy (2026-07-17). Visibility window is 90 days (enforced
  // server-side in getVisibleDots); within that window:
  //   - Recent (≤ COLOR_WINDOW_DAYS): 50% opacity in the user's chosen color
  //   - Old (> COLOR_WINDOW_DAYS): 15% opacity gray, rendered behind recent dots
  const COLOR_WINDOW_DAYS = 30
  const DOT_RADIUS_RECENT = 9 // other users' recent dots
  const DOT_RADIUS_OLD = 12 // other users' old (faded) dots
  const DOT_RADIUS_USER = 18 // current user's dot

  // Matrix dimensions with extra space for labels (872px x 635px core area + label space)
  const MATRIX_WIDTH = 872
  const MATRIX_HEIGHT = 635
  const LABEL_SPACE = 80 // Extra space above and below for labels
  const X_LABEL_SPACE = 120 // Extra space left and right for X-axis labels
  const SVG_WIDTH = MATRIX_WIDTH + (X_LABEL_SPACE * 2)
  const SVG_HEIGHT = MATRIX_HEIGHT + (LABEL_SPACE * 2)
  const CENTER_X = (MATRIX_WIDTH / 2) + X_LABEL_SPACE
  const CENTER_Y = (MATRIX_HEIGHT / 2) + LABEL_SPACE

  // Convert coordinate (-5 to +5) to pixel position
  const coordToPixel = (coord: number, isY = false) => {
    const scale = isY ? MATRIX_HEIGHT / 12 : MATRIX_WIDTH / 12 // Scale to fit matrix
    const center = isY ? CENTER_Y : CENTER_X
    return center + (coord * scale * (isY ? -1 : 1)) // Invert Y axis
  }

  // Determine dot visual state based on age
  // Recent (≤ COLOR_WINDOW_DAYS): 50% opacity in user's chosen color
  // Old (> COLOR_WINDOW_DAYS): 15% opacity in gray, rendered behind recent dots
  const getDotStyle = (timestamp: string): { opacity: number; color: string; isOld: boolean } => {
    const ageDays = (Date.now() - new Date(timestamp).getTime()) / (1000 * 60 * 60 * 24)

    if (ageDays <= COLOR_WINDOW_DAYS) {
      return { opacity: 0.5, color: '', isOld: false } // color filled from dot.color
    } else {
      return { opacity: 0.15, color: '#888888', isOld: true }
    }
  }

  // Load other active dots from API
  useEffect(() => {
    const loadDots = async () => {
      if (showOtherDots) {
        try {
          const res = await fetch('/api/dots')
          if (res.ok) {
            const allDots: MatrixDot[] = await res.json()
            // Filter out only the current submission's dot (keep previous submissions by same user)
            setOtherDots(allDots.filter(dot => dot.id !== currentDotId))
          }
        } catch (error) {
          console.error('Failed to load dots:', error)
        }
      }
      setLoading(false)
    }

    loadDots()

    if (showOtherDots) {
      // Poll every 2 minutes for new dots
      const interval = setInterval(loadDots, 120000)
      return () => clearInterval(interval)
    }
  }, [showOtherDots, currentDotId])

  // User dot position
  const userX = coordToPixel(userPosition.x)
  const userY = coordToPixel(userPosition.y, true)

  return (
    <div className="w-full h-full">
      <svg 
        width={SVG_WIDTH} 
        height={SVG_HEIGHT} 
        className="w-full h-full"
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        role="img"
        aria-label={`AI Positioning Matrix showing ${userName} positioned at coordinates ${userPosition.x.toFixed(1)}, ${userPosition.y.toFixed(1)} ${showOtherDots ? `along with ${otherDots.length} other participants` : ''}`}
      >
        {/* Clean white background */}
        <rect width="100%" height="100%" fill="white" />

        {/* Axis lines matching Figma - vertical and horizontal blue lines */}
        <line 
          x1={X_LABEL_SPACE} 
          y1={CENTER_Y} 
          x2={X_LABEL_SPACE + MATRIX_WIDTH} 
          y2={CENTER_Y} 
          stroke="#2563eb" 
          strokeWidth="3"
        />
        <line 
          x1={CENTER_X} 
          y1={LABEL_SPACE} 
          x2={CENTER_X} 
          y2={LABEL_SPACE + MATRIX_HEIGHT} 
          stroke="#2563eb" 
          strokeWidth="3"
        />

        {/* Quadrant labels - large gray background text */}
        {/* Top Left: Pragmatic Innovator */}
        <text
          x={CENTER_X / 2}
          y={CENTER_Y / 2}
          fontSize="48"
          fill="#CCCCCC"
          fontFamily="Maven Pro"
          fontWeight="normal"
          textAnchor="middle"
          dominantBaseline="middle"
          className="select-none"
        >
          Pragmatic
        </text>
        <text
          x={CENTER_X / 2}
          y={CENTER_Y / 2 + 55}
          fontSize="48"
          fill="#CCCCCC"
          fontFamily="Maven Pro"
          fontWeight="normal"
          textAnchor="middle"
          dominantBaseline="middle"
          className="select-none"
        >
          Innovator
        </text>

        {/* Top Right: Visionary Innovator */}
        <text
          x={CENTER_X + CENTER_X / 2}
          y={CENTER_Y / 2}
          fontSize="48"
          fill="#CCCCCC"
          fontFamily="Maven Pro"
          fontWeight="normal"
          textAnchor="middle"
          dominantBaseline="middle"
          className="select-none"
        >
          Visionary
        </text>
        <text
          x={CENTER_X + CENTER_X / 2}
          y={CENTER_Y / 2 + 55}
          fontSize="48"
          fill="#CCCCCC"
          fontFamily="Maven Pro"
          fontWeight="normal"
          textAnchor="middle"
          dominantBaseline="middle"
          className="select-none"
        >
          Innovator
        </text>

        {/* Bottom Left: Pragmatic Guardian */}
        <text
          x={CENTER_X / 2}
          y={CENTER_Y + CENTER_Y / 2}
          fontSize="48"
          fill="#CCCCCC"
          fontFamily="Maven Pro"
          fontWeight="normal"
          textAnchor="middle"
          dominantBaseline="middle"
          className="select-none"
        >
          Pragmatic
        </text>
        <text
          x={CENTER_X / 2}
          y={CENTER_Y + CENTER_Y / 2 + 55}
          fontSize="48"
          fill="#CCCCCC"
          fontFamily="Maven Pro"
          fontWeight="normal"
          textAnchor="middle"
          dominantBaseline="middle"
          className="select-none"
        >
          Guardian
        </text>

        {/* Bottom Right: Visionary Guardian */}
        <text
          x={CENTER_X + CENTER_X / 2}
          y={CENTER_Y + CENTER_Y / 2}
          fontSize="48"
          fill="#CCCCCC"
          fontFamily="Maven Pro"
          fontWeight="normal"
          textAnchor="middle"
          dominantBaseline="middle"
          className="select-none"
        >
          Visionary
        </text>
        <text
          x={CENTER_X + CENTER_X / 2}
          y={CENTER_Y + CENTER_Y / 2 + 55}
          fontSize="48"
          fill="#CCCCCC"
          fontFamily="Maven Pro"
          fontWeight="normal"
          textAnchor="middle"
          dominantBaseline="middle"
          className="select-none"
        >
          Guardian
        </text>

        {/* Y-Axis Labels */}
        {/* Top: AI Accelerationist - positioned in white space above matrix */}
        <text
          x={CENTER_X}
          y={LABEL_SPACE / 2}
          fontSize="20"
          fill="#000000"
          fontFamily="Maven Pro"
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="middle"
          className="select-none"
        >
          AI Accelerationist
        </text>

        {/* Bottom: AI Decelerationist - positioned in white space below matrix */}
        <text
          x={CENTER_X}
          y={LABEL_SPACE + MATRIX_HEIGHT + (LABEL_SPACE / 2)}
          fontSize="20"
          fill="#000000"
          fontFamily="Maven Pro"
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="middle"
          className="select-none"
        >
          AI Decelerationist
        </text>

        {/* X-Axis Labels - Rotated 90 degrees and positioned in white space */}
        {/* Left: Mechanomorphic */}
        <text
          x={X_LABEL_SPACE / 2}
          y={CENTER_Y}
          fontSize="20"
          fill="#000000"
          fontFamily="Maven Pro"
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="middle"
          transform={`rotate(-90, ${X_LABEL_SPACE / 2}, ${CENTER_Y})`}
          className="select-none"
        >
          Mechanomorphic
        </text>

        {/* Right: Anthropomorphic */}
        <text
          x={X_LABEL_SPACE + MATRIX_WIDTH + (X_LABEL_SPACE / 2)}
          y={CENTER_Y}
          fontSize="20"
          fill="#000000"
          fontFamily="Maven Pro"
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="middle"
          transform={`rotate(90, ${X_LABEL_SPACE + MATRIX_WIDTH + (X_LABEL_SPACE / 2)}, ${CENTER_Y})`}
          className="select-none"
        >
          Anthropomorphic
        </text>

        {/* Other participants' dots — old dots (>7 days) render first (behind) */}
        {showOtherDots && [...otherDots]
          .sort((a, b) => {
            const aOld = getDotStyle(a.timestamp).isOld
            const bOld = getDotStyle(b.timestamp).isOld
            // Old dots first so they render behind recent dots
            if (aOld && !bOld) return -1
            if (!aOld && bOld) return 1
            return 0
          })
          .map(dot => {
            const style = getDotStyle(dot.timestamp)

            const dotX = coordToPixel(dot.position.x)
            const dotY = coordToPixel(dot.position.y, true)

            return (
              <circle
                key={dot.id}
                cx={dotX}
                cy={dotY}
                r={style.isOld ? DOT_RADIUS_OLD : DOT_RADIUS_RECENT}
                fill={style.isOld ? style.color : dot.color}
                opacity={style.opacity}
                className="other-dot"
              />
            )
          })}

        {/* User dot - prominent, always on top */}
        <circle
          cx={userX}
          cy={userY}
          r={DOT_RADIUS_USER}
          fill={userColor}
          className="user-dot"
        />

        {/* User label positioned as in Figma */}
        <text
          x={userX + 35}
          y={userY - 15}
          fontSize="20"
          fill="#000"
          fontFamily="Maven Pro"
          fontWeight="normal"
          className="user-label text-black text-xl font-normal font-maven-pro leading-tight"
        >
          {userName}
        </text>
      </svg>
    </div>
  )
}