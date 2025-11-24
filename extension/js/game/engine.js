import { BOARD, DEFAULT_DIFFICULTY, DIFFICULTY_PROFILES, PIPE_DIMENSIONS } from "./config.js";
import { Bird, PipePair } from "./entities.js";
import { ScoreEngine } from "../scoring/logic.js";
import { clamp } from "../utils/math.js";

export class GameEngine {
  constructor(canvas, { difficultyKey = DEFAULT_DIFFICULTY, hooks = {} } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.hooks = hooks;
    this.setDifficulty(difficultyKey);
    this.scoreEngine = new ScoreEngine({ difficultyModifier: this.difficulty.scoringModifier });
    this.reset();
    this.loop = this.loop.bind(this);
    this.running = false;
    this.lastFrame = 0;
    this.spawnAccumulator = 0;
    this.idleAccumulator = 0;
  }

  setDifficulty(key) {
    this.difficulty = DIFFICULTY_PROFILES[key] || DIFFICULTY_PROFILES[DEFAULT_DIFFICULTY];
    if (this.scoreEngine) {
      this.scoreEngine.difficultyModifier = this.difficulty.scoringModifier;
    }
  }

  updateDifficulty(key) {
    const wasRunning = this.running;
    this.pause();
    this.setDifficulty(key);
    this.reset();
    if (wasRunning) this.start();
  }

  reset() {
    this.bird = new Bird();
    this.pipes = [];
    this.scoreEngine?.handle({ type: "reset" });
    this.spawnAccumulator = 0;
    this.idleAccumulator = 0;
    this.running = false;
    this.emitScore();
    this.render();
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastFrame = performance.now();
    requestAnimationFrame(this.loop);
  }

  pause() {
    this.running = false;
  }

  toggle() {
    this.running ? this.pause() : this.start();
  }

  flap() {
    this.bird.velocity = this.difficulty.jumpImpulse;
  }

  loop(timestamp) {
    if (!this.running) return;
    const delta = timestamp - this.lastFrame;
    this.lastFrame = timestamp;
    this.update(delta);
    this.render();
    requestAnimationFrame(this.loop);
  }

  update(delta) {
    this.spawnAccumulator += delta;
    if (this.spawnAccumulator >= this.difficulty.pipeInterval) {
      this.spawnPipe();
      this.spawnAccumulator = 0;
    }

    this.bird.velocity += this.difficulty.gravity;
    this.bird.y += this.bird.velocity * 2.5;

    if (Math.abs(this.bird.velocity) < 0.15) {
      this.idleAccumulator += delta;
      if (this.idleAccumulator > 2500) {
        this.scoreEngine.handle({ type: "idle:warn" });
        this.idleAccumulator = 0;
      }
    } else {
      this.idleAccumulator = 0;
    }

    if (this.bird.y < 0) {
      this.bird.y = 0;
      this.bird.velocity = 0;
      this.scoreEngine.handle({ type: "boundary:hit" });
    }

    if (this.bird.y + this.bird.radius > BOARD.height) {
      this.bird.y = BOARD.height - this.bird.radius;
      this.bird.velocity = 0;
      this.scoreEngine.handle({ type: "boundary:hit" });
    }

    this.pipes.forEach((pipe) => {
      pipe.x -= this.difficulty.pipeSpeed * 4;
      if (pipe.x + PIPE_DIMENSIONS.width < 0) pipe.markedForRemoval = true;

      const birdMid = this.bird.x;
      if (!pipe.counted && pipe.x + pipe.width < birdMid) {
        pipe.counted = true;
        this.scoreEngine.handle({ type: "pipe:cleared" });
        this.emitScore();
      }

      const gapCenter = pipe.gapY;
      const entryOffset = clamp((this.bird.y - gapCenter) / (pipe.gapSize / 2), -1, 1);
      if (pipe.x < birdMid + this.bird.radius && pipe.x + pipe.width > birdMid - this.bird.radius) {
        this.scoreEngine.handle({
          type: "pipe:approach",
          payload: { entryOffset, gapSize: pipe.gapSize, birdSize: this.bird.radius * 2 }
        });
        if (this.collidesWithPipe(pipe)) {
          this.handleGameOver();
        }
      }
    });

    this.pipes = this.pipes.filter((pipe) => !pipe.markedForRemoval);

    this.scoreEngine.handle({
      type: "tick",
      payload: { altitudeRatio: this.bird.y / BOARD.height, velocity: this.bird.velocity }
    });
    this.emitScore();
  }

  spawnPipe() {
    const gapSize = this.difficulty.pipeGap;
    const minGap = gapSize / 2 + 30;
    const maxGap = BOARD.height - gapSize / 2 - 30;
    const gapY = Math.random() * (maxGap - minGap) + minGap;
    this.pipes.push(new PipePair(gapY, gapSize));
  }

  collidesWithPipe(pipe) {
    const birdTop = this.bird.y - this.bird.radius;
    const birdBottom = this.bird.y + this.bird.radius;
    const birdLeft = this.bird.x - this.bird.radius;
    const birdRight = this.bird.x + this.bird.radius;

    const inX = birdRight > pipe.x && birdLeft < pipe.x + pipe.width;
    const hitsTop = birdTop < pipe.topHeight;
    const hitsBottom = birdBottom > pipe.bottomY;

    return inX && (hitsTop || hitsBottom);
  }

  handleGameOver() {
    this.running = false;
    this.scoreEngine.handle({ type: "collision" });
    this.emitScore();
    this.hooks.onGameOver?.(this.scoreEngine.getSummary());
  }

  emitScore() {
    this.hooks.onScore?.(this.scoreEngine.getSummary());
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, "#4d8df3");
    gradient.addColorStop(1, "#072044");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = "#62d26f";
    ctx.strokeStyle = "#3b9241";
    this.pipes.forEach((pipe) => {
      ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
      ctx.fillRect(pipe.x, pipe.bottomY, pipe.width, BOARD.height - pipe.bottomY);
    });

    ctx.fillStyle = "#ffdc64";
    ctx.strokeStyle = "#ff9e2c";
    ctx.beginPath();
    ctx.arc(this.bird.x, this.bird.y, this.bird.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}
