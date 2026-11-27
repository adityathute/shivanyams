<!-- File Location: shivanyams/src/config/COMMENT-MODERATION.md -->
<!-- Reference Repositories: shivanya-sdk v1.0.0 (Master); shivanya-auth (private, version not verified) -->
<!-- Cleanup Status: Cleanup Pending -->
<!-- Cleanup Info: Batch 21 audit; documentation review completed, related implementation verification remains pending. -->

# Comment moderation word list

The shared dictionary is:

`src/config/comment-moderation-words.json`

Both the live comment/reply checker and the Django API read this same configuration. Do not add words inside the moderation TypeScript or Python files.

## Add a blocked word

1. Open `src/config/comment-moderation-words.json`.
2. Choose the correct language array:
   - `english`
   - `hindi_roman` (Hindi typed using English letters)
   - `marathi_roman` (Marathi typed using English letters)
   - `hindi_devanagari`
   - `marathi_devanagari`
3. Add the word as a JSON string, separated by a comma.
4. Commit and deploy/rebuild the frontend and deploy/restart the Django backend.

Example:

```json
"hindi_roman": [
  "existing-word",
  "new-blocked-word"
]
```

Words are normalized before matching, so capitalization, repeated letters, punctuation and spaces used to split a blocked word are handled in common cases. Add common spelling/transliteration variants as separate entries when needed.

The same dictionary protects new comments, replies and edits. Frontend checks show the warning while typing; Django checks remain authoritative if someone bypasses the disabled button.
