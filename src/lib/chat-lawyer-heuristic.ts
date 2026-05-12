const PHRASES = [
  "consult a lawyer",
  "consult an attorney",
  "speak with a lawyer",
  "speak with an attorney",
  "talk to a lawyer",
  "talk to an attorney",
  "seek legal advice",
  "get legal advice",
  "hire a lawyer",
  "hire an attorney",
  "licensed attorney",
  "licensed lawyer",
  "qualified lawyer",
  "you should consult",
  "recommend you consult",
];

export function shouldSuggestLawyerDirectoryFromAssistantText(text: string): boolean {
  const s = text.toLowerCase();
  return PHRASES.some((p) => s.includes(p));
}
