# Chrome Extension Architecture

## Overview
The legacy Swing-based Flappy Bird clone is being reimagined as a Manifest V3 Chrome extension. The extension ships as a single loadable package that exposes three user touchpoints:

1. **Action Popup** – Hosts the playable WebGL/canvas game, score telemetry, and configuration controls.
2. **Context Overlay** – A content script that can project the high-score HUD onto any active tab when toggled.
3. **Background Service Worker** – Orchestrates storage, commands, alarms, and inter-script messaging.

The new system is built with modern ES modules, requestAnimationFrame-driven rendering, deterministic physics, and a configurable logic-based scoring engine.

## Module Breakdown

| Layer | Files | Responsibilities |
| --- | --- | --- |
| **UI Shell** | `extension/popup.html`, `popup.js`, `popup.css` | Render responsive layout, expose controls (play, pause, reset, difficulty, overlay toggle), hook into canvas engine, and display live scoring metrics. |
| **Game Engine** | `extension/js/game/config.js`, `engine.js`, `entities.js`, `input.js` | Maintain deterministic update loop, spawn pipes, animate bird physics, detect collisions, and emit discrete gameplay events consumed by the scoring engine. |
| **Logic-Based Scoring** | `extension/js/scoring/logic.js`, `rules.js` | Apply weighted scoring rubric (progress, streaks, stability, risk, penalties) and expose deterministic API for tests and instrumentation. |
| **Persistence + Telemetry** | `extension/js/storage/repository.js`, `background.js` | Sync scores to `chrome.storage`, broadcast updates, enforce retention policy, schedule automatic backups via alarms. |
| **Content Overlay** | `extension/content/overlay.js`, `overlay.css` | Inject lightweight HUD into web pages, mirror latest score summaries, and support dismissal from keyboard or messages. |
| **Automation + Quality** | `package.json`, `vitest.config.mjs`, `tests/scoreEngine.test.js`, `scripts/build.js` | Provide linting, unit tests, and packaging automation that zips the extension for distribution. |

## Data Flow
1. Popup bootstraps `GameEngine`, wiring `ScoreEngine` and `StorageRepository`.
2. Game loop emits lifecycle events (`tick`, `pipe:passed`, `bird:flap`, `bird:collision`).
3. `ScoreEngine` consumes events, calculates weighted contribution, and produces a normalized score packet.
4. Popup renders metrics; background worker persists seasonal bests and notifies content overlay via `chrome.runtime.sendMessage`.
5. Overlay receives push updates and refreshes HUD without accessing gameplay canvas (keeps content permissions minimal).

## Scoring System
Scoring is defined declaratively in `js/scoring/rules.js` and enforced by `ScoreEngine`. Each rule outputs a normalized contribution that is multiplied by a configurable weight. The default rubric ships with:

- **Traversal Credit (40%)** – Awarded when the player clears a pipe pair (base + velocity bonus).
- **Altitude Stability (15%)** – Rewards maintaining altitude near the midline with low variance.
- **Precision Entry (15%)** – Computes how centered the bird is when entering the gap.
- **Streak Bonus (20%)** – Exponential reward for consecutive successful passes without collision or wall contact.
- **Risk Factor (5%)** – Incentivizes threading narrow clearances by factoring the gap size vs. bird hitbox.
- **Safety Penalties (-15%)** – Deducts points for collisions, floor/ceiling bounces, or prolonged idling.

The engine guarantees:
- Deterministic results for identical event streams.
- Extensibility through new rule modules (each rule exports `id`, `weight`, `evaluate(event, window))`.
- Bounded outputs (scores stay within configurable min/max range).
- Traceability via debug snapshots stored alongside each persistence action.

## Extensibility Points
- **Custom Difficulty Profiles** – `config.js` exposes JSON-driven difficulty presets that modulate gravity, pipe speed, and scoring weights.
- **Telemetry Hooks** – `background.js` can forward score summaries to a remote API once a webhook URL is configured.
- **Theming** – Popup CSS variables allow re-skinning without touching JS.

## Security & Performance Considerations
- Runs entirely client-side; no remote code execution.
- Content script uses strict CSP-safe inline module import.
- Asset loading is async and deferred until popup becomes visible to minimize idle resource usage.
- Canvas is capped at 60 FPS and auto-throttles when the tab is occluded via the Page Visibility API.
