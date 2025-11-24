# Flappy Logic Arcade – Manifest V3 Chrome Extension

## Executive Summary
Flappy Logic Arcade is a production-ready Chrome extension that reimagines the classic Flappy Bird gameplay with a modern UI, deterministic Canvas engine, and a transparent logic-based scoring rubric. The project includes a background service worker, content overlay, and a feature-rich popup experience that runs entirely offline. Documentation, automation, and tests make it portfolio-ready for architecture, systems analysis, and Chrome extension development roles.

## Diagnostic Audit Highlights
A full audit of the legacy Swing project exposed structural, architectural, and UX flaws (collision bugs, no persistence, desktop-only deployment). See `docs/AUDIT.md` for the complete findings and remediation log. Key fixes include:
- Migration to Manifest V3 with service worker + content script separation.
- Rewritten physics/gameplay loop using requestAnimationFrame.
- Advanced scoring engine with penalties, streak bonuses, and deterministic outputs.
- Storage-backed leaderboards, overlay HUD, and keyboard shortcuts.
- Tooling upgrades: npm toolchain, ESLint, Vitest, and packaging script.

## Architecture Overview
- **Popup UI (`extension/popup`)** – Responsive layout with canvas game, live metrics, leaderboard, and difficulty controls.
- **Game Engine (`extension/js/game`)** – ES-module canvas engine with deterministic physics, modular entities, and event hooks.
- **Scoring Engine (`extension/js/scoring`)** – Weighted rubric with rule modules, penalties, and reporting helpers.
- **Storage + Background (`extension/background.js`, `extension/js/storage`)** – chrome.storage orchestration, command handler, and broadcaster.
- **Content Overlay (`extension/content`)** – HUD injected into webpages, synced via runtime messages/commands.
- **Automation (`package.json`, `scripts/package.mjs`, `tests/`)** – ESLint, Vitest coverage, and ZIP packaging.
Detailed diagrams and flow descriptions live in `docs/ARCHITECTURE.md`.

## Logic-Based Scoring System
Scoring rules are mathematically defined in `docs/SCORING.md` and implemented in `extension/js/scoring`. Highlights:
- Weighted rule set (Traversal 40%, Stability 15%, Precision 15%, Streak 20%, Risk 5%, Penalties -15%).
- Normalized formulas with clear bounds, deterministic results, and extensibility via new rule modules.
- Penalty coverage for collisions, boundary scrapes, and idle exploits.
- Vitest coverage (`tests/scoreEngine.test.js`) to guard against regressions.

## Feature Set
- Modern UI with gradient theming, keyboard controls, and difficulty presets (Relaxed/Balanced/Hardcore).
- Persistent leaderboard with overlay HUD toggle (Ctrl + Shift + F) and service worker sync.
- RequestAnimationFrame game loop, deterministic physics, and smooth pipe generation.
- Production-ready Manifest V3 config, icons, and options UI reuse.
- Automated packaging to `dist/flappy-logic-extension.zip` for direct Chrome sideloading.

## Directory Structure
```
extension/
	manifest.json
	background.js
	popup/
	content/
	js/
		game/
		scoring/
		storage/
		utils/
	styles/
	icons/
docs/
	ARCHITECTURE.md
	AUDIT.md
	SCORING.md
scripts/package.mjs
tests/scoreEngine.test.js
```

## Installation & Setup
```bash
git clone <repo>
cd Flappy-bird
npm install
npm test               # run Vitest suite
npm run lint           # optional ESLint pass
npm run build          # produces dist/flappy-logic-extension.zip
```

## Loading the Extension in Chrome
1. Run `npm run build` to generate the distributable (or use `extension/` directly).
2. Navigate to `chrome://extensions`, enable **Developer mode**.
3. Choose **Load unpacked** and select the `extension/` directory (for live dev) or unzip `dist/flappy-logic-extension.zip` and load the extracted folder for release testing.
4. Pin the action icon to test popup gameplay, keyboard controls, and overlay toggle.

## Testing & Quality Gates
- **Unit Tests:** `npm test` exercises the scoring engine (happy path + penalties + precision differentials).
- **Linting:** `npm run lint` enforces ESLint recommendations for browser + webextension contexts.
- **Packaging:** `npm run build` zips the extension for deployment and ensures no missing assets.

## Deployment & Versioning
- Semantic versioning via `package.json`.
- Release workflow:
	1. `npm version <patch|minor|major>`
	2. `npm test && npm run lint`
	3. `npm run build` to refresh `dist/flappy-logic-extension.zip`
	4. Upload ZIP to Chrome Extensions Manager for review/sideloading.

## Future Enhancements
- Hook remote telemetry/webhooks for multiplayer leaderboards.
- Add accessibility settings (rebind controls, colorblind palettes).
- Introduce achievements + seasonal challenges via background alarms.
- Expand unit tests to cover game physics with headless canvas mocks.

## Skills & Technologies Demonstrated
- Chrome Manifest V3, background service workers, content scripts.
- HTML5 Canvas game architecture, deterministic physics, and event-driven scoring.
- Logic design & mathematical weighting systems.
- Modern frontend tooling: ES modules, ESLint, Vitest, npm packaging.
- Documentation & systems analysis (audit, architecture, scoring specs).

## References
- `docs/ARCHITECTURE.md` – System architecture, modules, and data flow.
- `docs/SCORING.md` – Scoring formulas, weights, and examples.
- `docs/AUDIT.md` – Diagnostic findings and remediation log.

Enjoy building, playing, and showcasing Flappy Logic Arcade!
