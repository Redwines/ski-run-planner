import { Run, BaseArea, Lift, Difficulty } from '../../src/lib/graph/types'

// Simplified test data based on Tsugaike
export const testLifts: Lift[] = [
  { id: 'base-gondola', name: 'Base Gondola', type: 'gondola', positionX: 50, positionY: 90 },
  { id: 'mid-quad', name: 'Mid Quad', type: 'chairlift', positionX: 45, positionY: 60 },
  { id: 'top-pair', name: 'Top Pair', type: 'chairlift', positionX: 40, positionY: 30 },
  { id: 'summit-lift', name: 'Summit Lift', type: 'chairlift', positionX: 35, positionY: 10 },
  { id: 'isolated-lift', name: 'Isolated Lift', type: 'chairlift', positionX: 80, positionY: 40 },
]

export const testBaseAreas: BaseArea[] = [
  { id: 'main-base', name: 'Main Base', liftIds: ['base-gondola'] },
]

// Runs for different test scenarios
export const testRunsAll: Run[] = [
  // Green runs (easy path to base)
  {
    id: 'green-1',
    name: 'Easy Street',
    difficultyStandard: 'GREEN',
    difficultyRaw: '初級',
    terrainType: 'groomed',
    startLiftId: 'mid-quad',
    endLiftIds: ['base-gondola'],
  },
  // Blue runs (intermediate)
  {
    id: 'blue-1',
    name: 'Blue Cruiser',
    difficultyStandard: 'BLUE',
    difficultyRaw: '中級',
    terrainType: 'groomed',
    startLiftId: 'top-pair',
    endLiftIds: ['mid-quad'],
  },
  {
    id: 'blue-2',
    name: 'Valley Run',
    difficultyStandard: 'BLUE',
    difficultyRaw: '中級',
    terrainType: 'groomed',
    startLiftId: 'mid-quad',
    endLiftIds: ['base-gondola'],
  },
  // Black runs (expert)
  {
    id: 'black-1',
    name: 'Summit Chute',
    difficultyStandard: 'BLACK',
    difficultyRaw: '上級',
    terrainType: 'groomed',
    startLiftId: 'summit-lift',
    endLiftIds: ['top-pair'],
  },
  // Trap zone - only accessible via black run
  {
    id: 'black-2',
    name: 'Expert Only',
    difficultyStandard: 'BLACK',
    difficultyRaw: '上級',
    terrainType: 'groomed',
    startLiftId: 'top-pair',
    endLiftIds: ['isolated-lift'],
  },
  {
    id: 'black-3',
    name: 'Return Expert',
    difficultyStandard: 'BLACK',
    difficultyRaw: '上級',
    terrainType: 'groomed',
    startLiftId: 'isolated-lift',
    endLiftIds: ['mid-quad'],
  },
]

// Subset of runs for beginners (GREEN only)
export const testRunsGreen: Run[] = testRunsAll.filter(
  (r) => r.difficultyStandard === 'GREEN'
)

// Subset of runs for intermediate (GREEN + BLUE)
export const testRunsBlue: Run[] = testRunsAll.filter(
  (r) => ['GREEN', 'BLUE'].includes(r.difficultyStandard)
)

// Get difficulty enum value from key
export function getDifficultyEnum(key: string): Difficulty {
  return Difficulty[key as keyof typeof Difficulty]
}
