(function () {
  // Compatibilité API Cross-Browser
  const browserAPI = typeof browser !== "undefined" ? browser : chrome;

  /**
   * 1. ÉMISSION (Page Web -> Content Script -> Background Worker)
   * Écoute les événements émis depuis la page web via window.postMessage
   */
  window.addEventListener("message", (event) => {
    // Sécurité : On s'assure que le message vient de la même fenêtre
    if (event.source !== window) return;

    const data = event.data;
    if (data && data.type === "MIDI_OUT_TO_EXTENSION" && Array.isArray(data.midiData)) {
      browserAPI.runtime.sendMessage({
        type: "MIDI_BRIDGE_EVENT",
        midiData: data.midiData
      }).catch(() => {
        // Le background worker est peut-être inactif ou déconnecté
      });
    }
  });

  /**
   * 2. RÉCEPTION (Background Worker -> Content Script -> Page Web)
   * Écoute les messages routés par le background worker
   */
  browserAPI.runtime.onMessage.addListener((message) => {
    if (message && message.type === "MIDI_BRIDGE_EVENT" && Array.isArray(message.midiData)) {
      window.postMessage(
        {
          type: "MIDI_IN_FROM_EXTENSION",
          midiData: message.midiData
        },
        "*"
      );
    }
  });
})();