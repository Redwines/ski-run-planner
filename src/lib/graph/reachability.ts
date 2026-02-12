import { BaseArea, ReachabilityLookup, AdjacencyMap } from './types'
import { buildForwardAdjacency } from './adjacency'
import { Run } from './types'

/**
 * Computes which lifts can reach any base area using BFS from base lifts.
 * Uses forward adjacency since we're tracing paths downhill to base.
 *
 * Algorithm:
 * 1. Start with all lifts at base areas as "can reach base"
 * 2. Use reverse BFS: find all lifts that can ski DOWN to already-reachable lifts
 * 3. Repeat until no new lifts found
 *
 * Result is O(1) lookup for any lift.
 *
 * @param runs Filtered runs for the group's skill level
 * @param baseAreas Array of base areas with their lift IDs
 * @returns Lookup with set of lift IDs that can reach base
 */
export function computeCanReachBase(
  runs: Run[],
  baseAreas: BaseArea[]
): ReachabilityLookup {
  const canReachBase = new Set<string>()

  // Collect all base area lift IDs
  const baseLifts = new Set<string>()
  for (const baseArea of baseAreas) {
    for (const liftId of baseArea.liftIds) {
      baseLifts.add(liftId)
      canReachBase.add(liftId)
    }
  }

  // Build forward adjacency (startLift → endLifts)
  // We need to find lifts that can ski to already-reachable lifts
  // So we iterate: if any endLift is reachable, then startLift is reachable
  const forwardAdj = buildForwardAdjacency(runs)

  // Keep iterating until no new lifts found
  let changed = true
  while (changed) {
    changed = false

    for (const [startLift, neighbors] of forwardAdj) {
      if (canReachBase.has(startLift)) continue

      // Check if any destination is reachable
      for (const neighbor of neighbors) {
        if (canReachBase.has(neighbor.liftId)) {
          canReachBase.add(startLift)
          changed = true
          break
        }
      }
    }
  }

  return { canReachBase }
}

/**
 * O(1) check if a specific lift can reach base.
 * @param lookup The precomputed reachability lookup
 * @param liftId The lift to check
 * @returns True if this lift can reach any base area
 */
export function hasReturnPath(
  lookup: ReachabilityLookup,
  liftId: string
): boolean {
  return lookup.canReachBase.has(liftId)
}

/**
 * Gets all lifts that cannot reach base (trap zones).
 * @param allLiftIds All lift IDs in the filtered graph
 * @param lookup The precomputed reachability lookup
 * @returns Set of lift IDs that are in trap zones
 */
export function getTrapZoneLifts(
  allLiftIds: string[],
  lookup: ReachabilityLookup
): Set<string> {
  const trapLifts = new Set<string>()

  for (const liftId of allLiftIds) {
    if (!lookup.canReachBase.has(liftId)) {
      trapLifts.add(liftId)
    }
  }

  return trapLifts
}
