import { Run, Difficulty, DifficultyKey } from './types'

/**
 * Filters runs to only those at or below the specified max difficulty.
 * @param runs All runs in the resort
 * @param maxDifficulty Maximum difficulty level to include (inclusive)
 * @returns Filtered array of runs
 */
export function filterRunsByDifficulty(
  runs: Run[],
  maxDifficulty: Difficulty
): Run[] {
  return runs.filter((run) => {
    const runDifficulty = Difficulty[run.difficultyStandard]
    return runDifficulty <= maxDifficulty
  })
}

/**
 * Converts a difficulty key string to its numeric value.
 * @param key The difficulty key (e.g., 'GREEN', 'BLUE')
 * @returns The numeric difficulty value
 */
export function getDifficultyValue(key: DifficultyKey): Difficulty {
  return Difficulty[key]
}

/**
 * Gets the display color for a difficulty level.
 * @param difficulty The difficulty key
 * @returns CSS color class name
 */
export function getDifficultyColor(difficulty: DifficultyKey): string {
  switch (difficulty) {
    case 'GREEN':
      return 'run-green'
    case 'BLUE':
      return 'run-blue'
    case 'RED':
      return 'run-red'
    case 'BLACK':
    case 'DOUBLE_BLACK':
      return 'run-black'
    default:
      return 'run-green'
  }
}
