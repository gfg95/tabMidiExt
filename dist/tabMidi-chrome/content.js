(function () {
  const browserAPI = typeof browser !== "undefined" ? browser : chrome;

  /**
   * 1. ÉMISSION (Page Web -> Content Script -> Background)
   */
  window.addEventListener("message", (event) => {
    if (event.source !== window) return;

    const data = event.data;

    // Protocole MIDI (existant)
    if (data && data.type === "MIDI_OUT_TO_EXTENSION" && Array.isArray(data.midiData)) {
      browserAPI.runtime.sendMessage({
        type: "MIDI_BRIDGE_EVENT",
        midiData: data.midiData
      }).catch(() => {});
    }

    // Protocole REST / JSON (Nouveau)
    if (data && data.type === "JSON_API_OUT" && typeof data.endpoint === "string") {
      browserAPI.runtime.sendMessage({
        type: "JSON_API_EVENT",
        endpoint: data.endpoint,
        payload: data.payload
      }).catch(() => {});
    }
  });

  /**
   * 2. RÉCEPTION (Background -> Content Script -> Page Web)
   */
  browserAPI.runtime.onMessage.addListener((message) => {
    // Protocole MIDI (existant)
    if (message && message.type === "MIDI_BRIDGE_EVENT" && Array.isArray(message.midiData)) {
      window.postMessage({
        type: "MIDI_IN_FROM_EXTENSION",
        midiData: message.midiData
      }, "*");
    }

    // Protocole REST / JSON (Nouveau)
    if (message && message.type === "JSON_API_EVENT") {
      window.postMessage({
        type: "JSON_API_IN",
        endpoint: message.endpoint,
        payload: message.payload
      }, "*");
    }
  });
})();