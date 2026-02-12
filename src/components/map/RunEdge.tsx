'use client'

import { Run, Lift, getDifficultyColor } from '@/lib/graph'

interface RunEdgeProps {
  run: Run
  lifts: Map<string, Lift>
  showLabel: boolean
  isHighlighted: boolean
  isFiltered: boolean
}

export function RunEdge({
  run,
  lifts,
  showLabel,
  isHighlighted,
  isFiltered,
}: RunEdgeProps) {
  const startLift = lifts.get(run.startLiftId)
  if (!startLift) return null

  // Get difficulty color class
  const colorClass = getDifficultyColor(run.difficultyStandard)

  // Map color class to actual stroke color
  const strokeColor = {
    'run-green': '#22c55e',
    'run-blue': '#3b82f6',
    'run-red': '#ef4444',
    'run-black': '#1f2937',
  }[colorClass] || '#6b7280'

  // Calculate opacity based on state
  const opacity = isFiltered ? 0.15 : isHighlighted ? 1 : 0.6

  // Draw edges to each end lift
  const edges = run.endLiftIds.map((endLiftId, idx) => {
    const endLift = lifts.get(endLiftId)
    if (!endLift) return null

    const x1 = startLift.positionX
    const y1 = startLift.positionY
    const x2 = endLift.positionX
    const y2 = endLift.positionY

    // Calculate midpoint for label
    const midX = (x1 + x2) / 2
    const midY = (y1 + y2) / 2

    // Calculate control point for curved line
    const dx = x2 - x1
    const dy = y2 - y1
    const cx = midX + dy * 0.1
    const cy = midY - dx * 0.1

    const pathId = `run-${run.id}-${idx}`

    return (
      <g key={pathId}>
        {/* Run path */}
        <path
          d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
          fill="none"
          stroke={strokeColor}
          strokeWidth={isHighlighted ? 2.5 : 1.5}
          strokeOpacity={opacity}
          strokeLinecap="round"
          className="transition-all"
        />

        {/* Directional arrow */}
        <circle
          cx={midX + (x2 - midX) * 0.3}
          cy={midY + (y2 - midY) * 0.3}
          r={1}
          fill={strokeColor}
          opacity={opacity}
        />

        {/* Label */}
        {showLabel && !isFiltered && (
          <text
            x={cx}
            y={cy - 2}
            textAnchor="middle"
            className="fill-muted-foreground text-[2px] pointer-events-none"
            opacity={0.8}
          >
            {run.name}
          </text>
        )}
      </g>
    )
  })

  return <>{edges}</>
}
