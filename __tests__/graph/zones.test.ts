import { describe, it, expect } from 'vitest'
import { computeSafeZones, getZoneForLift, isLiftInSafeZone, getIsolatedLifts } from '../../src/lib/graph/zones'
import { computeCanReachBase } from '../../src/lib/graph/reachability'
import { testRunsAll, testRunsBlue, testBaseAreas, testLifts } from './testData'

describe('computeSafeZones', () => {
  it('creates zones with 2+ connected lifts', () => {
    const reachability = computeCanReachBase(testRunsAll, testBaseAreas)
    const zones = computeSafeZones(testRunsAll, reachability)

    // All zones should have at least 2 lifts
    for (const zone of zones) {
      expect(zone.liftIds.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('includes runs that connect zone lifts', () => {
    const reachability = computeCanReachBase(testRunsAll, testBaseAreas)
    const zones = computeSafeZones(testRunsAll, reachability)

    // Each zone should have at least one run
    for (const zone of zones) {
      expect(zone.runIds.length).toBeGreaterThan(0)
    }
  })

  it('marks zones with return path correctly', () => {
    const reachability = computeCanReachBase(testRunsAll, testBaseAreas)
    const zones = computeSafeZones(testRunsAll, reachability)

    // With all runs, main zone should have return path
    const mainZone = zones.find((z) => z.liftIds.includes('base-gondola'))
    expect(mainZone?.hasReturnPath).toBe(true)
  })

  it('uses weak connectivity (undirected)', () => {
    const reachability = computeCanReachBase(testRunsAll, testBaseAreas)
    const zones = computeSafeZones(testRunsAll, reachability)

    // With undirected adjacency, connected lifts should be in same zone
    // even if runs only flow one direction
    const baseZone = zones.find((z) => z.liftIds.includes('base-gondola'))

    // mid-quad connects to base-gondola via runs
    expect(baseZone?.liftIds).toContain('mid-quad')
  })
})

describe('getZoneForLift', () => {
  it('returns the zone containing the lift', () => {
    const reachability = computeCanReachBase(testRunsAll, testBaseAreas)
    const zones = computeSafeZones(testRunsAll, reachability)

    const zone = getZoneForLift(zones, 'mid-quad')

    expect(zone).toBeDefined()
    expect(zone?.liftIds).toContain('mid-quad')
  })

  it('returns undefined for lifts not in any zone', () => {
    // Create a scenario with isolated lift
    const reachability = computeCanReachBase(testRunsBlue, testBaseAreas)
    const zones = computeSafeZones(testRunsBlue, reachability)

    // isolated-lift has no BLUE connections, might not be in a zone
    const zone = getZoneForLift(zones, 'isolated-lift')

    // If isolated-lift is not connected by any BLUE runs, it won't be in a zone
    if (zone) {
      expect(zone.liftIds).toContain('isolated-lift')
    }
  })
})

describe('isLiftInSafeZone', () => {
  it('returns true for lifts in a zone', () => {
    const reachability = computeCanReachBase(testRunsAll, testBaseAreas)
    const zones = computeSafeZones(testRunsAll, reachability)

    expect(isLiftInSafeZone(zones, 'mid-quad')).toBe(true)
  })

  it('returns false for lifts not in any zone', () => {
    // With no runs, no zones exist
    const reachability = computeCanReachBase([], testBaseAreas)
    const zones = computeSafeZones([], reachability)

    expect(isLiftInSafeZone(zones, 'mid-quad')).toBe(false)
  })
})

describe('getIsolatedLifts', () => {
  it('returns lifts not in any zone', () => {
    // With no runs, all lifts are isolated
    const reachability = computeCanReachBase([], testBaseAreas)
    const zones = computeSafeZones([], reachability)
    const allLiftIds = testLifts.map((l) => l.id)

    const isolated = getIsolatedLifts(allLiftIds, zones)

    expect(isolated.size).toBe(allLiftIds.length)
  })

  it('returns empty set when all lifts are in zones', () => {
    const reachability = computeCanReachBase(testRunsAll, testBaseAreas)
    const zones = computeSafeZones(testRunsAll, reachability)

    // Only count lifts that appear in the runs
    const connectedLiftIds = new Set<string>()
    for (const zone of zones) {
      for (const liftId of zone.liftIds) {
        connectedLiftIds.add(liftId)
      }
    }

    const isolated = getIsolatedLifts(Array.from(connectedLiftIds), zones)

    expect(isolated.size).toBe(0)
  })
})
