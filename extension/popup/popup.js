import { GameEngine } from "../js/game/engine.js";
import { DEFAULT_DIFFICULTY } from "../js/game/config.js";
import { fetchLeaderboard, fetchSettings, saveScore, updateSettings } from "../js/storage/repository.js";

const canvas = document.getElementById("game-canvas");
const playBtn = document.getElementById("play-btn");
const pauseBtn = document.getElementById("pause-btn");
const resetBtn = document.getElementById("reset-btn");
const difficultySelect = document.getElementById("difficulty-select");
const overlayToggle = document.getElementById("overlay-toggle");

const metrics = {
  score: document.getElementById("metric-score"),
  streak: document.getElementById("metric-streak"),
  precision: document.getElementById("metric-precision"),
  stability: document.getElementById("metric-stability"),
  leaderboard: document.getElementById("leaderboard-list")
};

const settingsCache = {
  lastDifficulty: DEFAULT_DIFFICULTY,
  overlayEnabled: false
};

const engine = new GameEngine(canvas, {
  difficultyKey: DEFAULT_DIFFICULTY,
  hooks: {
    onScore: (summary) => updateMetrics(summary),
    onGameOver: (summary) => persistScore(summary)
  }
});

playBtn.addEventListener("click", () => engine.start());
pauseBtn.addEventListener("click", () => engine.pause());
resetBtn.addEventListener("click", () => engine.reset());

difficultySelect.addEventListener("change", (event) => {
  const selected = event.target.value;
  engine.updateDifficulty(selected);
  settingsCache.lastDifficulty = selected;
  syncSettings();
});

document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    engine.flap();
  }
});

overlayToggle.addEventListener("click", async () => {
  const desired = overlayToggle.dataset.state !== "on";
  overlayToggle.dataset.state = desired ? "on" : "off";
  overlayToggle.textContent = desired ? "Disable overlay" : "Toggle overlay (Ctrl+Shift+F)";
  settingsCache.overlayEnabled = desired;
  await syncSettings();
  chrome.runtime.sendMessage({ type: "overlay:toggle", payload: { enabled: desired } });
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "score:push") {
    renderLeaderboard(message.payload.leaderboard || []);
  }
});

init();

function updateMetrics(summary) {
  if (!summary) return;
  metrics.score.textContent = summary.total;
  metrics.streak.textContent = summary.streak;
  metrics.precision.textContent = `${summary.precision}%`;
  metrics.stability.textContent = `${summary.stability}%`;
}

async function hydrateFromStorage() {
  const leaderboard = await fetchLeaderboard();
  renderLeaderboard(leaderboard);
  const { settings } = (await fetchSettings()) || {};
  const difficulty = settings?.lastDifficulty || DEFAULT_DIFFICULTY;
  difficultySelect.value = difficulty;
  engine.updateDifficulty(difficulty);
  settingsCache.lastDifficulty = difficulty;
  if (settings?.overlayEnabled) {
    overlayToggle.dataset.state = "on";
    overlayToggle.textContent = "Disable overlay";
    settingsCache.overlayEnabled = true;
  }
}

async function init() {
  await hydrateFromStorage();
}

async function persistScore(summary) {
  const payload = {
    ...summary,
    difficulty: difficultySelect.value,
    completedAt: new Date().toISOString()
  };
  const response = await saveScore(payload);
  if (response?.summary?.leaderboard) {
    renderLeaderboard(response.summary.leaderboard);
  }
}

function renderLeaderboard(entries) {
  if (!entries.length) {
    metrics.leaderboard.innerHTML = "<li>No scores yet.</li>";
    return;
  }
  metrics.leaderboard.innerHTML = entries
    .map(
      (entry, index) => `
        <li>
          <span>${index + 1}. ${Math.round(entry.total)}</span>
          <small>${entry.difficulty ?? "balanced"}</small>
        </li>
      `
    )
    .join("\n");
}

function syncSettings() {
  return updateSettings({ ...settingsCache });
}
