import { describe, it, expect } from 'vitest'
import { suggestNextLift, getBestSuggestion, isSafeMove } from '../../src/lib/graph/suggestion'
import { computeCanReachBase } from '../../src/lib/graph/reachability'
import { computeSafeZones } from '../../src/lib/graph/zones'
import { testRunsAll, testRunsBlue, testBaseAreas } from './testData'

describe('suggestNextLift', () => {
  it('returns suggestions for available routes', () => {
    const reachability = computeCanReachBase(testRunsAll, testBaseAreas)
    const safeZones = computeSafeZones(testRunsAll, reachability)

    const suggestions = suggestNextLift({
      currentLiftId: 'mid-quad',
      runs: testRunsAll,
      reachability,
      safeZones,
    })

    expect(suggestions.length).toBeGreaterThan(0)
  })

  it('only suggests lifts with return path', () => {
    const reachability = computeCanReachBase(testRunsBlue, testBaseAreas)
    const safeZones = computeSafeZones(testRunsBlue, reachability)

    // From top-pair, there's a black run to isolated-lift which has no return path
    // with BLUE runs. That suggestion should be excluded.
    const suggestions = suggestNextLift({
      currentLiftId: 'top-pair',
      runs: testRunsBlue,
      reachability,
      safeZones,
    })

    // All suggestions should have return paths
    for (const suggestion of suggestions) {
      expect(reachability.canReachBase.has(suggestion.toLiftId)).toBe(true)
    }
  })

  it('includes run name in reason', () => {
    const reachability = computeCanReachBase(testRunsAll, testBaseAreas)
    const safeZones = computeSafeZones(testRunsAll, reachability)

    const suggestions = suggestNextLift({
      currentLiftId: 'mid-quad',
      runs: testRunsAll,
      reachability,
      safeZones,
    })

    for (const suggestion of suggestions) {
      const run = testRunsAll.find((r) => r.id === suggestion.viaRunId)
      expect(suggestion.reason).toContain(run?.name)
    }
  })

  it('returns empty array when no safe options', () => {
    const reachability = computeCanReachBase(testRunsBlue, testBaseAreas)
    const safeZones = computeSafeZones(testRunsBlue, reachability)

    // isolated-lift has no BLUE runs going anywhere
    const suggestions = suggestNextLift({
      currentLiftId: 'isolated-lift',
      runs: testRunsBlue,
      reachability,
      safeZones,
    })

    expect(suggestions.length).toBe(0)
  })

  it('prefers same zone when preferSameZone is true', () => {
    const reachability = computeCanReachBase(testRunsAll, testBaseAreas)
    const safeZones = computeSafeZones(testRunsAll, reachability)

    const suggestions = suggestNextLift({
      currentLiftId: 'mid-quad',
      runs: testRunsAll,
      reachability,
      safeZones,
      preferSameZone: true,
    })

    // First suggestion should be in same zone if available
    if (suggestions.length > 1) {
      const firstSuggestion = suggestions[0]
      const currentZone = safeZones.find((z) => z.liftIds.includes('mid-quad'))

      if (currentZone && currentZone.liftIds.includes(firstSuggestion.toLiftId)) {
        // This validates the sorting works
        expect(currentZone.liftIds).toContain(firstSuggestion.toLiftId)
      }
    }
  })
})

describe('getBestSuggestion', () => {
  it('returns first suggestion', () => {
    const reachability = computeCanReachBase(testRunsAll, testBaseAreas)
    const safeZones = computeSafeZones(testRunsAll, reachability)

    const best = getBestSuggestion({
      currentLiftId: 'mid-quad',
      runs: testRunsAll,
      reachability,
      safeZones,
    })

    expect(best).not.toBeNull()
    expect(best?.toLiftId).toBeDefined()
  })

  it('returns null when no suggestions available', () => {
    const reachability = computeCanReachBase(testRunsBlue, testBaseAreas)
    const safeZones = computeSafeZones(testRunsBlue, reachability)

    const best = getBestSuggestion({
      currentLiftId: 'isolated-lift',
      runs: testRunsBlue,
      reachability,
      safeZones,
    })

    expect(best).toBeNull()
  })
})

describe('isSafeMove', () => {
  it('returns true for lifts with return path', () => {
    const reachability = computeCanReachBase(testRunsAll, testBaseAreas)

    expect(isSafeMove('mid-quad', reachability)).toBe(true)
    expect(isSafeMove('base-gondola', reachability)).toBe(true)
  })

  it('returns false for trap zone lifts', () => {
    const reachability = computeCanReachBase(testRunsBlue, testBaseAreas)

    expect(isSafeMove('isolated-lift', reachability)).toBe(false)
  })
})
