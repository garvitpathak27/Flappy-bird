# Diagnostic Audit

## Legacy Assessment
- **Technology mismatch:** Original Java Swing implementation could not run inside Chrome, blocking web distribution.
- **Graphics jitter & collision bugs:** Timers produced uneven frame pacing and collision boxes used mismatched geometry, causing phantom hits.
- **Scoring limitations:** Simple `+0.5` increments lacked fairness, no penalties, and no extensibility hooks.
- **State management gaps:** Global mutable variables with no reset isolation caused edge-case crashes after restarts.
- **Missing UX polish:** No menu, no persistence, no settings, and inconsistent font rendering.

## Chrome Extension Requirements Gap
- **Manifest compliance:** No MV3 manifest, service worker, or CSP-safe modules.
- **Storage & telemetry:** No way to persist high scores across sessions.
- **Testing & packaging:** No automated validation or packaging workflow.
- **Documentation:** README lacked production deployment, architecture, and resume-ready summary.

## Remediation Summary
1. **Replatformed to Manifest V3** with popup UI, service worker, overlay content script, and icons.
2. **Rebuilt gameplay in Canvas/Web APIs** using deterministic physics and requestAnimationFrame.
3. **Implemented logic-based scoring engine** featuring weighted rules, streak bonuses, and penalties.
4. **Persisted telemetry via chrome.storage** and exposed overlay HUD + keyboard shortcut.
5. **Added automation**: npm toolchain, ESLint, Vitest coverage, and packaging script.
6. **Produced documentation set** (README, architecture, scoring rubric, audit) for portfolio use.
