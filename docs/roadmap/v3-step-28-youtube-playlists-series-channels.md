# ShivanyaMS V3 — Step 28: YouTube Playlists, Video Series, Channels and Collections

## Scope

This step prioritizes YouTube-hosted content and editorial organization. It does not expand the self-hosted video transcoding or custom-player feature set.

## Delivered

- Added `VideoCollection` with collection types: YouTube playlist, video series and channel.
- Added multilingual collection titles and descriptions, canonical slug, external YouTube URL, thumbnail, publication state and sort order.
- Added `VideoCollectionItem` to curate existing Video posts in a stable, editor-defined order. Duplicate membership is prevented at the database level.
- Added public collection discovery at `GET /content/video-collections/`, with optional `?type=playlist|series|channel` filtering. Only published collections and published active videos are exposed.
- Added Admin Portal create, edit, publish/unpublish and delete workflows, including ordered membership management through comma-separated existing Video post IDs.
- Added Django Admin collection management with inline video ordering.
- Updated the Videos landing page to show curated playlist, series and channel cards, linked video posts and the official YouTube destination.
- YouTube external URLs are HTTPS validated and restricted to YouTube hosts. Existing video posts and their YouTube embed links remain the canonical content records.

## Database and API

- Migration: `0040_video_collections.py` (depends on `0039_video_caption_tracks`).
- Admin collection endpoints: `GET/POST /admin/video-collections/`, `PATCH/DELETE /admin/video-collections/{id}/`.
- Public collection endpoint: `GET /content/video-collections/`.
- Collection membership accepts existing posts with `VideoDetails`; membership replacement is atomic and preserves the submitted order.

## Editorial workflow

1. Create and publish Video posts using their YouTube URLs in Video Details.
2. Open the Admin Dashboard's **Video playlists, series & channels** panel.
3. Create a playlist, series or channel collection; paste its YouTube URL and optional thumbnail.
4. Add Video post IDs in the order they should appear.
5. Publish the collection to make it visible on the Videos page.

## Notes

- Collections are editorial groupings and do not download, copy or rehost YouTube videos.
- The collection card links to the original YouTube playlist/channel; individual entries link to the corresponding ShivanyaMS video detail page.
- The Admin Portal currently uses Video post IDs for membership selection; a searchable video picker can replace this in a later admin UX step.
- No tests, builds, migrations or database operations were run.
