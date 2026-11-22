# ShivanyaMS V3 — Step 29: Video Topics, Tags, Search and Discovery Filters

## Scope

Make the Videos section easier to browse using the existing normalized content taxonomy and canonical tag system. This is a YouTube-first discovery improvement, not another video-player project.

## Delivered

- Added `GET /content/videos/discovery/` as a dedicated public video discovery endpoint.
- Restricts results to active, published posts in the Videos category that have `VideoDetails` configured.
- Reuses shared multilingual content search and normalized tag/taxonomy filters (`q`, `tag`, `taxonomy`, `taxonomy_type`, and supported shared filters).
- Returns public video posts with their canonical tags and taxonomy terms, alongside tag and topic facets for filter controls.
- Caps the requested result count between 1 and 100.
- Updated the Videos page to request server-filtered results with a short input debounce.
- Added topic and tag selectors, clear-filters action, and actual topic/tag chips on video cards.
- Keeps the existing YouTube embed and YouTube collection experience intact.

## Taxonomy and editorial workflow

- Use the existing normalized `Tag` model for reusable video tags.
- Use the existing `TaxonomyType` / `TaxonomyTerm` models for controlled topics. The recommended taxonomy type slug for video topics is `video-topic`.
- Existing Post Editor metadata controls can attach canonical tags and taxonomy terms to a Video post.
- Existing Django Admin taxonomy/tag screens remain available for creating and maintaining controlled vocabulary.

## API

`GET /content/videos/discovery/?q=scholarship&tag=exam-preparation&taxonomy=career-guidance`

Response includes `results` (published video posts with `video_details`, `tags`, and `taxonomy_terms`) and `facets` (`tags`, `topics`).

## Notes

- Topic facet values are derived from taxonomy terms already assigned to published video posts; the API does not invent or auto-assign topics.
- Public results never include drafts, inactive posts or posts without video metadata.
- No schema migration was needed because normalized taxonomy and tags were introduced in earlier roadmap steps.
- No tests, builds, migrations or database operations were run.
