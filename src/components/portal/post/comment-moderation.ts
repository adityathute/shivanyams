const ALLOWED_HOST = "shivanyams.com";

import moderationWords from "../../../config/comment-moderation-words.json";

const BLOCKED_TERMS = new Set(Object.values(moderationWords.languages).flat().map((word) => normalizeWord(word)));\n\n/*
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
]); */

const URL_PATTERN =
  /(?<![\w@])(?:https?:\/\/|ftp:\/\/|www\.)[^\s<>]+|(?<![\w@])(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}(?:\b[^\s<>]*)?/gi;

function normalizeWord(value: string) {\n  return value.normalize("NFKC").replace(/[\\u200B-\\u200D\\uFEFF]/g, "").toLocaleLowerCase().replace(/[^\\p{L}\\p{M}\\p{N}]+/gu, " ").trim().replace(/(.)\\1+/gu, "$1");\n}\n\nfunction normalize(value: string) {
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
  return normalized
    .replace(/&period;|&#0*46;|&#x0*2e;/gi, ".");
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

  const tokens = normalized.match(/[\p{L}\p{M}\p{N}_]+/gu) || [];
  if (tokens.some((token) => BLOCKED_TERMS.has(token))) {
    return "Please remove abusive or insulting language.";
  }

  for (let start = 0; start < tokens.length; start += 1) {
    let combined = "";
    for (const token of tokens.slice(start, start + 8)) {
      combined += token;
      if (BLOCKED_TERMS.has(combined)) {
        return "Please remove abusive or insulting language.";
      }
      if (![...BLOCKED_TERMS].some((term) => term.startsWith(combined))) break;
    }
  }

  return null;
}
