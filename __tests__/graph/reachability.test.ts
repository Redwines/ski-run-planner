import { describe, it, expect } from 'vitest'
import { computeCanReachBase, hasReturnPath, getTrapZoneLifts } from '../../src/lib/graph/reachability'
import { testRunsAll, testRunsBlue, testRunsGreen, testBaseAreas, testLifts } from './testData'

describe('computeCanReachBase', () => {
  it('marks base lifts as reachable', () => {
    const result = computeCanReachBase(testRunsAll, testBaseAreas)

    expect(result.canReachBase.has('base-gondola')).toBe(true)
  })

  it('marks lifts with direct path to base as reachable', () => {
    const result = computeCanReachBase(testRunsAll, testBaseAreas)

    // mid-quad has green-1 and blue-2 going to base-gondola
    expect(result.canReachBase.has('mid-quad')).toBe(true)
  })

  it('marks lifts with indirect path to base as reachable', () => {
    const result = computeCanReachBase(testRunsAll, testBaseAreas)

    // top-pair → mid-quad → base-gondola
    expect(result.canReachBase.has('top-pair')).toBe(true)
    // summit-lift → top-pair → mid-quad → base-gondola
    expect(result.canReachBase.has('summit-lift')).toBe(true)
  })

  it('marks isolated-lift as reachable when black runs included', () => {
    const result = computeCanReachBase(testRunsAll, testBaseAreas)

    // isolated-lift → mid-quad → base-gondola (via black-3)
    expect(result.canReachBase.has('isolated-lift')).toBe(true)
  })

  it('identifies trap zones when black runs excluded', () => {
    // With only GREEN + BLUE runs, isolated-lift has no return path
    const result = computeCanReachBase(testRunsBlue, testBaseAreas)

    expect(result.canReachBase.has('isolated-lift')).toBe(false)
  })

  it('limits reachability with GREEN only runs', () => {
    const result = computeCanReachBase(testRunsGreen, testBaseAreas)

    // Only base-gondola and mid-quad should be reachable
    expect(result.canReachBase.has('base-gondola')).toBe(true)
    expect(result.canReachBase.has('mid-quad')).toBe(true)
    expect(result.canReachBase.has('top-pair')).toBe(false)
    expect(result.canReachBase.has('summit-lift')).toBe(false)
  })
})

describe('hasReturnPath', () => {
  it('returns true for lifts with return path', () => {
    const lookup = computeCanReachBase(testRunsAll, testBaseAreas)

    expect(hasReturnPath(lookup, 'base-gondola')).toBe(true)
    expect(hasReturnPath(lookup, 'mid-quad')).toBe(true)
    expect(hasReturnPath(lookup, 'top-pair')).toBe(true)
  })

  it('returns false for trap zone lifts', () => {
    const lookup = computeCanReachBase(testRunsBlue, testBaseAreas)

    expect(hasReturnPath(lookup, 'isolated-lift')).toBe(false)
  })

  it('is O(1) lookup', () => {
    const lookup = computeCanReachBase(testRunsAll, testBaseAreas)

    // Multiple lookups should be fast
    const start = performance.now()
    for (let i = 0; i < 10000; i++) {
      hasReturnPath(lookup, 'mid-quad')
    }
    const end = performance.now()

    // 10000 lookups should take less than 50ms
    expect(end - start).toBeLessThan(50)
  })
})

describe('getTrapZoneLifts', () => {
  it('returns empty set when all lifts can reach base', () => {
    const lookup = computeCanReachBase(testRunsAll, testBaseAreas)
    const allLiftIds = testLifts.map((l) => l.id)
    const trapLifts = getTrapZoneLifts(allLiftIds, lookup)

    expect(trapLifts.size).toBe(0)
  })

  it('identifies trap zone lifts when some paths are blocked', () => {
    const lookup = computeCanReachBase(testRunsBlue, testBaseAreas)
    const allLiftIds = testLifts.map((l) => l.id)
    const trapLifts = getTrapZoneLifts(allLiftIds, lookup)

    expect(trapLifts.has('isolated-lift')).toBe(true)
  })

  it('identifies multiple trap lifts with GREEN only', () => {
    const lookup = computeCanReachBase(testRunsGreen, testBaseAreas)
    const allLiftIds = testLifts.map((l) => l.id)
    const trapLifts = getTrapZoneLifts(allLiftIds, lookup)

    expect(trapLifts.has('top-pair')).toBe(true)
    expect(trapLifts.has('summit-lift')).toBe(true)
    expect(trapLifts.has('isolated-lift')).toBe(true)
  })
})
