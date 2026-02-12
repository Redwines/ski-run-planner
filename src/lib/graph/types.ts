export enum Difficulty {
  GREEN = 1,
  BLUE = 2,
  RED = 3,
  BLACK = 4,
  DOUBLE_BLACK = 5,
}

export type DifficultyKey = keyof typeof Difficulty

export type LiftType = 'chairlift' | 'gondola' | 'drag' | 'cable_car'

export type TerrainType = 'groomed' | 'moguls' | 'tree' | 'off_piste'

export interface BaseArea {
  id: string
  name: string
  liftIds: string[]
}

export interface Lift {
  id: string
  name: string
  nameJa?: string
  type: LiftType
  baseElevation?: number
  topElevation?: number
  positionX: number
  positionY: number
}

export interface Run {
  id: string
  name: string
  nameJa?: string
  difficultyStandard: DifficultyKey
  difficultyRaw?: string
  terrainType: TerrainType
  length?: number
  maxGrade?: number
  startLiftId: string
  endLiftIds: string[]
}

export interface Resort {
  id: string
  name: string
  region?: string
  baseAreas: BaseArea[]
  lifts: Lift[]
  runs: Run[]
}

export interface SafeZone {
  liftIds: string[]
  runIds: string[]
  hasReturnPath: boolean
}

export interface RouteSuggestion {
  toLiftId: string
  viaRunId: string
  reason: string
}

export type AdjacencyMap = Map<string, Array<{ liftId: string; runId: string }>>

export interface ReachabilityLookup {
  canReachBase: Set<string>
}
