/**
 * Removes common markdown syntax so speech synthesis reads natural language,
 * not literal asterisks, pipes, or heading markers.
 */
export function stripMarkdownForSpeech(input: string): string {
  let s = input;

  s = s.replace(/```[\s\S]*?```/g, " ");
  s = s.replace(/`([^`]+)`/g, "$1");
  s = s.replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1");
  s = s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  s = s.replace(/^#{1,6}\s+/gm, "");
  s = s.replace(/^>\s?/gm, "");
  s = s.replace(/\*\*([^*]+)\*\*/g, "$1");
  s = s.replace(/__([^_]+)__/g, "$1");
  s = s.replace(/~~([^~]+)~~/g, "$1");
  s = s.replace(/\*([^*]+)\*/g, "$1");
  s = s.replace(/_([^_]+)_/g, "$1");
  s = s.replace(/^\s*\|[^\n]+\|\s*$/gm, " ");
  s = s.replace(/^\s*[-*+]\s+\[[ xX]\]\s+/gm, "");
  s = s.replace(/^\s*[-*+]\s+/gm, "");
  s = s.replace(/^\s*\d+\.\s+/gm, "");
  s = s.replace(/[*#`|]/g, " ");
  s = s.replace(/\s+/g, " ").trim();
  return s;
}
