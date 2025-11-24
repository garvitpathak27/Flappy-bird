const SCORE_KEY = "flappyLogic:scores";

const sendRuntimeMessage = (payload) =>
  new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(payload, (response) => {
      const error = chrome.runtime.lastError;
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });

export const saveScore = (summary) => sendRuntimeMessage({ type: "score:update", payload: summary });

export const fetchLeaderboard = () =>
  new Promise((resolve) => {
    chrome.storage.local.get([SCORE_KEY], (data) => {
      resolve(data[SCORE_KEY] || []);
    });
  });

export const fetchSettings = () => sendRuntimeMessage({ type: "settings:fetch" });

export const updateSettings = (payload) => sendRuntimeMessage({ type: "settings:update", payload });
