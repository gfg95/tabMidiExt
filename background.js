// Compatibilité API Cross-Browser (Chrome / Firefox)
const browserAPI = typeof browser !== "undefined" ? browser : chrome;

/**
 * Met à jour le badge de l'extension avec le nombre d'onglets éligibles
 */
async function updateTabBadge() {
  try {
    const tabs = await browserAPI.tabs.query({ url: ["http://*/*", "https://*/*"] });
    const count = tabs.length;
    
    await browserAPI.action.setBadgeText({ text: count > 0 ? count.toString() : "" });
    await browserAPI.action.setBadgeBackgroundColor({ color: "#4682B4" });
  } catch (err) {
    console.error("[MIDI Router SW] Erreur de mise à jour du badge :", err);
  }
}

// Suivi des onglets pour rafraîchir le badge
browserAPI.tabs.onCreated.addListener(updateTabBadge);
browserAPI.tabs.onRemoved.addListener(updateTabBadge);
browserAPI.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "complete") {
    updateTabBadge();
  }
});

// Écoute et routage des messages MIDI
browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "MIDI_BRIDGE_EVENT") {
    const senderTabId = sender.tab?.id;

    browserAPI.tabs.query({ url: ["http://*/*", "https://*/*"] })
      .then((tabs) => {
        for (const tab of tabs) {
          // Ne pas renvoyer le message à l'onglet émetteur
          if (tab.id !== senderTabId) {
            browserAPI.tabs.sendMessage(tab.id, message).catch(() => {
              // Ignore silencieusement les onglets sans content script actif
            });
          }
        }
      })
      .catch((err) => {
        console.error("[MIDI Router SW] Erreur lors de la requête des onglets :", err);
      });
  }

  // Renvoie true pour fermer le canal de réponse de manière propre
  return false;
});

// Initialisation au démarrage
updateTabBadge();