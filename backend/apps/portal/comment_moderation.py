# File Location: shivanyams/backend/apps/portal/comment_moderation.py
# References: shivanya-sdk v1.0.0 (Master, ce45f9f875056b0578da2438b9bfaaf3fb6622b9; read-only); shivanya-auth private (version/commit not verified).
# Cleanup Status: Clean
# Cleanup Info: Batch 15 audit. Precomputes normalized blocked-term prefixes to avoid rescanning the complete term set for each token prefix.

"""Shared validation for public comment and reply text."""

import html
import json
import re
import unicodedata
from pathlib import Path
from urllib.parse import unquote, urlsplit


ALLOWED_COMMENT_HOST = "shivanyams.com"
WORD_CONFIG_PATH = Path(__file__).resolve().parents[3] / "src" / "config" / "comment-moderation-words.json"


def _normalize_word(value):
    value = unicodedata.normalize("NFKC", str(value or "")).casefold()
    value = re.sub(r"[\u200b-\u200d\ufeff]", "", value)
    value = re.sub(r"[^\w\u0900-\u097f]", "", value, flags=re.UNICODE)
    return re.sub(r"(.)\1+", r"\1", value)


def _load_blocked_terms():
    try:
        with WORD_CONFIG_PATH.open("r", encoding="utf-8") as config_file:
            config = json.load(config_file)
    except (OSError, json.JSONDecodeError):
        return set()

    dictionaries = [config.get("languages", {}), config.get("categories", {})]
    blocked = set()
    for dictionary in dictionaries:
        if not isinstance(dictionary, dict):
            continue
        for words in dictionary.values():
            if not isinstance(words, list):
                continue
            for word in words:
                if isinstance(word, str) and word.strip():
                    normalized = _normalize_word(word)
                    if normalized:
                        blocked.add(normalized)
    return blocked


BLOCKED_TERMS = _load_blocked_terms()
BLOCKED_TERM_PREFIXES = {
    term[:length]
    for term in BLOCKED_TERMS
    for length in range(1, len(term) + 1)
}
TOKEN_RE = re.compile(r"[\w\u0900-\u097f]+", re.UNICODE)
URL_CANDIDATE_RE = re.compile(
    r"(?<![\w@])(?:https?://|ftp://|www\.)[^\s<>]+|"
    r"(?<![\w@])(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}"
    r"(?:\b[^\s<>]*)?",
    re.IGNORECASE,
)


def _normalize_text(value):
    text = html.unescape(unicodedata.normalize("NFKC", str(value or "")))
    text = re.sub(r"[\u200b-\u200d\ufeff]", "", text)
    text = text.translate(str.maketrans({"。": ".", "．": ".", "｡": "."}))
    for _ in range(2):
        text = unquote(text)
    text = text.casefold()
    text = re.sub(r"\[\s*(?:dot|\.)\s*\]|\(\s*(?:dot|\.)\s*\)|\{\s*(?:dot|\.)\s*\}", ".", text)
    text = re.sub(r"\s+dot\s+", ".", text)
    text = re.sub(r"\bhxxps?\b", "https", text)
    text = re.sub(r"\s*\.\s*", ".", text)
    return text


def _is_allowed_host(host):
    host = (host or "").rstrip(".").casefold()
    return host == ALLOWED_COMMENT_HOST or host.endswith("." + ALLOWED_COMMENT_HOST)


def _find_external_link(text):
    for match in URL_CANDIDATE_RE.finditer(_normalize_text(text)):
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
    tokens = TOKEN_RE.findall(_normalize_text(value))
    for start in range(len(tokens)):
        combined = ""
        for token in tokens[start:start + 8]:
            combined += _normalize_word(token)
            if combined in BLOCKED_TERMS:
                return True
            if combined not in BLOCKED_TERM_PREFIXES:
                break
    return False


def validate_comment_content(value):
    """Return an error message when content violates comment safety rules."""
    if _find_external_link(value):
        return "Only links from ShivanyaMS (shivanyams.com) are allowed in comments and replies."

    if _contains_blocked_language(value):
        return "Please remove abusive or insulting language before submitting."
    return None
