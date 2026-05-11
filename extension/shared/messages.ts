/**
 * Typed message protocol between popup ↔ content script.
 */

export type ExtractRequest = {
  kind: "extract";
};

export type ExtractResponse = {
  ok: true;
  text: string;
  title: string;
  excerpt: string;
  source: "selection" | "readability" | "fallback";
  pageUrl: string;
} | {
  ok: false;
  error: string;
};

export type Message = ExtractRequest;
