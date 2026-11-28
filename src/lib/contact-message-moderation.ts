import moderationWords from "../config/comment-moderation-words.json";

function normalizeWord(value: string): string {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[\u200b-\u200d\ufeff]/gu, "")
    .replace(/[^\w\u0900-\u097f]/gu, "")
    .replace(/(.)\1+/gu, "$1");
}

const dictionaries = [
  moderationWords.languages,
  moderationWords.categories,
] as const;

const blockedTerms = new Set<string>();
const blockedPrefixes = new Set<string>();

for (const dictionary of dictionaries) {
  for (const words of Object.values(dictionary)) {
    for (const word of words) {
      const normalized = normalizeWord(word);
      if (!normalized) continue;
      blockedTerms.add(normalized);
      for (let length = 1; length <= normalized.length; length += 1) {
        blockedPrefixes.add(normalized.slice(0, length));
      }
    }
  }
}

export function containsAbusiveLanguage(value: string): boolean {
  const normalizedText = value
    .normalize("NFKC")
    .replace(/[\u200b-\u200d\ufeff]/gu, "")
    .toLocaleLowerCase();
  const tokens = normalizedText.match(/[\w\u0900-\u097f]+/gu) ?? [];

  for (let start = 0; start < tokens.length; start += 1) {
    let combined = "";
    for (const token of tokens.slice(start, start + 8)) {
      combined += normalizeWord(token);
      if (blockedTerms.has(combined)) return true;
      if (!blockedPrefixes.has(combined)) break;
    }
  }
  return false;
}
