import { Run, RouteSuggestion, ReachabilityLookup, SafeZone } from './types'
import { buildForwardAdjacency } from './adjacency'
import { hasReturnPath } from './reachability'
import { getZoneForLift } from './zones'

export interface SuggestionOptions {
  /** Current lift the group is at */
  currentLiftId: string
  /** Filtered runs for the group's skill level */
  runs: Run[]
  /** Precomputed reachability lookup */
  reachability: ReachabilityLookup
  /** Computed safe zones */
  safeZones: SafeZone[]
  /** Prefer staying in current zone vs exploring */
  preferSameZone?: boolean
}

/**
 * Suggests the next lift(s) to visit from the current position.
 *
 * Fail-safe principle: "If uncertain → do not recommend"
 *
 * Priority:
 * 1. Never suggest a lift that would trap the group (no return path)
 * 2. Prefer lifts in the same safe zone
 * 3. Consider variety (avoid recently visited)
 *
 * @param options Suggestion configuration
 * @returns Array of suggestions, empty if none are safe
 */
export function suggestNextLift(
  options: SuggestionOptions
): RouteSuggestion[] {
  const { currentLiftId, runs, reachability, safeZones, preferSameZone = true } = options

  const forwardAdj = buildForwardAdjacency(runs)
  const currentNeighbors = forwardAdj.get(currentLiftId) || []

  if (currentNeighbors.length === 0) {
    return [] // No options from current lift
  }

  const currentZone = getZoneForLift(safeZones, currentLiftId)
  const suggestions: RouteSuggestion[] = []

  for (const neighbor of currentNeighbors) {
    const { liftId: toLiftId, runId: viaRunId } = neighbor

    // CRITICAL: Only suggest lifts with confirmed return path
    if (!hasReturnPath(reachability, toLiftId)) {
      continue // Skip trap zones
    }

    // Find the run details for the reason
    const run = runs.find((r) => r.id === viaRunId)
    if (!run) continue

    // Check if destination is in same zone
    const destZone = getZoneForLift(safeZones, toLiftId)
    const isSameZone = currentZone && destZone && currentZone === destZone

    // Build suggestion with reason
    let reason = `Take ${run.name}`
    if (run.nameJa) {
      reason += ` (${run.nameJa})`
    }
    reason += ` - ${run.difficultyRaw || run.difficultyStandard}`

    if (isSameZone) {
      reason += ' [Same Zone]'
    }

    suggestions.push({
      toLiftId,
      viaRunId,
      reason,
    })
  }

  // Sort: same zone first if preferred, then alphabetically
  if (preferSameZone && currentZone) {
    suggestions.sort((a, b) => {
      const aInZone = currentZone.liftIds.includes(a.toLiftId)
      const bInZone = currentZone.liftIds.includes(b.toLiftId)

      if (aInZone && !bInZone) return -1
      if (!aInZone && bInZone) return 1
      return a.toLiftId.localeCompare(b.toLiftId)
    })
  }

  return suggestions
}

/**
 * Gets a single "best" suggestion, or null if none available.
 * Uses the first suggestion from suggestNextLift.
 *
 * @param options Suggestion configuration
 * @returns Best suggestion or null
 */
export function getBestSuggestion(
  options: SuggestionOptions
): RouteSuggestion | null {
  const suggestions = suggestNextLift(options)
  return suggestions[0] || null
}

/**
 * Checks if moving to a specific lift would be safe.
 * @param toLiftId The destination lift
 * @param reachability Precomputed reachability lookup
 * @returns True if the move is safe (has return path)
 */
export function isSafeMove(
  toLiftId: string,
  reachability: ReachabilityLookup
): boolean {
  return hasReturnPath(reachability, toLiftId)
}
