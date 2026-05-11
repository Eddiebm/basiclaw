export default defineBackground(() => {
  // The background service worker is intentionally minimal: the popup talks
  // directly to the content script (for text extraction) and to the BasicLaw
  // API (for auditing). The worker exists so MV3 keeps the extension alive
  // long enough for those round-trips, and to centralise install behaviour.

  chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
      chrome.tabs.create({
        url: "https://basiclaw.vercel.app/extension?source=installed",
      });
    }
  });
});
