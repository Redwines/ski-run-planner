# Product Requirements Document (PRD)

> Ski Run Planner

---

## 1. Product Overview

### Product Name (Working Title)

Ski Run Planner (working name – may change later)

### Product Type

Mobile-first web app (PWA initially), future native app possible.

### Core Idea

A ski resort run planning and group coordination app that helps families and mixed-ability groups:

- Decide where to ski each day
- Stay together more easily
- Discover suitable runs dynamically
- Avoid terrain mismatches
- Maximise ski time
- Reduce stress and arguments

The app acts like a smart on-mountain guide that suggests where to go next based on:

- Skill level
- Lift status
- Terrain type
- Crowd levels (future)
- Group composition
- Location

---

## 2. Problem Statement

Families and mixed-skill groups struggle with:

- Choosing the right resort area each day
- Knowing which lifts connect properly
- Avoiding terrain that is too difficult for beginners
- Avoiding boring terrain for advanced riders
- Getting separated accidentally
- Wasting time traversing incorrectly
- Misjudging run difficulty from maps
- Confusion around which lift to take next

Paper maps and resort apps:

- Are static
- Do not adapt to skill mix
- Do not optimise flow
- Do not account for group dynamics

There is no app that intelligently guides mixed groups in real-time across a ski resort.

---

## 3. Target Users

### Primary User Persona – "Family Planner Parent"

**Profile:**

- 35–50 years old
- Organising ski trips for family of 3–5
- Mixed ability levels
- Wants smooth days, minimal stress
- Values safety and efficiency

**Pain Points:**

- Arguments about which run to take
- Beginners overwhelmed
- Advanced riders bored
- Constant regrouping
- Uncertainty about terrain

**Goals:**

- Confident decisions
- Happy kids
- Efficient lift usage
- Smart daily planning

### Secondary User Persona – "Mixed Skill Group Organiser"

**Profile:**

- Adult ski trip with friends
- Snowboarders + skiers
- Different confidence levels

**Pain Points:**

- Some want steeps
- Some avoid blacks
- Hard to find overlap terrain

**Goal:**

- Find terrain zones suitable for everyone

---

## 4. Core Value Proposition

"For families and mixed-ability ski groups who want smoother days on the mountain, Ski Run Planner intelligently guides you to the best next lift and run based on your group's skill mix and real-time conditions — so everyone has a better day."

---

## 5. MVP Scope (Phase 1)

The MVP will:

**Allow user to:**

- Select a ski resort (initially limited list)
- Define group members
- Assign skill levels per person

**Display:**

- Resort map with lifts + runs
- Colour-coded difficulty
- Basic terrain type info

**Allow:**

- Marking preferred difficulty range
- Filtering zones by difficulty

**Provide:**

- Suggested "safe zones" where entire group can ski together
- Basic route suggestion from current lift to next suitable area

No real-time tracking in MVP.

No GPS live sharing in MVP.

No crowd data in MVP.

This is a planning and guidance app first — not a tracking app.

---

## 6. Non-Goals for MVP

The MVP will NOT include:

- Live GPS tracking of group members
- Real-time lift wait times
- Social features
- Messaging
- Offline caching (initially)
- Push notifications
- AI-generated coaching
- Weather prediction

Keep MVP tight and execution-focused.

---

## 7. Supported Resorts (Initial Launch)

Phase 1 launch target:

- 10–15 pre-mapped resorts
- Example region: Hakuba Valley (13 resorts)

Resort expansion will be manual and curated initially.

---

## 8. Feature Detail – Functional Requirements

### 8.1 Group Setup

#### FR-1: Create Group Session

User can:

- Create a ski day session
- Name the session (optional)
- Select resort
- Add group members

#### FR-2: Add Group Members

For each member:

- Name
- Ski or snowboard
- Skill level (Beginner / Low Intermediate / Intermediate / Advanced / Expert)
- Confidence modifier (optional future feature, not required in MVP UI)

Skill level definitions will be standardised internally and mapped to run colours.

#### FR-3: Skill Aggregation Logic

The system will determine:

- Minimum group level
- Maximum group level
- Overlapping safe terrain range

MVP logic:

- Default to recommending terrain suitable for the lowest skill level in the group.

Option to toggle:

- "Play it safe" (lowest skill level)
- "Stretch slightly" (one level above lowest, only if gap is ≤ 1 level)

No advanced algorithm yet — keep logic simple and transparent.

### 8.2 Resort Map View

#### FR-4: Interactive Resort Map

User can:

- Zoom
- Pan
- Tap lifts
- Tap runs

Each run must show:

- Name
- Difficulty colour
- Terrain type (groomed, moguls, tree, off-piste if applicable)
- Vertical drop (if data available)
- Connected lifts

#### FR-5: Difficulty Filtering

User can:

- Toggle difficulty levels on/off
- Highlight only recommended difficulty range
- Grey out runs above group threshold

#### FR-6: Safe Zone Highlighting

System identifies zones where:

- Multiple runs of safe difficulty exist
- At least 2 lift return options exist
- Terrain connects without mandatory difficult segments

Safe zones should:

- Be visually highlighted
- Be tappable to view details

### 8.3 Route Suggestion (MVP – Basic Version)

#### FR-7: Suggest Next Lift

When user selects current location (manually, not GPS):

- System suggests next lift to access suitable terrain.

Logic inputs:

- Current lift
- Group difficulty
- Available safe zones

Output:

- "Best Next Lift"
- "Why" explanation (e.g., "Accesses 5 intermediate runs suitable for your group")

No turn-by-turn directions in MVP.
Just directional guidance.

#### FR-8: Return Path Awareness

When suggesting a zone, system must confirm:

- There is a safe path back to base area or main lifts.
- Avoid "trap" zones.

---

## 9. User Flows (MVP)

### Flow 1: First-Time User

1. Open app
2. Select resort
3. Create group
4. Add members
5. View recommended safe zones
6. Tap into zone
7. View suggested lift to start day

### Flow 2: Mid-Day Decision

1. User opens map
2. Taps current lift
3. Taps "Suggest Next"
4. System shows best next lift
5. User follows suggestion

### Flow 3: Adjusting Difficulty

1. Open group settings
2. Adjust skill level for member
3. System recalculates safe range
4. Map updates highlighting

Recalculation must be near-instant.

---

## 10. Core System Behaviour Requirements

- Map must load under 3 seconds on normal mobile connection.
- Difficulty filtering must feel immediate (<500ms response).
- Zone recalculation must feel instant.
- UI must prioritise clarity over visual clutter.
- No complex animations required in MVP.

---

## 11. Data Requirements (High-Level)

For each resort:

We require structured data for:

- Lifts (ID, name, type, base elevation, top elevation)
- Runs (ID, name, difficulty, start lift, end lift, terrain type)
- Connectivity graph (which runs connect to which lifts)
- Base areas

Data must allow:

- Path analysis
- Zone clustering
- Difficulty filtering

Graph-based structure preferred.

---

## 12. Non-Functional Requirements

### 12.1 Performance

- Initial map load: under 3 seconds on standard 4G mobile connection.
- Interaction responsiveness (filtering, toggles, zone recalculation): under 500ms perceived delay.
- Route suggestion computation: under 1 second.
- Must remain smooth on mid-range mobile devices (3–4 year old smartphones).

### 12.2 Reliability

App must not suggest routes that:

- Require terrain above group threshold.
- Lead into non-returnable areas.

If data is incomplete for a resort:

- System must fallback to difficulty filtering only.
- No unsafe route suggestions allowed.

Fail-safe principle:
If uncertain → do not recommend.

### 12.3 Usability

- UI must be usable with gloves off in cold conditions.
- Large tap targets.
- Clear contrast for snow visibility (avoid low-contrast palettes).
- Minimal text-heavy screens.
- Map-first interface.

### 12.4 Device Support

MVP targets:

- Mobile browsers (iOS Safari, Android Chrome).
- Responsive layout for tablet.
- Desktop usable but not primary focus.

Native app (iOS/Android) considered future phase.

---

## 13. Data & Mapping Constraints

- Resort map data will initially be manually structured and curated.
- No automatic scraping in MVP.
- No dependency on resort APIs for launch.

Graph structure must allow future expansion to:

- Real-time lift status
- GPS integration
- Crowd estimation

Data architecture must be forward-compatible.

---

## 14. Security & Privacy

MVP:

- No live location tracking.
- No storing sensitive personal data beyond:
  - Group member first names
  - Skill levels
- No social sharing.

Future phases may introduce location sharing — architecture should not block this.

---

## 15. Success Metrics (Phase 1)

**Primary Metrics:**

- Users complete group setup.
- Users view at least one safe zone.
- Users trigger at least one "Suggest Next Lift."

**Secondary Metrics:**

- Session length > 5 minutes.
- Repeat usage during multi-day trips.

**Qualitative Success:**

- Users report reduced friction in group decision-making.
- Users feel more confident navigating resort.

---

## 16. Expansion Vision (Post-MVP)

Future phases may include:

**Phase 2:**

- GPS-based current position detection.
- Real-time group tracking.
- Lift status integration.
- Basic offline caching.

**Phase 3:**

- AI-driven dynamic flow optimisation.
- Crowd-aware routing.
- Gamified daily challenges.
- Resort coverage expansion globally.

**Phase 4:**

- Premium subscription tier.
- Advanced analytics (vertical tracked, zone usage).
- Family dashboard.

---

## 17. Monetisation Direction (Early Thinking)

Not required for MVP launch, but directionally:

**Possible models:**

- Freemium (limited resorts free).
- Per-resort unlock.
- Seasonal subscription.
- Family subscription tier.

**Monetisation must not:**

- Degrade core usability.
- Hide safety-critical features.

---

## 18. Constraints

- Small founding team (2 developers).
- Must be achievable within reasonable build timeline.
- Resort data population is manual initially.
- Keep MVP tight.
- Avoid over-engineering.

---

*Last Updated: 2025-02-12*
