# LEGACY Geek UX Work Packages — v0.4

Status: implemented candidate  
Scope: `legacy_mockups` only  
Visual reference board: `docs/references/geek-ui-reference-board.webp`

![Geek UI reference board](../references/geek-ui-reference-board.webp)

The board preserves the four approved reference screens from the design session. Each work package below must treat its assigned quadrant as the primary visual acceptance reference while keeping interactions functional and mobile-safe.

## Skills added

| Skill | Purpose | Verification |
|---|---|---|
| **SK-UI-09 — Game-Themed Productivity Interface** | Keep the product recognizably useful while using a retro/32-bit RPG visual grammar. | Compare hierarchy, contrast, legibility, density and action clarity against the reference board. |
| **SK-UX-09 — Spatial World Navigation** | Make the world map a true navigation surface rather than a decorative list. | Full-screen map supports drag, zoom, island selection and direct entry into island detail. |
| **SK-UX-10 — Goal Hierarchy Clarity** | Make long-, mid- and short-term goals understandable and directly actionable. | User can inspect hierarchy, expand tasks, register a task in context and see progress update. |
| **SK-BEH-06 — Focus Loop Design** | Connect Pomodoro focus, a growing forest, task progress and rewards. | Timer completion plants a tree and enables task progress. |
| **SK-STATE-02 — Shared Progression State** | Keep Home, World Map, Island and Focus views synchronized. | Task completion and focus progress survive navigation/reload and update island progress consistently. |
| **SK-ART-01 — 32-bit Art Direction** | Preserve a coherent dark-cinematic pixel/RPG visual language across functional UI. | Review against the visual board and test 390px/320px mobile layouts. |

## WORK-GEEK-001 — Geek Home / RPG HUD

**Reference:** top-left board panel — Home.

Implement the approved dark 32-bit dashboard: LEGACY HUD, next-best-action hero, player level/streak/XP, hydration, Focus Forest preview, World Map CTA, daily quest list, and six-item bottom navigation.

Acceptance:
- primary actions remain readable and tappable despite richer art direction;
- Home shows synchronized task, water, XP and focus state;
- World Map and Focus are one tap away;
- task registration is available from Home.

## WORK-GEEK-002 — Full-screen 32-bit World Map

**Reference:** top-right board panel — World Map.

Replace the previous card-based map experience with a full-screen spatial world:
- Foundation, Health, Career, Wealth and Legacy islands;
- drag/pan navigation;
- wheel/pinch zoom;
- island selection with completion state;
- bottom contextual card;
- Continue in Island CTA.

Acceptance:
- map occupies the screen when selected;
- user can navigate inside the map without page scrolling;
- selected island is visually obvious;
- island progress is derived from shared goal/task state;
- direct island entry works.

## WORK-GEEK-003 — Island Objectives / Goal Hierarchy

**Reference:** bottom-left board panel — Career Island.

Implement the island detail as the canonical goal/status/task workflow:
- long-term goals;
- mid-term goals;
- short-term goals;
- expandable goal tasks;
- completion percentages;
- island status summary;
- Register New Task;
- Add Task to This Goal;
- Overview, Notes and Resources tabs.

Acceptance:
- every task belongs to an island + horizon + goal;
- task completion updates goal/island status immediately;
- contextual registration preselects the goal;
- user can click a task to make it the current Focus task;
- state persists on reload.

## WORK-GEEK-004 — Pomodoro Focus Forest

**Reference:** bottom-right board panel — Focus.

Implement:
- Pomodoro 25 min;
- short break 5 min;
- long break 15 min;
- custom/deep work 50 min prototype;
- start/pause/reset;
- growing forest;
- trees planted;
- day streak;
- focus sessions today;
- current task and related subtasks;
- session history;
- Mark Progress gated by a completed focus session.

Acceptance:
- timer is functional, not decorative;
- focus completion adds one tree/session;
- a completed focus session can advance the selected task;
- task changes remain synchronized with the island view.

## WORK-GEEK-005 — Shared Quest State & Task Registration

Cross-cutting state package for the four screens.

Acceptance:
- shared `legacy-geek-v0.4` browser-local state;
- add task from Home or Island;
- current focus task can be selected from an Island;
- Home task state, Island progress, Map completion and Focus progress stay coherent;
- reload preserves state;
- no backend/security claims are implied by local persistence.

## Test suite

- **GEEK-FVT-001:** Home → World Map → Island → Focus → Home navigation.
- **GEEK-FVT-002:** Pan/zoom map and open all islands.
- **GEEK-FVT-003:** Register a short-term task from an island and verify persistence.
- **GEEK-FVT-004:** Register a task from Home and verify it appears under its selected goal.
- **GEEK-FVT-005:** Toggle a task; verify goal and island completion changes.
- **GEEK-FVT-006:** Select a task for focus; verify Focus page context.
- **GEEK-FVT-007:** Run QA-shortened focus session, grow tree, mark task progress.
- **GEEK-FVT-008:** Hydration add/remove and reload persistence.
- **GEEK-FVT-009:** 390px and 320px no-overflow smoke test.
- **GEEK-FVT-010:** Reduced-motion CSS smoke test and keyboard-focus visibility.
