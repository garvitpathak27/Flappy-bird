import { SCORING_WEIGHTS, clampScore, scoringRules } from "./rules.js";
import { clamp, rollingVariance } from "../utils/math.js";

export class ScoreEngine {
  constructor({ windowSize = 60, difficultyModifier = 1 } = {}) {
    this.windowSize = windowSize;
    this.difficultyModifier = difficultyModifier;
    this.reset();
  }

  reset() {
    this.total = 0;
    this.breakdown = {
      traversal: 0,
      stability: 0,
      precision: 0,
      streak: 0,
      risk: 0,
      penalties: 0
    };
    this.streak = 0;
    this.altitudeSamples = [];
    this.lastPrecision = 0;
    this.lastVelocityFactor = 0;
    this.lastGapSize = 0;
    this.lastBirdSize = 0;
  }

  handle(event) {
    switch (event.type) {
      case "tick":
        this.trackAltitude(event.payload.altitudeRatio);
        this.lastVelocityFactor = clamp(event.payload.velocity || 0, -8, 8) / 8;
        break;
      case "pipe:approach":
        this.lastPrecision = this.computePrecisionIndex(event.payload.entryOffset);
        this.lastGapSize = event.payload.gapSize;
        this.lastBirdSize = event.payload.birdSize;
        break;
      case "pipe:cleared":
        this.streak += 1;
        this.addScore("traversal", scoringRules.traversal({
          velocityFactor: Math.abs(this.lastVelocityFactor),
          difficultyModifier: this.difficultyModifier
        }));
        this.addScore("stability", scoringRules.stability({ stabilityIndex: this.computeStabilityIndex() }));
        this.addScore("precision", scoringRules.precision({ precisionIndex: this.lastPrecision }));
        this.addScore("streak", scoringRules.streak({ streak: this.streak }));
        this.addScore("risk", scoringRules.risk({ gapSize: this.lastGapSize, birdSize: this.lastBirdSize }));
        break;
      case "collision":
        this.penalize("collision");
        this.streak = 0;
        break;
      case "boundary:hit":
        this.penalize("boundary");
        this.streak = 0;
        break;
      case "idle:warn":
        this.penalize("idle");
        break;
      case "reset":
        this.reset();
        break;
      default:
        break;
    }
    return this.getSummary();
  }

  addScore(key, contribution) {
    const weighted = contribution * SCORING_WEIGHTS[key];
    this.breakdown[key] += weighted;
    this.total = clampScore(this.total + weighted);
  }

  penalize(type) {
    const penalty = scoringRules.penalties({ type }) * Math.abs(SCORING_WEIGHTS.penalties);
    this.breakdown.penalties += penalty;
    this.total = clampScore(Math.max(0, this.total - penalty));
  }

  trackAltitude(ratio) {
    this.altitudeSamples.push(ratio);
    if (this.altitudeSamples.length > this.windowSize) {
      this.altitudeSamples.shift();
    }
  }

  computeStabilityIndex() {
    if (!this.altitudeSamples.length) return 0;
    const variance = rollingVariance(this.altitudeSamples);
    return clamp(1 - variance * 12, 0, 1);
  }

  computePrecisionIndex(offset) {
    if (typeof offset !== "number") return 0;
    return clamp(1 - Math.abs(offset));
  }

  getSummary() {
    return {
      total: Math.round(this.total),
      breakdown: Object.fromEntries(
        Object.entries(this.breakdown).map(([key, value]) => [key, Math.round(value)])
      ),
      streak: this.streak,
      stability: Math.round(this.computeStabilityIndex() * 100),
      precision: Math.round(this.lastPrecision * 100)
    };
  }
}
