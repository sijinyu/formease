const STORAGE_KEY = "formease_profile";

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get([STORAGE_KEY], (result) => {
    if (!result[STORAGE_KEY]) {
      chrome.storage.local.set({ [STORAGE_KEY]: {} });
    }
  });
});

async function injectContentScript(tabId: number): Promise<void> {
  try {
    // Check if already injected
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => !!document.getElementById("formease-root"),
    });
    if (results[0]?.result) return;

    // Inject CSS then JS
    await chrome.scripting.insertCSS({
      target: { tabId },
      files: ["assets/content.css"],
    });
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content.js"],
    });
  } catch {
    // Tab may not support scripting (e.g. chrome:// pages) — safe to ignore
  }
}

// Inject on extension icon click (popup closes, but action triggers injection)
chrome.action.onClicked.addListener((tab) => {
  if (tab.id != null) {
    injectContentScript(tab.id);
  }
});

// Inject on keyboard shortcut
chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id == null) return;

  await injectContentScript(tab.id);

  // Small delay to ensure content script is ready
  setTimeout(() => {
    chrome.tabs.sendMessage(tab.id!, { type: "COMMAND", command }).catch(() => {
      // Content script may not be ready — safe to ignore
    });
  }, 100);
});

// Also inject when popup sends a message (user opened popup = intent to use)
chrome.runtime.onMessage.addListener((message, _sender) => {
  if (message.type === "INJECT_CONTENT_SCRIPT") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (tabId != null) {
        injectContentScript(tabId);
      }
    });
  }
});
