# LEGACY Mockups

Disposable, low-fidelity prototypes used to validate workflows before they enter the main LEGACY product backlog or architecture.

## Current mockup: Daily Todo + Water Tracker

The root page is a mobile-first interactive wireframe for testing two basic flows:

- Daily todo: add, complete, and delete tasks.
- Water tracking: add/remove 250 ml glasses and reset the daily counter.

The prototype is intentionally dependency-free. Data is stored only in the browser with `localStorage`.

## Scope boundary

This repository is **not** the main LEGACY application and should not be treated as production implementation. Findings from these mockups are inputs for future feedback, discovery, and new use cases only.

## Run locally

Open `index.html` directly, or serve the folder with any static HTTP server.

For example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Phone workflow to test

1. Add a todo.
2. Complete it.
3. Delete a task.
4. Add a few 250 ml water entries.
5. Remove one entry.
6. Reload the page and confirm state persists.
7. Reset the hydration counter.
8. Use the top-right reset control to restore the mockup state.

Record friction, missing actions, terminology issues, and any new use cases before promoting anything into the main project.


## Goals Map wireframe

Open `goals-map.html` to test the 8-bit world-map navigation concept.

The mockup contains five goal phases:

- Foundation
- Health
- Career
- Wealth
- Legacy

Phone UX workflow:

1. Tap each island and verify the selected phase card updates.
2. Tap milestone nodes and verify progress changes.
3. Open a phase with the arrow button and toggle milestones from the detail dialog.
4. Reload the page and verify map progress persists.
5. Reset the map using the top-right reset button.
6. Use the home control to return to the Today mockup.

The page also exposes a read-only `window.__LEGACY_MOCKUP_DEBUG__` object to make browser-side QA and DOM inspection easier.
