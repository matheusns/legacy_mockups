# LEGACY Mockup Skill & Version Test Plan

Status: active mockup plan  
Baseline reference: `LEGACY-REF-UX-001` from the main LEGACY repository  
Scope: mockups only; no production-domain baseline decisions are implied.

## Skills to test

| Skill | What the mockup must exercise | Evidence |
|---|---|---|
| SK-UX-01 Information Architecture | Today / Map / Life / Insights / Me; one-tap top-level navigation; module context | navigation E2E |
| SK-UX-02 Interaction Design | dominant primary action, undo, recovery, empty/populated states, module quick actions | task/habit/recovery flows |
| SK-UX-03 Design System | shared cards, spacing, typography, buttons, states, responsive shell | visual regression |
| SK-UX-04 Gamification Economy | XP, coins, skills, rewards, map progression derived from real actions | progression simulation |
| SK-UX-05 Behavioral Design | small steps, low-friction logging, soft failure, recovery after miss | missed-day scenario |
| SK-UX-06 Accessibility | >=44px critical targets, contrast, semantics, reduced motion, tap-only map path | browser audit |
| SK-UX-07 Data Visualization | 7-day rhythm, progress bars, continuity and administration-time indicators | insight review |
| SK-UX-08 Motion & Microinteraction | completion toast, selected states, progress feedback, reduced-motion equivalent | visual + reduced motion |
| SK-QA-01 Browser E2E & Visual Regression | critical paths, persistence, responsive layout, reload behavior | automated browser suite |
| SK-PROD-01 Product Analytics & Experiments | friction hypotheses and metrics visible in prototype | version comparison |
| SK-AI-01 AI Requirement Capture | feature text -> structured proposal -> explicit approval boundary | governance scenario |
| SK-SEC-01 Privacy & Multi-user Isolation | private-by-default workspace controls and future family boundary | UI/privacy review |

## Versioned experiment plan

### MVP 0.1 — Coherent core (current)
Goal: validate whether all major product areas feel like one system.

Includes:
- Today: tasks, habits, calendar context, recovery flow, undo.
- Map: integrated phase navigation plus deep thematic world-map route.
- Life: Personal, Work, Health, Finance, Learning module prototypes.
- Insights: continuity, weekly XP, admin-time indicator, 7-day rhythm and review insight.
- Me: XP, coins, skill meters, reward unlock, private-first settings, AI feature proposal.
- Persistent five-destination shell.
- Browser-local persistence.

Primary questions:
1. Is the five-tab shell obvious on a phone?
2. Can the daily loop be operated faster than maintaining it?
3. Does Map feel motivational without contaminating operational screens?
4. Does Life feel coherent rather than five unrelated mini-apps?
5. Are XP/rewards useful feedback or distracting?
6. Is recovery after a missed day understandable?
7. Does the AI proposal workflow clearly stop before approval?

### MVP 0.2 — Friction & recovery
Apply user feedback from 0.1.
Test:
- single-tap completion rate,
- undo discoverability,
- inactive-day recovery choices,
- empty/error/disabled states,
- whether Today needs calendar + tasks together,
- whether module quick actions are enough.

### MVP 0.3 — Game-depth experiment
A/B conceptual variants:
- A: restrained game layer (current thesis),
- B: deeper RPG economy with quests/rewards,
- C: neutral/minimal mode.
Measure preference, comprehension, and perceived administration overhead.

### MVP 0.4 — Automation & integration simulation
Prototype provenance-based auto-completion:
- Calendar event completion,
- health signal ingestion,
- course activity completion,
- duplicate-event protection.
No real external account integration required at mockup stage.

### MVP 0.5 — Multi-user + governance
Prototype:
- family workspace,
- per-goal sharing,
- permission-denied states,
- admin review of AI-generated feature proposals,
- beta approval workflow.

## Acceptance suite for MVP 0.1

1. Navigate all five top-level destinations in one tap each.
2. Add, complete, undo, and delete a task.
3. Complete/log all three habit types and verify XP changes exactly once per meaningful action.
4. Simulate missed day and choose a recovery action without deleting history.
5. Select every map phase and open the full world map.
6. Open every Life module and execute its quick action.
7. Verify Finance and Learning state changes persist after reload.
8. Verify Insights update weekly XP after actions.
9. Spend coins on a reward and verify balance.
10. Generate an AI feature proposal and verify it remains explicitly unapproved.
11. Reload and verify active top-level destination + state persistence.
12. Check critical touch targets >=44 px and reduced-motion support.
13. Confirm rich pixel theme remains confined to Map/reward moments.
14. Verify no horizontal clipping at common phone widths.

## Feedback gate

MVP 0.1 becomes a frozen mockup snapshot after the first E2E run. No main LEGACY requirements are changed from mockup feedback until the user explicitly promotes a finding/use case.
