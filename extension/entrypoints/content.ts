import { Readability } from "@mozilla/readability";
import type { ExtractResponse, Message } from "@/shared/messages";

export default defineContentScript({
  // Run on every http(s) page. Manifest still uses activeTab, so we are only
  // injected for the tab the user explicitly clicks the extension on.
  matches: ["<all_urls>"],
  runAt: "document_idle",
  main() {
    const MIN_CHARS = 200;

    function getSelectionText(): string {
      const selection = window.getSelection();
      if (!selection) return "";
      return selection.toString().trim();
    }

    function readableText(): { text: string; title: string; excerpt: string } {
      try {
        // Readability mutates the DOM, so clone it first.
        const cloned = document.cloneNode(true) as Document;
        const article = new Readability(cloned, {
          charThreshold: 200,
          keepClasses: false,
        }).parse();
        if (article && article.textContent && article.textContent.trim().length >= MIN_CHARS) {
          return {
            text: article.textContent.trim(),
            title: article.title || document.title || "",
            excerpt: (article.excerpt || "").trim(),
          };
        }
      } catch (err) {
        // swallow – fall through to body innerText fallback below.
        console.warn("[BasicLaw] Readability failed:", err);
      }

      // Last-ditch fallback: visible body text.
      const body = document.body?.innerText ?? "";
      return {
        text: body.replace(/\s+/g, " ").trim(),
        title: document.title || "",
        excerpt: "",
      };
    }

    chrome.runtime.onMessage.addListener(
      (message: Message, _sender, sendResponse: (response: ExtractResponse) => void) => {
        if (!message || message.kind !== "extract") return;

        const selection = getSelectionText();
        if (selection.length >= MIN_CHARS) {
          sendResponse({
            ok: true,
            text: selection,
            title: document.title || "",
            excerpt: selection.slice(0, 200),
            source: "selection",
            pageUrl: location.href,
          });
          return true;
        }

        const article = readableText();
        if (article.text.length < MIN_CHARS) {
          sendResponse({
            ok: false,
            error:
              "Couldn't find enough readable text on this page. Try selecting the contract or Terms text and click Audit again.",
          });
          return true;
        }

        sendResponse({
          ok: true,
          text: article.text,
          title: article.title,
          excerpt: article.excerpt,
          source: article.title || article.excerpt ? "readability" : "fallback",
          pageUrl: location.href,
        });
        return true;
      }
    );
  },
});
