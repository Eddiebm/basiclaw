export type MessageTree = Record<string, unknown>;

export function mergeMessages(base: MessageTree, patch: MessageTree): MessageTree {
  const out: MessageTree = { ...base };
  for (const key of Object.keys(patch)) {
    const baseVal = base[key];
    const patchVal = patch[key];
    if (
      baseVal &&
      patchVal &&
      typeof baseVal === "object" &&
      !Array.isArray(baseVal) &&
      typeof patchVal === "object" &&
      !Array.isArray(patchVal)
    ) {
      out[key] = mergeMessages(baseVal as MessageTree, patchVal as MessageTree);
    } else {
      out[key] = patchVal;
    }
  }
  return out;
}
