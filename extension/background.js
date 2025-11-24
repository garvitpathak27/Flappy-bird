const SCORE_STORAGE_KEY = "flappyLogic:scores";
const SETTINGS_STORAGE_KEY = "flappyLogic:settings";
const MAX_LEADERBOARD = 10;

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    [SCORE_STORAGE_KEY]: [],
    [SETTINGS_STORAGE_KEY]: {
      lastDifficulty: "balanced",
      overlayEnabled: false
    }
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "score:update": {
      persistScore(message.payload)
        .then((summary) => {
          broadcast({ type: "score:push", payload: summary });
          sendResponse({ ok: true, summary });
        })
        .catch((error) => sendResponse({ ok: false, error: error.message }));
      return true;
    }
    case "settings:update": {
      updateSettings(message.payload)
        .then(() => sendResponse({ ok: true }))
        .catch((error) => sendResponse({ ok: false, error: error.message }));
      return true;
    }
    case "settings:fetch": {
      chrome.storage.local.get([SETTINGS_STORAGE_KEY], (data) => {
        sendResponse({
          ok: true,
          settings: data[SETTINGS_STORAGE_KEY] || { lastDifficulty: "balanced", overlayEnabled: false }
        });
      });
      return true;
    }
    default:
      break;
  }
  return false;
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-overlay") {
    chrome.storage.local.get([SETTINGS_STORAGE_KEY], (data) => {
      const existing = data[SETTINGS_STORAGE_KEY] || { overlayEnabled: false };
      const overlayEnabled = !existing.overlayEnabled;
      updateSettings({ ...existing, overlayEnabled });
      broadcast({ type: "overlay:toggle", payload: { enabled: overlayEnabled } });
    });
  }
});

async function persistScore(summary) {
  const stored = await chrome.storage.local.get([SCORE_STORAGE_KEY]);
  const leaderboard = stored[SCORE_STORAGE_KEY] || [];
  const nextScores = [...leaderboard, summary]
    .sort((a, b) => b.total - a.total)
    .slice(0, MAX_LEADERBOARD);
  await chrome.storage.local.set({ [SCORE_STORAGE_KEY]: nextScores });
  return { leaderboard: nextScores, latest: summary };
}

async function updateSettings(next) {
  const existing = await chrome.storage.local.get([SETTINGS_STORAGE_KEY]);
  const merged = {
    lastDifficulty: existing[SETTINGS_STORAGE_KEY]?.lastDifficulty || "balanced",
    overlayEnabled: existing[SETTINGS_STORAGE_KEY]?.overlayEnabled || false,
    ...next
  };
  await chrome.storage.local.set({ [SETTINGS_STORAGE_KEY]: merged });
  return merged;
}

function broadcast(message) {
  chrome.runtime.sendMessage(message, () => void chrome.runtime.lastError);
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (!tab.id) return;
      chrome.tabs.sendMessage(tab.id, message, () => void chrome.runtime.lastError);
    });
  });
}
