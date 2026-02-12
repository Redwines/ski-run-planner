# Graph Model Specification

> Ski Run Planner — Resort Connectivity Graph for MVP

---

## Table of Contents

1. [Model Choice](#model-choice)
2. [Graph Topology](#graph-topology)
3. [JSON Data Shapes](#json-data-shapes)
4. [Enums](#enums)
5. [Graph Operations](#graph-operations)
6. [Derived vs Persisted](#derived-vs-persisted)
7. [Example Data](#example-data)

---

## Model Choice

### Decision: Runs as Directed Edges, Lifts as Nodes

**Chosen:** Option B — Node/Edge model where:
- **Lifts are Nodes**
- **Runs are Directed Edges** connecting lifts

### Justification

| Criteria | Why This Model Wins |
|----------|---------------------|
| **Matches physical reality** | You ride a lift UP, then ski a run DOWN to another lift. Runs naturally connect lifts. |
| **Simplifies path validation** | Standard graph traversal (BFS/DFS) works directly. No intermediate transformation needed. |
| **Enables difficulty filtering** | Filter edges (runs) by difficulty → produces subgraph for safe traversal. |
| **Supports return-path check** | Reachability from any lift back to base area is a standard graph reachability query. |
| **MVP-appropriate complexity** | No need for abstract "station" nodes. Lifts are the natural decision points. |

### Why Not Direct Lift↔Run Adjacency Lists?

Direct adjacency (Option A) would require:
- Separate "runs from this lift" and "runs to this lift" arrays
- Manual join logic for path traversal
- More complex filtering

The edge-based model encodes directionality naturally.

---

## Graph Topology

### Physical Model

```
                    ┌─────────────┐
                    │  LIFT TOP   │ ← You arrive here after riding lift
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │    RUN      │ ← You ski down (directed edge)
                    │ (has difficulty, terrain)
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ LIFT BASE   │ ← You arrive here, can board lift
                    └─────────────┘
```

### Graph Abstraction

```
Lift A ───[Run 1]───► Lift B
  │                     │
  │                     └───[Run 3]───► Lift A  (return path)
  │
  └───[Run 2]───► Lift C
                    │
                    └───[Run 4]───► Lift A  (return path)
```

**Key insight:** A run's `startLiftId` means "accessible from the TOP of this lift."
A run's `endLiftIds` means "ends at the BASE of these lifts."

### Traversal Direction

- **Skiing direction:** Lift.top → Run → Lift.base (downhill)
- **Graph edge direction:** Same as skiing direction
- **To ski from Lift A to Lift B:** Find a run where `startLiftId === A` and `endLiftIds.includes(B)`

---

## JSON Data Shapes

### Resort (Persisted)

```typescript
interface Resort {
  id: string;                    // e.g., "hakuba-goryu"
  name: string;                  // e.g., "Hakuba Goryu"
  region: string;                // e.g., "Hakuba Valley"
  baseAreaLiftIds: string[];     // Lifts accessible from parking/village
  lifts: Lift[];
  runs: Run[];
}
```

### Lift (Persisted)

```typescript
interface Lift {
  id: string;                    // e.g., "goryu-gondola"
  name: string;                  // e.g., "Goryu Gondola"
  type: LiftType;                // See enums
  baseElevation: number;         // Meters above sea level
  topElevation: number;          // Meters above sea level
}
```

**Note:** Lifts do not store connectivity. Connectivity is derived from runs.

### Run (Persisted)

```typescript
interface Run {
  id: string;                    // e.g., "panorama-course"
  name: string;                  // e.g., "Panorama Course"
  difficulty: Difficulty;        // See enums
  terrainType: TerrainType;      // See enums
  verticalDrop?: number;         // Meters (optional, for display only)
  startLiftId: string;           // Lift that provides access to this run's start
  endLiftIds: string[];          // Lifts accessible at the bottom of this run
}
```

**Design decisions:**
- `startLiftId` is singular: A run starts from the top of ONE lift.
- `endLiftIds` is plural: A run may end where multiple lifts are accessible (common at base areas or lift junctions).

### BaseArea (Implicit)

Base areas are not a separate entity. They are identified by:
- `resort.baseAreaLiftIds` — lifts that are directly accessible from village/parking.

A "return to base" query means: "Can we reach any lift in `baseAreaLiftIds`?"

---

## Enums

### Difficulty

```typescript
enum Difficulty {
  GREEN = 1,        // Beginner
  BLUE = 2,         // Low Intermediate / Intermediate
  RED = 3,          // Advanced
  BLACK = 4,        // Expert
  DOUBLE_BLACK = 5  // Expert+
}
```

**Numeric values enable comparison:** `run.difficulty <= threshold`

**Mapping to PRD skill levels:**

| Skill Level | Max Safe Difficulty | "Stretch" Difficulty |
|-------------|---------------------|----------------------|
| Beginner | GREEN (1) | BLUE (2) |
| Low Intermediate | BLUE (2) | RED (3) |
| Intermediate | BLUE (2) | RED (3) |
| Advanced | RED (3) | BLACK (4) |
| Expert | BLACK (4) | DOUBLE_BLACK (5) |

### TerrainType

```typescript
enum TerrainType {
  GROOMED = "groomed",
  MOGULS = "moguls",
  TREE = "tree",
  OFF_PISTE = "off_piste"
}
```

### LiftType

```typescript
enum LiftType {
  CHAIRLIFT = "chairlift",
  GONDOLA = "gondola",
  DRAG = "drag",           // T-bar, poma, etc.
  CABLE_CAR = "cable_car"
}
```

### DifficultyMode (Session)

```typescript
enum DifficultyMode {
  PLAY_IT_SAFE = "play_it_safe",       // Use lowest member's level
  STRETCH_SLIGHTLY = "stretch_slightly" // One level above lowest (if gap ≤ 1)
}
```

---

## Graph Operations

### 1. Filter Graph by Difficulty Threshold

**Purpose:** Produce a subgraph containing only runs the group can safely ski.

**Input:**
- `resort: Resort`
- `maxDifficulty: Difficulty` (numeric)

**Algorithm:**

```
function filterRunsByDifficulty(resort, maxDifficulty):
    return resort.runs.filter(run => run.difficulty <= maxDifficulty)
```

**Output:** Array of `Run` objects within threshold.

**Complexity:** O(n) where n = number of runs.

---

### 2. Build Adjacency Map

**Purpose:** Create lookup for "from this lift, which runs can I take?"

**Input:**
- `runs: Run[]` (already filtered by difficulty)

**Algorithm:**

```
function buildAdjacencyMap(runs):
    adjacency = new Map<string, Run[]>()

    for each run in runs:
        if not adjacency.has(run.startLiftId):
            adjacency.set(run.startLiftId, [])
        adjacency.get(run.startLiftId).push(run)

    return adjacency
```

**Output:** `Map<liftId, Run[]>` — for each lift, the runs accessible from its top.

**Complexity:** O(n) where n = number of runs.

---

### 3. Validate Return Path Exists

**Purpose:** Check if a lift has a safe path back to any base area lift.

**Input:**
- `startLiftId: string`
- `baseAreaLiftIds: string[]`
- `adjacency: Map<string, Run[]>` (filtered)

**Algorithm (BFS):**

```
function hasReturnPath(startLiftId, baseAreaLiftIds, adjacency):
    if startLiftId in baseAreaLiftIds:
        return true

    visited = new Set<string>()
    queue = [startLiftId]

    while queue is not empty:
        currentLift = queue.shift()

        if currentLift in visited:
            continue
        visited.add(currentLift)

        if currentLift in baseAreaLiftIds:
            return true

        runs = adjacency.get(currentLift) or []
        for each run in runs:
            for each endLiftId in run.endLiftIds:
                if endLiftId not in visited:
                    queue.push(endLiftId)

    return false
```

**Output:** `boolean`

**Complexity:** O(V + E) where V = lifts, E = runs.

**Safety rule:** If `hasReturnPath` returns `false`, the lift/zone must NOT be suggested.

---

### 4. Generate "Suggest Next Lift"

**Purpose:** Given current lift, suggest the best next lift to access suitable terrain.

**Input:**
- `currentLiftId: string`
- `adjacency: Map<string, Run[]>` (filtered)
- `baseAreaLiftIds: string[]`

**Algorithm:**

```
function suggestNextLift(currentLiftId, adjacency, baseAreaLiftIds):
    runsFromCurrent = adjacency.get(currentLiftId) or []

    if runsFromCurrent is empty:
        return null  // No safe runs from here

    candidates = []

    for each run in runsFromCurrent:
        for each endLiftId in run.endLiftIds:
            // Check this lift has return path
            if not hasReturnPath(endLiftId, baseAreaLiftIds, adjacency):
                continue  // Skip trap zones

            // Count accessible runs from destination lift
            runsFromDest = adjacency.get(endLiftId) or []
            accessibleRunCount = runsFromDest.length

            candidates.push({
                liftId: endLiftId,
                viaRun: run,
                accessibleRuns: accessibleRunCount
            })

    if candidates is empty:
        return null  // All paths lead to traps

    // Sort by most accessible runs (descending)
    candidates.sort((a, b) => b.accessibleRuns - a.accessibleRuns)

    best = candidates[0]

    return {
        toLiftId: best.liftId,
        viaRunId: best.viaRun.id,
        reason: "Accesses " + best.accessibleRuns + " runs suitable for your group"
    }
```

**Output:**

```typescript
interface RouteSuggestion {
  toLiftId: string;
  viaRunId: string;
  reason: string;
} | null
```

**Complexity:** O(E + V) per suggestion (due to return path checks).

**Performance note:** For MVP with small resort data (<100 runs), this is well under 500ms on mobile.

---

### 5. Compute Safe Zones

**Purpose:** Find clusters of lifts that form self-contained skiing areas within threshold.

**Input:**
- `resort: Resort`
- `maxDifficulty: Difficulty`

**Algorithm:**

```
function computeSafeZones(resort, maxDifficulty):
    filteredRuns = filterRunsByDifficulty(resort, maxDifficulty)
    adjacency = buildAdjacencyMap(filteredRuns)

    zones = []
    visited = new Set<string>()

    for each lift in resort.lifts:
        if lift.id in visited:
            continue

        // BFS to find connected component
        zone = {
            liftIds: [],
            runIds: [],
            hasReturnPath: false
        }

        queue = [lift.id]

        while queue is not empty:
            currentLiftId = queue.shift()

            if currentLiftId in visited:
                continue
            visited.add(currentLiftId)
            zone.liftIds.push(currentLiftId)

            runs = adjacency.get(currentLiftId) or []
            for each run in runs:
                zone.runIds.push(run.id)
                for each endLiftId in run.endLiftIds:
                    if endLiftId not in visited:
                        queue.push(endLiftId)

        // Check if zone has return path to base
        for each liftId in zone.liftIds:
            if liftId in resort.baseAreaLiftIds:
                zone.hasReturnPath = true
                break

        // Only include zones with 2+ lifts (per PRD FR-6)
        if zone.liftIds.length >= 2 and zone.hasReturnPath:
            zones.push(zone)

    return zones
```

**Output:**

```typescript
interface SafeZone {
  liftIds: string[];
  runIds: string[];
  hasReturnPath: boolean;
}
```

**Complexity:** O(V + E)

---

## Derived vs Persisted

| Concept | Type | Storage | Notes |
|---------|------|---------|-------|
| **Resort** | Persisted | JSON file / DB | Static, manually curated |
| **Lift** | Persisted | Within Resort | Static |
| **Run** | Persisted | Within Resort | Static, defines graph edges |
| **Adjacency Map** | Derived | Runtime memory | Built from filtered runs |
| **Safe Zones** | Derived | Runtime memory | Computed per session/threshold |
| **Route Suggestion** | Derived | Runtime (transient) | Computed on-demand |
| **Return Path Valid** | Derived | Runtime (transient) | Computed per query |

### MVP Data Flow

```
┌─────────────────┐
│  Resort JSON    │  (Persisted - static file per resort)
│  - lifts[]      │
│  - runs[]       │
└────────┬────────┘
         │
         ▼ Load once on resort select
┌─────────────────┐
│  In-Memory      │
│  Resort Data    │
└────────┬────────┘
         │
         ▼ On group setup / skill change
┌─────────────────┐
│  Filter by      │  (Derived)
│  Difficulty     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Adjacency Map  │  (Derived)
│  Safe Zones     │
└────────┬────────┘
         │
         ▼ On user action "Suggest Next"
┌─────────────────┐
│  Route          │  (Derived - transient)
│  Suggestion     │
└─────────────────┘
```

---

## Example Data

### Minimal Resort Example

```json
{
  "id": "example-resort",
  "name": "Example Ski Resort",
  "region": "Example Valley",
  "baseAreaLiftIds": ["lift-a"],
  "lifts": [
    {
      "id": "lift-a",
      "name": "Base Quad",
      "type": "chairlift",
      "baseElevation": 1200,
      "topElevation": 1600
    },
    {
      "id": "lift-b",
      "name": "Summit Express",
      "type": "chairlift",
      "baseElevation": 1550,
      "topElevation": 1900
    },
    {
      "id": "lift-c",
      "name": "East Chair",
      "type": "chairlift",
      "baseElevation": 1580,
      "topElevation": 1850
    }
  ],
  "runs": [
    {
      "id": "run-1",
      "name": "Green Valley",
      "difficulty": 1,
      "terrainType": "groomed",
      "startLiftId": "lift-a",
      "endLiftIds": ["lift-a", "lift-b"]
    },
    {
      "id": "run-2",
      "name": "Blue Ridge",
      "difficulty": 2,
      "terrainType": "groomed",
      "startLiftId": "lift-a",
      "endLiftIds": ["lift-c"]
    },
    {
      "id": "run-3",
      "name": "Summit Run",
      "difficulty": 2,
      "terrainType": "groomed",
      "startLiftId": "lift-b",
      "endLiftIds": ["lift-a"]
    },
    {
      "id": "run-4",
      "name": "East Face",
      "difficulty": 3,
      "terrainType": "moguls",
      "startLiftId": "lift-c",
      "endLiftIds": ["lift-a"]
    },
    {
      "id": "run-5",
      "name": "East Traverse",
      "difficulty": 1,
      "terrainType": "groomed",
      "startLiftId": "lift-c",
      "endLiftIds": ["lift-b"]
    }
  ]
}
```

### Graph Visualization of Example

```
                    ┌─────────┐
                    │ LIFT-B  │ (Summit Express)
                    │ 1550m → 1900m
                    └────┬────┘
                         │
            ┌────────────┼────────────┐
            │            │            │
      [run-3 BLUE]       │      ┌─────┴─────┐
            │            │      │  LIFT-C   │ (East Chair)
            ▼            │      │ 1580m → 1850m
       ┌─────────┐       │      └─────┬─────┘
       │ LIFT-A  │◄──────┘            │
       │  (BASE) │              ┌─────┴─────┐
       │ 1200m → 1600m          │           │
       └────┬────┘        [run-4 RED]  [run-5 GREEN]
            │                   │           │
     ┌──────┴──────┐           │           │
     │             │           ▼           ▼
[run-1 GREEN] [run-2 BLUE]  LIFT-A      LIFT-B
     │             │
     ▼             ▼
  LIFT-A        LIFT-C
  LIFT-B
```

### Filtering Example

**Group threshold:** BLUE (2)

**Filtered runs:** run-1, run-2, run-3, run-5 (excludes run-4 RED)

**Safe zone:** All three lifts remain connected via filtered runs.

**Trap detection:** If run-3 were BLACK, LIFT-B would have no return path for BLUE-max group → would be flagged as trap.

---

*Last Updated: 2025-02-12*
*Source: PRD, System Extraction*
