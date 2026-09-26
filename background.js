const browserAPI = typeof browser !== "undefined" ? browser : chrome;

async function updateTabBadge() {
  try {
    const tabs = await browserAPI.tabs.query({ url: ["http://*/*", "https://*/*"] });
    const count = tabs.length;
    await browserAPI.action.setBadgeText({ text: count > 0 ? count.toString() : "" });
    await browserAPI.action.setBadgeBackgroundColor({ color: "#4682B4" });
  } catch (err) {
    console.error("[Tab Router SW] Erreur du badge :", err);
  }
}

browserAPI.tabs.onCreated.addListener(updateTabBadge);
browserAPI.tabs.onRemoved.addListener(updateTabBadge);
browserAPI.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "complete") updateTabBadge();
});

// Écoute et routage centralisé (MIDI & JSON)
browserAPI.runtime.onMessage.addListener((message, sender) => {
  const isMidi = message?.type === "MIDI_BRIDGE_EVENT";
  const isJsonApi = message?.type === "JSON_API_EVENT";

  if (isMidi || isJsonApi) {
    const senderTabId = sender.tab?.id;

    browserAPI.tabs.query({ url: ["http://*/*", "https://*/*"] })
      .then((tabs) => {
        for (const tab of tabs) {
          if (tab.id !== senderTabId) {
            browserAPI.tabs.sendMessage(tab.id, message).catch(() => {});
          }
        }
      })
      .catch((err) => console.error("[Tab Router SW] Erreur routage :", err));
  }

  return false;
});

updateTabBadge();