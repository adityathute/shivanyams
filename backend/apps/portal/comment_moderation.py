"""Validation helpers for public comment and reply text."""

import html
import re
import unicodedata
from urllib.parse import unquote, urlsplit


ALLOWED_COMMENT_HOST = "shivanyams.com"

# Keep this list deliberately explicit and maintainable. Add reviewed terms here
# as moderation coverage is expanded for additional languages and transliterations.
BLOCKED_TERMS = {
    # English
    "fuck", "fucking", "fucker", "motherfucker", "shit", "bullshit",
    "bitch", "bitches", "asshole", "bastard", "cunt", "dickhead",
    # Hindi / Marathi - Roman script
    "madarchod", "madarchod", "mc", "bhenchod", "behenchod", "bc",
    "chutiya", "chutiye", "chutiyapa", "gaand", "gandu", "ganduu",
    "harami", "haramkhor", "randi", "bhadwa", "bhadve", "lavde",
    "lodu", "lode", "jhatu", "jhaatu", "bsdk", "bhosdike",
    # Hindi / Marathi - Devanagari
    "मादरचोद", "मादरचोद", "बहनचोद", "भेनचोद", "चूतिया", "चुतिया",
    "भोसडी", "भोसडीचा", "भोसडीचे", "गांडू", "हरामी", "हरामखोर",
    "रंडी", "भडवा", "भडवे", "लवड्या", "झवाड्या", "झवणे",
}

URL_CANDIDATE_RE = re.compile(
    r"(?<![\w@])(?:https?://|ftp://|www\.)[^\s<>]+|"
    r"(?<![\w@])(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+"
    r"(?:com|in|org|net|edu|gov|co|io|info|biz|app|dev|me|ai|uk|us|xyz|online|site|store)"
    r"(?:\b[^\s<>]*)?",
    re.IGNORECASE,
)
TOKEN_RE = re.compile(r"[\w\u0900-\u097F]+", re.UNICODE)


def _normalize_text(value):
    text = html.unescape(unicodedata.normalize("NFKC", str(value or "")))
    text = text.replace("\u200b", "").replace("\u200c", "").replace("\u200d", "")
    text = text.translate(str.maketrans({"。": ".", "．": ".", "｡": "."}))
    for _ in range(2):
        text = unquote(text)
    text = text.casefold()
    text = re.sub(r"\[\s*dot\s*\]|\(\s*dot\s*\)|\{\s*dot\s*\}", ".", text)
    text = re.sub(r"\s+dot\s+", ".", text)
    text = re.sub(r"\bhxxps?\b", "https", text)
    text = re.sub(r"\s*\.\s*", ".", text)
    return text


def _is_allowed_host(host):
    host = (host or "").rstrip(".").casefold()
    return host == ALLOWED_COMMENT_HOST or host.endswith("." + ALLOWED_COMMENT_HOST)


def _find_external_link(text):
    normalized = _normalize_text(text)
    for match in URL_CANDIDATE_RE.finditer(normalized):
        candidate = match.group(0).rstrip(".,!?;:)]}\"'")
        if not candidate:
            continue
        parse_value = candidate if "://" in candidate else "https://" + candidate
        try:
            host = urlsplit(parse_value).hostname
        except ValueError:
            host = None
        if not host or not _is_allowed_host(host):
            return candidate
    return None


def _contains_blocked_language(value):
    normalized = _normalize_text(value)
    tokens = TOKEN_RE.findall(normalized)
    if any(token in BLOCKED_TERMS for token in tokens):
        return True

    # Catch a blocked word split across spaces or punctuation, but require
    # the joined token sequence to equal a term (not merely contain a substring).
    for start in range(len(tokens)):
        combined = ""
        for token in tokens[start:start + 8]:
            combined += token
            if combined in BLOCKED_TERMS:
                return True
            if not any(term.startswith(combined) for term in BLOCKED_TERMS):
                break
    return False


def validate_comment_content(value):
    """Return an error message when content violates comment safety rules."""
    external_link = _find_external_link(value)
    if external_link:
        return "Only links from ShivanyaMS (shivanyams.com) are allowed in comments and replies."

    if _contains_blocked_language(value):
        return "Please remove abusive or insulting language before submitting."
    return None
