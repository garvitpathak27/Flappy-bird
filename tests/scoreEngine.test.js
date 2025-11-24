import { describe, expect, it } from "vitest";
import { ScoreEngine } from "../extension/js/scoring/logic.js";

const tick = (engine, altitudeRatio, velocity = 0) =>
  engine.handle({ type: "tick", payload: { altitudeRatio, velocity } });

const clearPipe = (engine, { entryOffset = 0, gapSize = 160, birdSize = 36 } = {}) => {
  engine.handle({ type: "pipe:approach", payload: { entryOffset, gapSize, birdSize } });
  return engine.handle({ type: "pipe:cleared" });
};

describe("ScoreEngine", () => {
  it("awards traversal points when clearing pipes", () => {
    const engine = new ScoreEngine();
    tick(engine, 0.5, 2);
    const summary = clearPipe(engine, {});
    expect(summary.total).toBeGreaterThan(0);
    expect(summary.breakdown.traversal).toBeGreaterThan(0);
  });

  it("applies streak bonus for consecutive clears", () => {
    const engine = new ScoreEngine();
    tick(engine, 0.5, 2);
    clearPipe(engine, {});
    const summary = clearPipe(engine, {});
    expect(summary.streak).toBe(2);
    expect(summary.breakdown.streak).toBeGreaterThan(0);
  });

  it("reduces score on collision penalties", () => {
    const engine = new ScoreEngine();
    tick(engine, 0.5, 2);
    const before = clearPipe(engine, {}).total;
    engine.handle({ type: "collision" });
    const after = engine.getSummary().total;
    expect(after).toBeLessThanOrEqual(before);
  });

  it("rewards precision when entry offset is low", () => {
    const centeredEngine = new ScoreEngine();
    tick(centeredEngine, 0.5, 2);
    const centered = clearPipe(centeredEngine, { entryOffset: 0 });

    const offCenterEngine = new ScoreEngine();
    tick(offCenterEngine, 0.5, 2);
    const offCenter = clearPipe(offCenterEngine, { entryOffset: 0.8 });

    expect(centered.breakdown.precision).toBeGreaterThan(offCenter.breakdown.precision);
  });
});
