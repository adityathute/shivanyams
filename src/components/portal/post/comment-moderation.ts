const ALLOWED_HOST = "shivanyams.com";

const BLOCKED_TERMS = new Set([
  // English
  "fuck", "fucking", "fucker", "motherfucker", "shit", "bullshit",
  "bitch", "bitches", "asshole", "bastard", "cunt", "dickhead",
  // Hindi / Marathi Roman spellings
  "madarchod", "mc", "bhenchod", "behenchod", "bc", "chutiya",
  "chutiye", "chutiyapa", "gaand", "gandu", "ganduu", "harami",
  "haramkhor", "randi", "bhadwa", "bhadve", "lavde", "lodu",
  "lode", "jhatu", "jhaatu", "bsdk", "bhosdike",
  // Hindi / Marathi Devanagari
  "मादरचोद", "बहनचोद", "भेनचोद", "चूतिया", "चुतिया", "भोसडी",
  "भोसडीचा", "भोसडीचे", "गांडू", "हरामी", "हरामखोर", "रंडी",
  "भडवा", "भडवे", "लवड्या", "झवाड्या", "झवणे",
]);

const URL_PATTERN =
  /(?<![\w@])(?:https?:\/\/|ftp:\/\/|www\.)[^\s<>]+|(?<![\w@])(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:com|in|org|net|edu|gov|co|io|info|biz|app|dev|me|ai|uk|us|xyz|online|site|store)(?:\b[^\s<>]*)?/gi;

function normalize(value: string) {
  return value
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .toLowerCase()
    .replace(/\[\s*dot\s*\]|\(\s*dot\s*\)|\{\s*dot\s*\}/g, ".")
    .replace(/\s+dot\s+/g, ".")
    .replace(/\bhxxps?\b/g, "https")
    .replace(/\s*\.\s*/g, ".");
}

function isAllowedHost(hostname: string) {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  return host === ALLOWED_HOST || host.endsWith("." + ALLOWED_HOST);
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

  const tokens = normalized.match(/[\p{L}\p{N}_]+/gu) || [];
  if (tokens.some((token) => BLOCKED_TERMS.has(token))) {
    return "Please remove abusive or insulting language.";
  }

  const compact = normalized.replace(/[^\p{L}\p{N}]/gu, "");
  for (const term of BLOCKED_TERMS) {
    const compactTerm = term.replace(/[^\p{L}\p{N}]/gu, "");
    if (compactTerm.length >= 5 && compact.includes(compactTerm)) {
      return "Please remove abusive or insulting language.";
    }
  }

  return null;
}
