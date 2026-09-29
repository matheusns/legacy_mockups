# LEGACY Mockup Skill & Version Test Plan

Status: active mockup plan  
Current candidate: **MVP 0.2 — Integrated coherent core**  
Baseline reference: `LEGACY-REF-UX-001` from the main LEGACY repository  
Scope: mockups only; no production-domain baseline decisions are implied.

## Skills to test

| Skill | What the mockup exercises | Acceptance evidence |
|---|---|---|
| SK-UX-01 Information Architecture | Today / Map / Life / Insights / Me; deep links and preserved context | one-tap navigation + state persistence |
| SK-UX-02 Interaction Design | primary actions, completion/undo, quick add, dialogs, recovery choices | browser critical-flow run |
| SK-UX-03 Design System | shared cards, spacing, typography, action hierarchy, responsive shell | visual regression + consistency review |
| SK-UX-04 Gamification Economy | XP, skills, coins, rewards, map milestones | progression simulation; core actions remain ungated |
| SK-UX-05 Behavioral Design | continuity, recovery, small steps, nonpunitive missed-day handling | recovery scenario |
| SK-UX-06 Accessibility | target sizing, semantics, contrast, non-color states, reduced motion | mobile accessibility smoke test |
| SK-UX-07 Data Visualization | completion ring, domain bars, financial projection | glanceability/readability test |
| SK-UX-08 Motion & Microinteraction | toast feedback, selected states, progress updates | visual test + reduced-motion check |
| SK-QA-01 Browser E2E & Visual Regression | navigation, persistence, critical flows, mobile layout | automated production run |
| SK-PROD-01 Product Analytics & Experiments | completion/admin-friction hypotheses | version comparison criteria |
| SK-AI-01 AI Requirement Capture | text request → structured draft → human approval boundary | governance flow |
| SK-SEC-01 Privacy & Multi-user Isolation | private-first workspace/family concept | privacy comprehension test |

## MVP 0.2 scope

The root mockup intentionally covers a broad first coherent slice instead of optimizing Map in isolation:

- **Today:** next-best action, tasks/habits, one-tap completion/undo, quick add, hydration, continuity, calendar context, missed-day recovery.
- **Map:** phase/milestone progression plus deep link to the full themed 8-bit world map.
- **Life:** Personal, Work, Health, Finance, Learning, Relationships module hub using the same interaction grammar.
- **Finance:** assumptions + simple goal projection.
- **Learning:** course/lesson representation and AI-assisted import that requires review.
- **Insights:** weekly completion and domain progress signals.
- **Me:** global XP, domain skills, optional coin/reward loop, low-gamification mode, workspace/family concept, AI feature request draft.
- **Global:** search across actions, phases, modules, and lessons; local browser persistence.

## Versioned experiments

### 0.3A — Productivity-first / low-game
Reduce decorative game treatment while keeping all flows identical. Test speed, clarity, cognitive load, and whether motivation drops.

### 0.3B — Game-rich progression
Increase richness only on Map and Me: quests, stronger unlock feedback, thematic rewards. Keep Today and Life restrained. Test motivation versus distraction.

### 0.4 — Recovery & planning
Deepen routines, reschedule/skip semantics, weekly quests, missed-day handling, and next-best-action explanation.

### 0.5 — Multi-user + AI governance
Add two mock identities, family goal sharing, permission-denied states, admin approve/reject, and beta status for AI-generated feature proposals.

## MVP 0.2 acceptance suite

1. **MVP-FVT-001 — Daily execution:** complete an action; XP changes once; tap again to undo.
2. **MVP-FVT-002 — Shell navigation:** all five top-level destinations reachable in one tap.
3. **MVP-FVT-003 — Navigation persistence:** selected tab/module/phase survives reload.
4. **MVP-FVT-004 — Quick add:** create a task/habit with domain context and see it in Today/search.
5. **MVP-FVT-005 — Hydration:** increment/decrement and preserve state.
6. **MVP-FVT-006 — Recovery:** resume/reschedule/skip without destructive reset.
7. **MVP-FVT-007 — Map:** select all phases, update milestone, open full map.
8. **MVP-FVT-008 — Life modules:** open all six modules without switching interaction grammar.
9. **MVP-FVT-009 — Finance:** change user-entered assumption and see projection update.
10. **MVP-FVT-010 — Learning:** simulated import cannot become authoritative until explicit acceptance.
11. **MVP-FVT-011 — Insights:** completion changes are reflected in summary.
12. **MVP-FVT-012 — Economy:** reward redemption changes coins but never gates core actions.
13. **MVP-FVT-013 — Low-game mode:** removes decorative game emphasis without removing functionality.
14. **MVP-FVT-014 — Search:** query action, phase, module and lesson; result navigates to correct context.
15. **MVP-FVT-015 — AI governance:** generated feature remains Draft and explicitly states human approval is required.
16. **MVP-FVT-016 — Privacy:** workspace/family UI communicates Private by default and explicit sharing.
17. **MVP-FVT-017 — Accessibility:** critical mobile controls, contrast, labels and reduced-motion behavior pass smoke audit.
18. **MVP-FVT-018 — Reload persistence:** tasks, water, XP, phase/module selection and low-game setting persist.

## Feedback gate

After MVP 0.2 is deployed and the acceptance suite has been run, freeze its snapshot and request user feedback. Do not choose 0.3A, 0.3B, or a hybrid until that feedback is received.
