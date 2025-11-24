import { clamp } from "../utils/math.js";

export const SCORING_WEIGHTS = {
  traversal: 0.4,
  stability: 0.15,
  precision: 0.15,
  streak: 0.2,
  risk: 0.05,
  penalties: -0.15
};

const MAX_BASE = 150;

export const scoringRules = {
  traversal: ({ velocityFactor = 0, difficultyModifier = 1 }) => {
    const base = 90 + velocityFactor * 60;
    return base * difficultyModifier;
  },
  stability: ({ stabilityIndex = 0 }) => 70 * stabilityIndex,
  precision: ({ precisionIndex = 0 }) => 80 * precisionIndex,
  streak: ({ streak = 0 }) => 40 * Math.log2(Math.max(streak, 1) + 1),
  risk: ({ gapSize, birdSize }) => {
    if (!gapSize || !birdSize) return 0;
    const clearance = clamp((gapSize - birdSize * 2) / gapSize);
    return (1 - clearance) * 60;
  },
  penalties: ({ type }) => {
    switch (type) {
      case "collision":
        return MAX_BASE * 1.2;
      case "boundary":
        return MAX_BASE * 0.65;
      case "idle":
        return MAX_BASE * 0.35;
      default:
        return MAX_BASE * 0.1;
    }
  }
};

export const clampScore = (value) => clamp(value, 0, 99999);
