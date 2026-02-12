'use client'

import { Lift } from '@/lib/graph'

interface LiftNodeProps {
  lift: Lift
  isSelected: boolean
  isInSafeZone: boolean
  isInTrapZone: boolean
  onClick: (liftId: string) => void
}

export function LiftNode({
  lift,
  isSelected,
  isInSafeZone,
  isInTrapZone,
  onClick,
}: LiftNodeProps) {
  // Calculate position (0-100 normalized to SVG viewBox)
  const x = lift.positionX
  const y = lift.positionY

  // Determine node styling
  let fillColor = 'fill-secondary'
  let strokeColor = 'stroke-border'
  let strokeWidth = 2

  if (isSelected) {
    fillColor = 'fill-primary'
    strokeColor = 'stroke-primary'
    strokeWidth = 3
  } else if (isInTrapZone) {
    fillColor = 'fill-destructive/30'
    strokeColor = 'stroke-destructive'
  } else if (isInSafeZone) {
    fillColor = 'fill-primary/20'
    strokeColor = 'stroke-primary/50'
  }

  // Icon based on lift type
  const getIcon = () => {
    switch (lift.type) {
      case 'gondola':
        return (
          <rect
            x={x - 4}
            y={y - 3}
            width={8}
            height={6}
            rx={1}
            className="fill-current"
          />
        )
      case 'chairlift':
        return (
          <>
            <line
              x1={x}
              y1={y - 3}
              x2={x}
              y2={y + 2}
              className="stroke-current"
              strokeWidth={1.5}
            />
            <line
              x1={x - 3}
              y1={y + 2}
              x2={x + 3}
              y2={y + 2}
              className="stroke-current"
              strokeWidth={1.5}
            />
          </>
        )
      default:
        return <circle cx={x} cy={y} r={2} className="fill-current" />
    }
  }

  return (
    <g
      className="cursor-pointer transition-transform hover:scale-110"
      onClick={() => onClick(lift.id)}
    >
      {/* Background circle */}
      <circle
        cx={x}
        cy={y}
        r={6}
        className={`${fillColor} ${strokeColor} transition-colors`}
        strokeWidth={strokeWidth}
      />

      {/* Lift type icon */}
      <g className="text-foreground pointer-events-none">{getIcon()}</g>

      {/* Label */}
      <text
        x={x}
        y={y + 12}
        textAnchor="middle"
        className="fill-foreground text-[3px] font-medium pointer-events-none"
      >
        {lift.name.length > 15 ? lift.name.substring(0, 15) + '...' : lift.name}
      </text>
    </g>
  )
}
