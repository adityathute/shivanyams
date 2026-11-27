/* File Location: shivanyams/src/components/portal/post/comment-moderation.ts
 * References: shivanya-sdk v1.0.0 (Master, ce45f9f875056b0578da2438b9bfaaf3fb6622b9; read-only); shivanya-auth private (version/commit not verified).
 * Cleanup Status: Clean
 * Cleanup Info: Batch 13 audit. Logic Audit: 1 JSON word-list import; 0 UI components; 0 CSS selectors. Precomputed blocked-term prefixes to avoid repeatedly scanning the full blocked-term set while preserving matching behavior.
 */
import moderationWords from "../../../config/comment-moderation-words.json";

const ALLOWED_HOST = "shivanyams.com";

function normalizeWord(value: string) {
  return value
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}]/gu, "")
    .replace(/(.)\1+/gu, "$1");
}

const BLOCKED_TERMS = new Set(
  [...Object.values(moderationWords.languages), ...Object.values(moderationWords.categories || {})]
    .flat()
    .map(normalizeWord)
    .filter(Boolean),
);

const BLOCKED_TERM_PREFIXES = new Set(
  [...BLOCKED_TERMS].flatMap((term) =>
    Array.from({ length: term.length }, (_, index) => term.slice(0, index + 1)),
  ),
);

const URL_PATTERN =
  /(?<![\w@])(?:https?:\/\/|ftp:\/\/|www\.)[^\s<>]+|(?<![\w@])(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}(?:\b[^\s<>]*)?/gi;

function normalize(value: string) {
  let normalized = value
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[。．｡]/g, ".")
    .toLowerCase()
    .replace(/\[\s*(?:dot|\.)\s*\]|\(\s*(?:dot|\.)\s*\)|\{\s*(?:dot|\.)\s*\}/g, ".")
    .replace(/\s+dot\s+/g, ".")
    .replace(/\bhxxps?\b/g, "https")
    .replace(/\s*\.\s*/g, ".");
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try { normalized = decodeURIComponent(normalized); } catch { break; }
  }
  return normalized.replace(/&period;|&#0*46;|&#x0*2e;/gi, ".");
}

function isAllowedHost(hostname: string) {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  return host === ALLOWED_HOST || host.endsWith("." + ALLOWED_HOST);
}

function containsBlockedLanguage(value: string) {
  const tokens = value.match(/[\p{L}\p{M}\p{N}]+/gu) || [];
  for (let start = 0; start < tokens.length; start += 1) {
    let combined = "";
    for (const token of tokens.slice(start, start + 8)) {
      combined += normalizeWord(token);
      if (BLOCKED_TERMS.has(combined)) return true;
      if (!BLOCKED_TERM_PREFIXES.has(combined)) break;
    }
  }
  return false;
}

export function getCommentModerationIssue(value: string): string | null {
  const normalized = normalize(value);
  const candidates = normalized.match(URL_PATTERN) || [];

  for (const candidate of candidates) {
    const cleaned = candidate.replace(/[.,!?;:)}\]"']+$/, "");
    try {
      const url = new URL(cleaned.includes("://") ? cleaned : "https://" + cleaned);
      if (!url.hostname || !isAllowedHost(url.hostname)) {
        return "Only ShivanyaMS links (shivanyams.com) are allowed.";
      }
    } catch {
      return "Please remove the invalid or external website link.";
    }
  }

  if (containsBlockedLanguage(normalized)) {
    return "Please remove abusive or insulting language.";
  }

  return null;
}
