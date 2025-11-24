const OVERLAY_ID = "flappy-logic-overlay";
let overlayEnabled = false;

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "overlay:toggle") {
    overlayEnabled = message.payload.enabled;
    overlayEnabled ? ensureOverlay() : destroyOverlay();
  }
  if (message.type === "score:push" && overlayEnabled) {
    renderLeaderboard(message.payload.leaderboard || []);
  }
  if (message.type === "score:heartbeat" && overlayEnabled) {
    renderLeaderboard(message.payload || []);
  }
});

chrome.storage.local.get(["flappyLogic:scores", "flappyLogic:settings"], (data) => {
  overlayEnabled = Boolean(data["flappyLogic:settings"]?.overlayEnabled);
  if (overlayEnabled) {
    ensureOverlay();
    renderLeaderboard(data["flappyLogic:scores"] || []);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && overlayEnabled) {
    overlayEnabled = false;
    destroyOverlay();
    chrome.runtime.sendMessage({
      type: "settings:update",
      payload: { overlayEnabled: false }
    });
  }
});

function ensureOverlay() {
  if (document.getElementById(OVERLAY_ID)) return;
  const container = document.createElement("section");
  container.id = OVERLAY_ID;
  container.innerHTML = `
    <header>
      <strong>Flappy Logic Leaderboard</strong>
      <button type="button" data-overlay-close>×</button>
    </header>
    <ol data-overlay-list></ol>
    <footer>Press Esc to hide • Ctrl+Shift+F to toggle</footer>
  `;
  document.body.appendChild(container);
  container.querySelector("[data-overlay-close]").addEventListener("click", () => {
    overlayEnabled = false;
    destroyOverlay();
    chrome.runtime.sendMessage({ type: "settings:update", payload: { overlayEnabled: false } });
  });
}

function destroyOverlay() {
  const existing = document.getElementById(OVERLAY_ID);
  if (existing) existing.remove();
}

function renderLeaderboard(entries) {
  const list = document.querySelector(`#${OVERLAY_ID} [data-overlay-list]`);
  if (!list) return;
  if (!Array.isArray(entries) || entries.length === 0) {
    list.innerHTML = '<li class="empty">Play a round to populate the leaderboard.</li>';
    return;
  }
  list.innerHTML = entries
    .map(
      (entry, index) => `
        <li>
          <span>${index + 1}.</span>
          <span>${Math.round(entry.total)}</span>
          <small>${entry.difficulty || "balanced"}</small>
        </li>
      `
    )
    .join("");
}
