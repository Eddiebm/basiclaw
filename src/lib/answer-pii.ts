/** Best-effort redaction before publishing community answers (not a guarantee). */
export function stripPIIForPublish(text: string): string {
  let out = text;
  out = out.replace(/\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/g, "[redacted email]");
  out = out.replace(/\b(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}\b/g, "[redacted phone]");
  return out.trim();
}
