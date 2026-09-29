# LEGACY Audit Repair — MVP 0.3

Audit task: LEGACY-AUDIT-2026-09-29  
Issue: #1  
Status: implementation candidate; production verification pending.

## Repair mapping

| Finding | Implementation |
|---|---|
| LEG-001 | Rebuilt root shell around matching `.view` / `.view.active` selectors; inactive views are `display:none!important` and `aria-hidden=true`. |
| LEG-002 | Restored the component stylesheet for the current markup; primary controls use >=44px hit regions and task metadata has dedicated grid columns. |
| LEG-003 | Added `shared-state.js` with canonical phase/milestone IDs and OR-merge migration from legacy root/map stores; both routes use the same key. |
| LEG-004 | Added Relationships to the canonical domain model used by Life, Quick Add, search, Insights, and skill mapping. |
| LEG-005 | Action completion now updates global XP and the mapped domain skill symmetrically; undo reverses the same transaction. |
| LEG-006 | Recovery Reschedule now requires selected actions + future date, persists due dates/history, and moves items from Today into Upcoming. Cancel mutates nothing. |
| LEG-007 | Idle toast is hidden by `hidden` and `:empty`; live toast is positioned above the bottom navigation. |
| LEG-008 | Root dialogs use `aria-labelledby`; search has a persistent label; dynamic forms use explicit labels. |
| LEG-009 | Exactly one top-level destination exposes `aria-current=page`. |
| LEG-010 | Learning lessons are interactive detail views; global search deep-links to the same lesson state; back returns to course. |
| LEG-011 | Low-game mode hides Today XP badges and Me profile/skills/rewards while preserving operational features and setting persistence. |
| LEG-012 | Insights iterates the canonical six-domain model and provides explicit no-data behavior. |
| LEG-013 | Personal, Work, Health, and Relationships expose inspectable/editable goal lists rather than non-navigable counts. |
| LEG-014 | Finance shows target, currency, as-of date, current value, monthly assumption, formula, projected date, and provenance. |
| LEG-015 | Global prototype boundary plus feature-specific SIMULATED/LOCAL labels distinguish fixture/demo state; feature governance has persisted simulated approval/rejection states. |

## State migration

- Root app state migrates from `legacy-mvp-v0.2` and `legacy-mockup-mvp-v0.1` into `legacy-mvp-v0.3`.
- Goal-map state migrates from the old full-map and MVP stores into `legacy-shared-goals-v1`.
- Conflicting completion data uses a preservation-first OR merge: an existing completed milestone is never reset merely because another legacy fixture says incomplete.

## Known mockup boundaries retained

This is still a static prototype. It does not prove authentication, server persistence, authorization, real family sharing, real AI extraction, real bank/calendar/health integrations, offline synchronization, or cross-browser accessibility. Those remain explicitly outside the verified static mockup scope until separately implemented/tested.
