import { describe, it, expect } from 'vitest'
import { filterRunsByDifficulty, getDifficultyValue, getDifficultyColor } from '../../src/lib/graph/filter'
import { Difficulty } from '../../src/lib/graph/types'
import { testRunsAll } from './testData'

describe('filterRunsByDifficulty', () => {
  it('filters to only GREEN runs when maxDifficulty is GREEN', () => {
    const result = filterRunsByDifficulty(testRunsAll, Difficulty.GREEN)

    expect(result.length).toBe(1)
    expect(result[0].id).toBe('green-1')
    expect(result.every((r) => r.difficultyStandard === 'GREEN')).toBe(true)
  })

  it('includes GREEN and BLUE runs when maxDifficulty is BLUE', () => {
    const result = filterRunsByDifficulty(testRunsAll, Difficulty.BLUE)

    expect(result.length).toBe(3)
    expect(result.some((r) => r.difficultyStandard === 'GREEN')).toBe(true)
    expect(result.some((r) => r.difficultyStandard === 'BLUE')).toBe(true)
    expect(result.every((r) => ['GREEN', 'BLUE'].includes(r.difficultyStandard))).toBe(true)
  })

  it('includes all runs up to BLACK when maxDifficulty is BLACK', () => {
    const result = filterRunsByDifficulty(testRunsAll, Difficulty.BLACK)

    expect(result.length).toBe(6)
  })

  it('returns empty array when no runs match', () => {
    const noGreenRuns = testRunsAll.filter((r) => r.difficultyStandard !== 'GREEN')
    const result = filterRunsByDifficulty(noGreenRuns, Difficulty.GREEN)

    expect(result.length).toBe(0)
  })
})

describe('getDifficultyValue', () => {
  it('returns correct numeric values for each difficulty', () => {
    expect(getDifficultyValue('GREEN')).toBe(1)
    expect(getDifficultyValue('BLUE')).toBe(2)
    expect(getDifficultyValue('RED')).toBe(3)
    expect(getDifficultyValue('BLACK')).toBe(4)
    expect(getDifficultyValue('DOUBLE_BLACK')).toBe(5)
  })
})

describe('getDifficultyColor', () => {
  it('returns correct color classes', () => {
    expect(getDifficultyColor('GREEN')).toBe('run-green')
    expect(getDifficultyColor('BLUE')).toBe('run-blue')
    expect(getDifficultyColor('RED')).toBe('run-red')
    expect(getDifficultyColor('BLACK')).toBe('run-black')
    expect(getDifficultyColor('DOUBLE_BLACK')).toBe('run-black')
  })
})
