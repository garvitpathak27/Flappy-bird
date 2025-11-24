export const BOARD = {
  width: 360,
  height: 560
};

export const DEFAULT_DIFFICULTY = "balanced";

export const DIFFICULTY_PROFILES = {
  relaxed: {
    label: "Relaxed",
    gravity: 0.28,
    jumpImpulse: -6.2,
    pipeGap: 180,
    pipeInterval: 1500,
    pipeSpeed: 1.6,
    scoringModifier: 0.85
  },
  balanced: {
    label: "Balanced",
    gravity: 0.32,
    jumpImpulse: -6.4,
    pipeGap: 160,
    pipeInterval: 1350,
    pipeSpeed: 1.9,
    scoringModifier: 1
  },
  hardcore: {
    label: "Hardcore",
    gravity: 0.36,
    jumpImpulse: -6.8,
    pipeGap: 135,
    pipeInterval: 1100,
    pipeSpeed: 2.2,
    scoringModifier: 1.2
  }
};

export const PIPE_DIMENSIONS = {
  width: 74,
  height: 520
};

export const RENDERING = {
  skyGradient: ["#4d8df3", "#072044"],
  pipeColor: "#62d26f",
  pipeHighlight: "#9af0aa",
  birdFill: "#ffdc64",
  birdStroke: "#ff9e2c"
};

export const INPUT = {
  controlKey: "Space"
};
