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
  baseAreas: BaseArea[];         // Named base areas with their lifts
  lifts: Lift[];
  runs: Run[];
}
```

### BaseArea (Persisted)

```typescript
interface BaseArea {
  id: string;                    // e.g., "main-village"
  name: string;                  // e.g., "Main Village"
  liftIds: string[];             // Lifts accessible from this base area
}
```

**Design decisions:**
- Base areas are explicit entities, not just a flat list of lift IDs.
- Allows multiple distinct base areas (e.g., "Main Village", "East Parking").
- "Return to base" means reaching ANY lift in ANY base area.
- Future-compatible: can add amenities, parking info, etc.

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
  difficultyStandard: Difficulty; // Normalized difficulty (used for filtering)
  difficultyRaw?: string;        // Original resort marking (e.g., "上級", "◆◆")
  terrainType: TerrainType;      // See enums
  verticalDrop?: number;         // Meters (optional, for display only)
  startLiftId: string;           // Lift that provides access to this run's start
  endLiftIds: string[];          // Lifts accessible at the bottom of this run
}
```

**Difficulty field design:**

| Field | Purpose | Example |
|-------|---------|---------|
| `difficultyStandard` | Normalized enum for all filtering/logic | `Difficulty.RED` (3) |
| `difficultyRaw` | Original resort marking for display | `"上級"`, `"◆◆"`, `"Schwer"` |

**Why two fields?**
- Different regions use different systems (Japan: 初級/中級/上級, Europe: colors, US: shapes)
- `difficultyStandard` enables consistent filtering logic
- `difficultyRaw` preserves original labeling for user familiarity
- Mapping is done during data curation, not at runtime

**Other design decisions:**
- `startLiftId` is singular: A run starts from the top of ONE lift.
- `endLiftIds` is plural: A run may end where multiple lifts are accessible.

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

**Numeric values enable comparison:** `run.difficultyStandard <= threshold`

**Mapping to PRD skill levels:**

| Skill Level | Max Safe Difficulty | "Stretch" Difficulty |
|-------------|---------------------|----------------------|
| Beginner | GREEN (1) | BLUE (2) |
| Low Intermediate | BLUE (2) | RED (3) |
| Intermediate | BLUE (2) | RED (3) |
| Advanced | RED (3) | BLACK (4) |
| Expert | BLACK (4) | DOUBLE_BLACK (5) |

**Regional mapping examples:**

| Region | Green | Blue | Red | Black | Double Black |
|--------|-------|------|-----|-------|--------------|
| **Japan** | 初級 | 中級 | 中上級 | 上級 | エキスパート |
| **Europe** | Green | Blue | Red | Black | — |
| **North America** | 🟢 | 🔵 | ◆ | ◆◆ | ◆◆ + EX |

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

### Overview: Precomputed vs On-Demand

| Operation | When Computed | Complexity |
|-----------|---------------|------------|
| Filter runs by difficulty | On skill change | O(R) |
| Build forward adjacency | On skill change | O(R) |
| Build reverse adjacency | On skill change | O(R) |
| Compute `canReachBase` lookup | On skill change | O(V + E) |
| Check return path | On-demand | **O(1)** |
| Compute safe zones | On skill change | O(V + E) |
| Suggest next lift | On-demand | O(E) per lift |

**Key optimization:** Return path validation is precomputed once per difficulty threshold, not per candidate.

---

### 1. Filter Graph by Difficulty Threshold

**Purpose:** Produce a subgraph containing only runs the group can safely ski.

**Input:**
- `resort: Resort`
- `maxDifficulty: Difficulty` (numeric)

**Algorithm:**

```
function filterRunsByDifficulty(resort, maxDifficulty):
    return resort.runs.filter(run => run.difficultyStandard <= maxDifficulty)
```

**Output:** Array of `Run` objects within threshold.

**Complexity:** O(R) where R = number of runs.

---

### 2. Build Forward Adjacency Map

**Purpose:** Create lookup for "from this lift, which runs can I take?"

**Input:**
- `runs: Run[]` (already filtered by difficulty)

**Algorithm:**

```
function buildForwardAdjacency(runs):
    adjacency = new Map<string, Run[]>()

    for each run in runs:
        if not adjacency.has(run.startLiftId):
            adjacency.set(run.startLiftId, [])
        adjacency.get(run.startLiftId).push(run)

    return adjacency
```

**Output:** `Map<liftId, Run[]>` — for each lift, the runs accessible from its top.

**Complexity:** O(R) where R = number of filtered runs.

---

### 3. Build Reverse Adjacency Map

**Purpose:** Create lookup for "which lifts have runs leading TO this lift?"

**Input:**
- `filteredRuns: Run[]` (runs already filtered by difficulty threshold)

**Algorithm:**

```
function buildReverseAdjacency(filteredRuns):
    reverse = new Map<string, string[]>()

    for each run in filteredRuns:
        for each endLiftId in run.endLiftIds:
            if not reverse.has(endLiftId):
                reverse.set(endLiftId, [])
            // Add the lift that can REACH this lift (skiing down)
            if run.startLiftId not in reverse.get(endLiftId):
                reverse.get(endLiftId).push(run.startLiftId)

    return reverse
```

**Output:** `Map<liftId, liftId[]>` — for each lift, which lifts can ski down TO it.

**Complexity:** O(R × avg endLiftIds length)

---

### 4. Precompute Return Path Reachability

**Purpose:** Build O(1) lookup for "can this lift reach any base area?"

**Input:**
- `resort: Resort`
- `filteredRuns: Run[]` (runs already filtered by difficulty threshold)

**Algorithm (BFS from base lifts via reverse adjacency):**

```
function computeCanReachBase(resort, filteredRuns):
    canReachBase = new Map<string, boolean>()

    // Initialize all lifts as unreachable
    for each lift in resort.lifts:
        canReachBase.set(lift.id, false)

    // Collect all base area lift IDs
    baseLiftIds = new Set<string>()
    for each baseArea in resort.baseAreas:
        for each liftId in baseArea.liftIds:
            baseLiftIds.add(liftId)

    // Build reverse adjacency from filtered runs only
    reverseAdj = buildReverseAdjacency(filteredRuns)

    // BFS from base lifts, traversing BACKWARDS via reverse adjacency
    // If lift B has a run to lift A, and A can reach base, then B can too
    queue = Array.from(baseLiftIds)
    visited = new Set<string>(baseLiftIds)

    while queue is not empty:
        currentLift = queue.shift()
        canReachBase.set(currentLift, true)

        // Find lifts that have runs leading TO currentLift
        upstreamLifts = reverseAdj.get(currentLift) or []
        for each upstreamLiftId in upstreamLifts:
            if upstreamLiftId not in visited:
                visited.add(upstreamLiftId)
                queue.push(upstreamLiftId)

    return canReachBase
```

**Output:** `Map<liftId, boolean>` — O(1) lookup for any lift.

**Complexity:** O(V + E) computed once per difficulty threshold.

---

### 5. Check Return Path (O(1))

**Purpose:** Instant check if a lift has safe return to base.

**Input:**
- `liftId: string`
- `canReachBase: Map<string, boolean>` (precomputed)

**Algorithm:**

```
function hasReturnPath(liftId, canReachBase):
    return canReachBase.get(liftId) === true
```

**Output:** `boolean`

**Complexity:** O(1)

---

### 6. Generate "Suggest Next Lift"

**Purpose:** Given current lift, suggest the best next lift to access suitable terrain.

**Input:**
- `currentLiftId: string`
- `forwardAdjacency: Map<string, Run[]>` (filtered)
- `canReachBase: Map<string, boolean>` (precomputed)

**Algorithm:**

```
function suggestNextLift(currentLiftId, forwardAdjacency, canReachBase):
    runsFromCurrent = forwardAdjacency.get(currentLiftId) or []

    if runsFromCurrent is empty:
        return null  // No safe runs from here

    candidates = []

    for each run in runsFromCurrent:
        for each endLiftId in run.endLiftIds:
            // O(1) check: does this lift have return path?
            if not hasReturnPath(endLiftId, canReachBase):
                continue  // Skip trap zones

            // Count accessible runs from destination lift
            runsFromDest = forwardAdjacency.get(endLiftId) or []
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

**Complexity:** O(E) where E = runs from current lift (typically small).

---

### 7. Build Undirected Adjacency (for Zone Clustering)

**Purpose:** Create bidirectional connectivity for finding ski zones.

**Rationale:** Directed graph can fragment zones that are physically connected. If Lift A → Run → Lift B, then A and B are in the same ski zone regardless of direction.

**Input:**
- `runs: Run[]` (already filtered by difficulty)

**Algorithm:**

```
function buildUndirectedAdjacency(runs):
    adjacency = new Map<string, Set<string>>()

    for each run in runs:
        // Ensure both lifts exist in map
        if not adjacency.has(run.startLiftId):
            adjacency.set(run.startLiftId, new Set())

        for each endLiftId in run.endLiftIds:
            if not adjacency.has(endLiftId):
                adjacency.set(endLiftId, new Set())

            // Add bidirectional edges
            adjacency.get(run.startLiftId).add(endLiftId)
            adjacency.get(endLiftId).add(run.startLiftId)

    return adjacency
```

**Output:** `Map<liftId, Set<liftId>>` — undirected neighbors.

**Complexity:** O(R × avg endLiftIds length)

---

### 8. Compute Safe Zones (Weak Connectivity)

**Purpose:** Find clusters of lifts that form self-contained skiing areas.

**Input:**
- `resort: Resort`
- `maxDifficulty: Difficulty`
- `canReachBase: Map<string, boolean>` (precomputed)

**Algorithm:**

```
function computeSafeZones(resort, maxDifficulty, canReachBase):
    filteredRuns = filterRunsByDifficulty(resort, maxDifficulty)
    undirectedAdj = buildUndirectedAdjacency(filteredRuns)
    forwardAdj = buildForwardAdjacency(filteredRuns)

    zones = []
    visited = new Set<string>()

    for each lift in resort.lifts:
        if lift.id in visited:
            continue
        if not undirectedAdj.has(lift.id):
            continue  // Lift has no runs at this difficulty

        // BFS to find weakly connected component
        zone = {
            liftIds: [],
            runIds: new Set<string>(),
            hasReturnPath: false
        }

        queue = [lift.id]

        while queue is not empty:
            currentLiftId = queue.shift()

            if currentLiftId in visited:
                continue
            visited.add(currentLiftId)
            zone.liftIds.push(currentLiftId)

            // Check return path for this lift
            if hasReturnPath(currentLiftId, canReachBase):
                zone.hasReturnPath = true

            // Collect runs from this lift
            runsFromHere = forwardAdj.get(currentLiftId) or []
            for each run in runsFromHere:
                zone.runIds.add(run.id)

            // Traverse undirected edges
            neighbors = undirectedAdj.get(currentLiftId) or new Set()
            for each neighborId in neighbors:
                if neighborId not in visited:
                    queue.push(neighborId)

        // Convert runIds to array
        zone.runIds = Array.from(zone.runIds)

        // Only include zones with 2+ lifts AND return path (per PRD FR-6)
        if zone.liftIds.length >= 2 and zone.hasReturnPath:
            zones.push(zone)

    return zones
```

**Output:**

```typescript
interface SafeZone {
  liftIds: string[];
  runIds: string[];
  hasReturnPath: boolean;  // Always true for included zones
}
```

**Why weak connectivity?**

| Scenario | Directed | Undirected (Weak) |
|----------|----------|-------------------|
| A → B, B → A | Same zone | Same zone |
| A → B, B → C, C → A | Same zone | Same zone |
| A → B only | A and B in **different** zones | A and B in **same** zone |

Weak connectivity reflects physical reality: if you can ski between two lifts (in either direction), they're part of the same ski area.

**Complexity:** O(V + E)

---

## Derived vs Persisted

| Concept | Type | Storage | Notes |
|---------|------|---------|-------|
| **Resort** | Persisted | JSON file / DB | Static, manually curated |
| **BaseArea** | Persisted | Within Resort | Static, defines return targets |
| **Lift** | Persisted | Within Resort | Static |
| **Run** | Persisted | Within Resort | Static, defines graph edges |
| **Forward Adjacency** | Derived | Runtime memory | Built from filtered runs |
| **Reverse Adjacency** | Derived | Runtime memory | Built from filtered runs |
| **Undirected Adjacency** | Derived | Runtime memory | Built from filtered runs |
| **canReachBase Lookup** | Derived | Runtime memory | Precomputed per threshold |
| **Safe Zones** | Derived | Runtime memory | Computed per threshold |
| **Route Suggestion** | Derived | Runtime (transient) | Computed on-demand |

### MVP Data Flow

```
┌─────────────────┐
│  Resort JSON    │  (Persisted - static file per resort)
│  - baseAreas[]  │
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
┌─────────────────────────────────────────┐
│  Precompute (runs once per threshold):  │
│  - Filter runs by difficulty            │
│  - Build forward adjacency              │
│  - Build reverse adjacency              │
│  - Build undirected adjacency           │
│  - Compute canReachBase lookup          │
│  - Compute safe zones                   │
└────────┬────────────────────────────────┘
         │
         ▼ On user action "Suggest Next"
┌─────────────────┐
│  Route          │  (O(E) using precomputed lookups)
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
  "baseAreas": [
    {
      "id": "main-village",
      "name": "Main Village",
      "liftIds": ["lift-a"]
    }
  ],
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
      "difficultyStandard": 1,
      "difficultyRaw": "初級",
      "terrainType": "groomed",
      "startLiftId": "lift-a",
      "endLiftIds": ["lift-a", "lift-b"]
    },
    {
      "id": "run-2",
      "name": "Blue Ridge",
      "difficultyStandard": 2,
      "difficultyRaw": "中級",
      "terrainType": "groomed",
      "startLiftId": "lift-a",
      "endLiftIds": ["lift-c"]
    },
    {
      "id": "run-3",
      "name": "Summit Run",
      "difficultyStandard": 2,
      "difficultyRaw": "中級",
      "terrainType": "groomed",
      "startLiftId": "lift-b",
      "endLiftIds": ["lift-a"]
    },
    {
      "id": "run-4",
      "name": "East Face",
      "difficultyStandard": 3,
      "difficultyRaw": "上級",
      "terrainType": "moguls",
      "startLiftId": "lift-c",
      "endLiftIds": ["lift-a"]
    },
    {
      "id": "run-5",
      "name": "East Traverse",
      "difficultyStandard": 1,
      "difficultyRaw": "初級",
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

### Precomputation Example

**Group threshold:** BLUE (2)

**Filtered runs:** run-1, run-2, run-3, run-5 (excludes run-4 RED)

**canReachBase computation:**
1. Start with base lifts: `{lift-a}`
2. BFS backwards via reverse adjacency:
   - lift-a is base → `canReachBase[lift-a] = true`
   - run-3 ends at lift-a, starts at lift-b → `canReachBase[lift-b] = true`
   - run-1 ends at lift-a, starts at lift-a → (already true)
   - run-5 ends at lift-b, starts at lift-c → `canReachBase[lift-c] = true`
3. Result: All three lifts can reach base via BLUE-or-easier runs.

**Safe zones (weak connectivity):**
- All three lifts are connected via undirected edges
- Forms one zone: `{lift-a, lift-b, lift-c}`
- All have `canReachBase = true`
- Zone is valid (2+ lifts, has return path)

**Trap detection example:**
If run-3 were BLACK (filtered out), lift-b would have no run leading back toward base at BLUE level:
- `canReachBase[lift-b] = false`
- lift-b would be flagged as trap
- Zone would split or exclude lift-b

---

*Last Updated: 2025-02-12*
*Source: PRD, System Extraction*
