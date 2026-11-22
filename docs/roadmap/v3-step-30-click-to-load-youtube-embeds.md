# Step 30 — Click-to-load YouTube embeds

## Scope

Keep the public Videos page YouTube-first. Avoid creating an iframe for every video card during the initial page render.

## Implementation

- Convert supported YouTube watch, short, shorts, live and embed URLs to privacy-enhanced `youtube-nocookie.com` embed URLs.
- Derive a YouTube thumbnail URL from the validated video ID and use it as the card preview.
- Render a lightweight thumbnail and accessible Play button before playback.
- Create the YouTube iframe only after the visitor explicitly activates Play.
- Apply a restrictive referrer policy to the iframe and retain the existing responsive 16:9 card container.
- For non-YouTube videos, the Play action opens the existing ShivanyaMS video detail route rather than rendering an invalid YouTube iframe.

## Changed project files

- `src/components/videos/VideosPage.tsx`
- `src/components/videos/VideosPage.css`

## Compatibility

No API contract or database schema changes. Existing video post URLs, search, topic/tag filters, and playlist/series/channel collections remain in place.

## Verification boundary

Source changes and GitHub commit were verified. Tests, builds, migrations, and database operations were intentionally not run, per the project testing-phase instruction.
