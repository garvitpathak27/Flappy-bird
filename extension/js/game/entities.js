import { BOARD, PIPE_DIMENSIONS } from "./config.js";

export class Bird {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = BOARD.width * 0.25;
    this.y = BOARD.height * 0.5;
    this.velocity = 0;
    this.radius = 18;
  }
}

export class PipePair {
  constructor(gapY, gapSize) {
    this.x = BOARD.width + PIPE_DIMENSIONS.width;
    this.width = PIPE_DIMENSIONS.width;
    this.gapY = gapY;
    this.gapSize = gapSize;
    this.markedForRemoval = false;
    this.counted = false;
  }

  get topHeight() {
    return this.gapY - this.gapSize / 2;
  }

  get bottomY() {
    return this.gapY + this.gapSize / 2;
  }
}
