import { Run, SafeZone, ReachabilityLookup, AdjacencyMap } from './types'
import { buildUndirectedAdjacency } from './adjacency'
import { hasReturnPath } from './reachability'

/**
 * Computes safe zones using weak connectivity (undirected graph).
 * A safe zone is a connected component where:
 * 1. Contains 2+ lifts connected by suitable runs
 * 2. At least one lift has a return path to base
 *
 * Uses undirected adjacency to avoid fragmenting connected ski areas
 * due to directional run flow.
 *
 * @param runs Filtered runs for the group's skill level
 * @param reachability Precomputed reachability lookup
 * @returns Array of safe zones
 */
export function computeSafeZones(
  runs: Run[],
  reachability: ReachabilityLookup
): SafeZone[] {
  const undirectedAdj = buildUndirectedAdjacency(runs)
  const visited = new Set<string>()
  const zones: SafeZone[] = []

  // Find connected components using BFS
  for (const startLift of undirectedAdj.keys()) {
    if (visited.has(startLift)) continue

    // BFS to find all connected lifts
    const component = new Set<string>()
    const runIds = new Set<string>()
    const queue: string[] = [startLift]

    while (queue.length > 0) {
      const current = queue.shift()!
      if (visited.has(current)) continue

      visited.add(current)
      component.add(current)

      const neighbors = undirectedAdj.get(current) || []
      for (const neighbor of neighbors) {
        runIds.add(neighbor.runId)
        if (!visited.has(neighbor.liftId)) {
          queue.push(neighbor.liftId)
        }
      }
    }

    // Check if this component qualifies as a safe zone
    if (component.size >= 2) {
      // Check if any lift in the component can reach base
      let zoneHasReturnPath = false
      for (const liftId of component) {
        if (hasReturnPath(reachability, liftId)) {
          zoneHasReturnPath = true
          break
        }
      }

      zones.push({
        liftIds: Array.from(component),
        runIds: Array.from(runIds),
        hasReturnPath: zoneHasReturnPath,
      })
    }
  }

  return zones
}

/**
 * Gets the safe zone containing a specific lift.
 * @param zones All computed safe zones
 * @param liftId The lift to find
 * @returns The safe zone containing this lift, or undefined
 */
export function getZoneForLift(
  zones: SafeZone[],
  liftId: string
): SafeZone | undefined {
  return zones.find((zone) => zone.liftIds.includes(liftId))
}

/**
 * Checks if a lift is in any safe zone.
 * @param zones All computed safe zones
 * @param liftId The lift to check
 * @returns True if the lift is in a safe zone
 */
export function isLiftInSafeZone(zones: SafeZone[], liftId: string): boolean {
  return zones.some((zone) => zone.liftIds.includes(liftId))
}

/**
 * Gets all lifts that are NOT in any safe zone (isolated or single lifts).
 * @param allLiftIds All lift IDs
 * @param zones All computed safe zones
 * @returns Set of isolated lift IDs
 */
export function getIsolatedLifts(
  allLiftIds: string[],
  zones: SafeZone[]
): Set<string> {
  const liftIdsInZones = new Set<string>()
  for (const zone of zones) {
    for (const liftId of zone.liftIds) {
      liftIdsInZones.add(liftId)
    }
  }

  const isolated = new Set<string>()
  for (const liftId of allLiftIds) {
    if (!liftIdsInZones.has(liftId)) {
      isolated.add(liftId)
    }
  }

  return isolated
}
