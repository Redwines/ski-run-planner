# System Extraction

> Extracted from PRD — System Actors, Domain Entities, and Architecture Implications

---

## Table of Contents

1. [System Actors](#system-actors)
2. [Core Domain Entities](#core-domain-entities)
3. [Entity Relationships](#entity-relationships)
4. [High-Level Architecture Implications](#high-level-architecture-implications)
5. [Build-Critical Requirements Summary](#build-critical-requirements-summary)
6. [Ambiguities / Needs Clarification](#ambiguities--needs-clarification)

---

## System Actors

| Actor | Type | Description |
|-------|------|-------------|
| **User** | Primary | The person operating the app (Family Planner Parent / Group Organiser) |
| **Group Member** | Passive Entity | A person in the ski group; represented as data, not a system user |
| **System** | Internal | The app logic that calculates zones, suggests routes, enforces safety rules |
| **Resort Data Source** | External (Future) | Manually curated now; future: APIs, GPS, lift status feeds |

---

## Core Domain Entities

```
┌─────────────────────────────────────────────────────────────────┐
│                         DOMAIN MODEL                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Resort                                                         │
│  ├── id, name, region                                           │
│  ├── baseAreas[]                                                │
│  ├── lifts[]                                                    │
│  └── runs[]                                                     │
│                                                                 │
│  Lift                                                           │
│  ├── id, name, type                                             │
│  ├── baseElevation, topElevation                                │
│  └── connectedRuns[] (graph edge)                               │
│                                                                 │
│  Run                                                            │
│  ├── id, name                                                   │
│  ├── difficulty (enum: Green/Blue/Red/Black/DoubleBlack)        │
│  ├── terrainType (enum: Groomed/Moguls/Tree/OffPiste)           │
│  ├── verticalDrop (optional)                                    │
│  ├── startLift, endLift (graph edges)                           │
│  └── connectedLifts[]                                           │
│                                                                 │
│  GroupSession                                                   │
│  ├── id, name (optional), resortId                              │
│  ├── createdAt                                                  │
│  ├── difficultyMode (enum: PlayItSafe/StretchSlightly)          │
│  └── members[]                                                  │
│                                                                 │
│  GroupMember                                                    │
│  ├── id, name                                                   │
│  ├── discipline (enum: Ski/Snowboard)                           │
│  └── skillLevel (enum: Beginner/LowIntermediate/Intermediate/   │
│                        Advanced/Expert)                         │
│                                                                 │
│  SafeZone (computed)                                            │
│  ├── lifts[], runs[]                                            │
│  ├── minDifficulty, maxDifficulty                               │
│  └── hasReturnPath: boolean                                     │
│                                                                 │
│  RouteSuggestion (computed)                                     │
│  ├── fromLift, toLift                                           │
│  ├── reason (explanation string)                                │
│  └── accessibleRuns[]                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Entity Relationships

### Graph Structure

```
Resort ─┬── 1:N ──► Lift
        ├── 1:N ──► Run
        └── 1:N ──► BaseArea

Lift ◄── N:N ──► Run  (connectivity graph)

GroupSession ── 1:N ──► GroupMember
GroupSession ── N:1 ──► Resort

SafeZone (derived from Resort graph + GroupSession skill range)
RouteSuggestion (derived from current Lift + SafeZones)
```

---

## High-Level Architecture Implications

### 1. Data Architecture

| Implication | Rationale |
|-------------|-----------|
| **Graph-based resort model** | Connectivity queries (lift→run→lift) are core to routing |
| **Static data viable for MVP** | No real-time dependencies; data can be bundled or fetched once |
| **Forward-compatible schema** | Must accommodate future: GPS coords, lift status, crowd data |
| **Manual curation pipeline** | Need tooling/process to add resorts (10-15 for launch) |

### 2. Compute Architecture

| Implication | Rationale |
|-------------|-----------|
| **Client-side computation possible** | Small data set (single resort), no server needed for route logic |
| **Zone clustering algorithm** | Pre-compute or on-demand "safe zones" from graph + skill filter |
| **Fail-safe routing logic** | Never suggest path requiring terrain above threshold |
| **Path validation** | Every suggestion must verify return-path exists |

### 3. Frontend Architecture

| Implication | Rationale |
|-------------|-----------|
| **Mobile-first PWA** | Primary target; native later |
| **Map-centric UI** | Map is the primary interface, not lists |
| **Interactive map library needed** | Zoom, pan, tap lifts/runs, overlays (consider: Mapbox, Leaflet, or custom SVG) |
| **Large touch targets** | Glove-friendly, outdoor use |
| **High contrast theming** | Snow/bright conditions |
| **Offline-ready architecture** | Not MVP, but don't block it |

### 4. Performance Requirements

| Metric | Target | Implication |
|--------|--------|-------------|
| Map load | <3s on 4G | Optimize asset size, lazy load |
| Filtering | <500ms | Client-side filtering, no round-trip |
| Route suggestion | <1s | Graph traversal must be fast |
| Device target | 3-4 yr old phones | Test on low-end; avoid heavy frameworks |

### 5. Safety-Critical Logic

| Rule | Implementation |
|------|----------------|
| No routes above group threshold | Filter graph edges by difficulty before pathfinding |
| No trap zones | Validate return path exists before suggesting zone |
| Fail-safe default | If data incomplete → disable suggestions, show filter-only mode |
| "Uncertain → do not recommend" | Conservative fallback behavior |

---

## Build-Critical Requirements Summary

| Category | Must-Have |
|----------|-----------|
| **Core Features** | Group setup, skill assignment, resort map, difficulty filtering, safe zone highlighting, basic route suggestion |
| **Data** | Graph structure for 10-15 resorts (lifts, runs, connectivity) |
| **Safety Logic** | No above-threshold routes, no trap zones, fail-safe fallback |
| **Performance** | <3s load, <500ms interactions, works on mid-range mobile |
| **UI** | Map-first, large tap targets, high contrast, minimal text |
| **Platform** | Mobile web (iOS Safari, Android Chrome), responsive |

---

## Ambiguities / Needs Clarification

| # | Item | Question |
|---|------|----------|
| 1 | Current lift selection | How does user indicate "current lift" without GPS? Tap on map? Dropdown? |
| 2 | Safe zone display | Is this a visual overlay, a list panel, or both? |
| 3 | Confidence modifier | Excluded from MVP UI — also exclude from data model, or store for future? |
| 4 | Single-lift zones | Zone requires "2+ lift return options" — exclude single-lift zones entirely? |
| 5 | Trap zone definition | Is this any zone with no safe return path for lowest skill member? |
| 6 | "Stretch slightly" scope | Per-session toggle, or per-suggestion choice? |
| 7 | Off-piste classification | How to handle resorts that don't officially mark off-piste? |
| 8 | Incomplete data UX | Should UI explain *why* suggestions are unavailable when data is incomplete? |
| 9 | Launch timeline | Is there a target date? Affects scope decisions. |
| 10 | Test device baseline | Specific device for "3-4 year old phone" testing? (e.g., iPhone 11, Pixel 4) |
| 11 | Tap target size | Minimum spec? Apple HIG suggests 44pt. |
| 12 | Safety features & monetisation | "Must not hide safety-critical features" — does safe zone highlighting stay free forever? |
| 13 | Difficulty color mapping | Standard (green/blue/red/black) or regional variations (e.g., Japan uses different system)? |

---

*Extracted: 2025-02-12*
*Source: PRD Chunks 1-3*
