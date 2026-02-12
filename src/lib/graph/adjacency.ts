import { Run, AdjacencyMap } from './types'

/**
 * Builds a forward adjacency map: lift → [(adjacent lift, via run)]
 * This represents "from top of this lift, I can ski to these other lifts".
 * @param runs Filtered runs based on group skill level
 * @returns Map from liftId to array of reachable lifts with connecting runs
 */
export function buildForwardAdjacency(runs: Run[]): AdjacencyMap {
  const adj: AdjacencyMap = new Map()

  for (const run of runs) {
    const startLift = run.startLiftId

    if (!adj.has(startLift)) {
      adj.set(startLift, [])
    }

    for (const endLiftId of run.endLiftIds) {
      adj.get(startLift)!.push({
        liftId: endLiftId,
        runId: run.id,
      })
    }
  }

  return adj
}

/**
 * Builds a reverse adjacency map: lift → [(adjacent lift, via run)]
 * This represents "from this lift, I can ski back to these lifts (that go downhill to me)".
 * Used for computing reachability to base areas.
 * @param runs Filtered runs based on group skill level
 * @returns Map from liftId to array of lifts that can reach it
 */
export function buildReverseAdjacency(runs: Run[]): AdjacencyMap {
  const adj: AdjacencyMap = new Map()

  for (const run of runs) {
    for (const endLiftId of run.endLiftIds) {
      if (!adj.has(endLiftId)) {
        adj.set(endLiftId, [])
      }

      adj.get(endLiftId)!.push({
        liftId: run.startLiftId,
        runId: run.id,
      })
    }
  }

  return adj
}

/**
 * Builds an undirected adjacency map for zone clustering.
 * Treats each run as bidirectional connection between lifts.
 * @param runs Filtered runs based on group skill level
 * @returns Map from liftId to array of connected lifts (undirected)
 */
export function buildUndirectedAdjacency(runs: Run[]): AdjacencyMap {
  const adj: AdjacencyMap = new Map()

  for (const run of runs) {
    const startLift = run.startLiftId

    if (!adj.has(startLift)) {
      adj.set(startLift, [])
    }

    for (const endLiftId of run.endLiftIds) {
      if (!adj.has(endLiftId)) {
        adj.set(endLiftId, [])
      }

      // Add both directions
      adj.get(startLift)!.push({
        liftId: endLiftId,
        runId: run.id,
      })

      adj.get(endLiftId)!.push({
        liftId: startLift,
        runId: run.id,
      })
    }
  }

  return adj
}

/**
 * Gets all lift IDs that appear in any adjacency map (as keys or values).
 * @param adj The adjacency map
 * @returns Set of all lift IDs
 */
export function getAllLiftsInAdjacency(adj: AdjacencyMap): Set<string> {
  const lifts = new Set<string>()

  for (const [liftId, neighbors] of adj) {
    lifts.add(liftId)
    for (const neighbor of neighbors) {
      lifts.add(neighbor.liftId)
    }
  }

  return lifts
}
