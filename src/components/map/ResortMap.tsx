'use client'

import { useMemo } from 'react'
import {
  Resort,
  Difficulty,
  filterRunsByDifficulty,
  computeCanReachBase,
  computeSafeZones,
  hasReturnPath,
} from '@/lib/graph'
import { useMapStore } from '@/stores/mapStore'
import { useGroupStore, getGroupMaxDifficulty } from '@/stores/groupStore'
import { LiftNode } from './LiftNode'
import { RunEdge } from './RunEdge'
import { SafeZoneOverlay } from './SafeZoneOverlay'

interface ResortMapProps {
  resort: Resort
}

export function ResortMap({ resort }: ResortMapProps) {
  const { selectedLiftId, highlightedZone, showRunLabels } = useMapStore()
  const selectLift = useMapStore((state) => state.selectLift)
  const { members, difficultyMode } = useGroupStore()

  // Create lift lookup map
  const liftsMap = useMemo(() => {
    const map = new Map<string, (typeof resort.lifts)[0]>()
    for (const lift of resort.lifts) {
      map.set(lift.id, lift)
    }
    return map
  }, [resort.lifts])

  // Compute max difficulty for the group
  const maxDifficulty = useMemo(() => {
    return getGroupMaxDifficulty(members, difficultyMode)
  }, [members, difficultyMode])

  // Filter runs based on group difficulty
  const filteredRuns = useMemo(() => {
    return filterRunsByDifficulty(resort.runs, maxDifficulty)
  }, [resort.runs, maxDifficulty])

  // Compute reachability
  const reachability = useMemo(() => {
    return computeCanReachBase(filteredRuns, resort.baseAreas)
  }, [filteredRuns, resort.baseAreas])

  // Compute safe zones
  const safeZones = useMemo(() => {
    return computeSafeZones(filteredRuns, reachability)
  }, [filteredRuns, reachability])

  // Check if a lift is in trap zone
  const isInTrapZone = (liftId: string) => {
    return !hasReturnPath(reachability, liftId)
  }

  // Check if a lift is in highlighted safe zone
  const isInHighlightedZone = (liftId: string) => {
    if (!highlightedZone) return false
    return highlightedZone.liftIds.includes(liftId)
  }

  // Check if run is in highlighted zone
  const isRunInHighlightedZone = (runId: string) => {
    if (!highlightedZone) return false
    return highlightedZone.runIds.includes(runId)
  }

  // Check if run is filtered out
  const isRunFiltered = (runId: string) => {
    return !filteredRuns.some((r) => r.id === runId)
  }

  return (
    <div className="w-full h-full bg-card rounded-lg border overflow-hidden">
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background */}
        <rect x="0" y="0" width="100" height="100" className="fill-background" />

        {/* Safe zone overlays */}
        <g className="safe-zones">
          {safeZones.map((zone, idx) => (
            <SafeZoneOverlay
              key={idx}
              zone={zone}
              lifts={liftsMap}
              isHighlighted={highlightedZone === zone}
            />
          ))}
        </g>

        {/* Run edges */}
        <g className="runs">
          {resort.runs.map((run) => (
            <RunEdge
              key={run.id}
              run={run}
              lifts={liftsMap}
              showLabel={showRunLabels}
              isHighlighted={isRunInHighlightedZone(run.id)}
              isFiltered={isRunFiltered(run.id)}
            />
          ))}
        </g>

        {/* Lift nodes */}
        <g className="lifts">
          {resort.lifts.map((lift) => (
            <LiftNode
              key={lift.id}
              lift={lift}
              isSelected={selectedLiftId === lift.id}
              isInSafeZone={isInHighlightedZone(lift.id)}
              isInTrapZone={isInTrapZone(lift.id)}
              onClick={selectLift}
            />
          ))}
        </g>

        {/* Legend */}
        <g className="legend" transform="translate(2, 2)">
          <rect
            x="0"
            y="0"
            width="20"
            height="14"
            rx="1"
            className="fill-card stroke-border"
            strokeWidth="0.5"
          />
          <circle cx="3" cy="3" r="1.5" fill="#22c55e" />
          <text x="5.5" y="4" className="fill-foreground text-[2px]">
            Easy
          </text>
          <circle cx="3" cy="7" r="1.5" fill="#3b82f6" />
          <text x="5.5" y="8" className="fill-foreground text-[2px]">
            Intermediate
          </text>
          <circle cx="3" cy="11" r="1.5" fill="#1f2937" />
          <text x="5.5" y="12" className="fill-foreground text-[2px]">
            Advanced
          </text>
        </g>
      </svg>
    </div>
  )
}
