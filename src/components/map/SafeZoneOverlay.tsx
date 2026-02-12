'use client'

import { SafeZone, Lift } from '@/lib/graph'

interface SafeZoneOverlayProps {
  zone: SafeZone
  lifts: Map<string, Lift>
  isHighlighted: boolean
}

export function SafeZoneOverlay({
  zone,
  lifts,
  isHighlighted,
}: SafeZoneOverlayProps) {
  // Calculate bounding polygon for the zone
  const points: { x: number; y: number }[] = []

  for (const liftId of zone.liftIds) {
    const lift = lifts.get(liftId)
    if (lift) {
      points.push({ x: lift.positionX, y: lift.positionY })
    }
  }

  if (points.length < 2) return null

  // Sort points to form a convex hull (simplified approach)
  const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length
  const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length

  points.sort((a, b) => {
    const angleA = Math.atan2(a.y - centerY, a.x - centerX)
    const angleB = Math.atan2(b.y - centerY, b.x - centerX)
    return angleA - angleB
  })

  // Create expanded polygon path (with padding around lift positions)
  const padding = 8
  const expandedPoints = points.map((p) => {
    const dx = p.x - centerX
    const dy = p.y - centerY
    const dist = Math.sqrt(dx * dx + dy * dy)
    const scale = dist > 0 ? (dist + padding) / dist : 1
    return {
      x: centerX + dx * scale,
      y: centerY + dy * scale,
    }
  })

  const pathD = expandedPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ') + ' Z'

  return (
    <path
      d={pathD}
      fill={zone.hasReturnPath ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'}
      stroke={zone.hasReturnPath ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}
      strokeWidth={isHighlighted ? 2 : 1}
      strokeDasharray={zone.hasReturnPath ? 'none' : '4 2'}
      className="pointer-events-none transition-all"
      opacity={isHighlighted ? 1 : 0.5}
    />
  )
}
