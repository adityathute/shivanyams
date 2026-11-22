# V3 Step 11 — Content metadata, tags, taxonomy and official-source management

**Scope:** Source-level audit and target data-contract design for reusable content metadata across all eight portal categories, including tags, government organizations, departments, locations, qualifications, official-source provenance and metadata validation.

**Audited branch and starting HEAD:** `adityathute/shivanyams` / `shiv-v3` — `ca68d7d7a446e1b82dad4397f150ec83fc6c412c`.

This step establishes the data model requirements and migration sequence. It does not introduce runtime models or migrations: the current migration graph already has parallel historical branches and requires a dedicated migration-integrity implementation step before schema expansion.

## 1. Existing shared metadata

The shared `Post` model currently contains:
- `organization_type`: a fixed choice field (central, state, district, local, PSU, university, bank, court, other).
- `location`, `state`, `country`: free-text fields; country defaults to India.
- `meta_keywords`: JSON list on Post.
- Multilingual title, summary, body and SEO title/description fields.
- Start, end and event dates.
- Featured image URL and publication metadata.

The current structure is sufficient for basic display but does not provide canonical reusable taxonomy identities, aliases, parent-child relationships, localized labels, or controlled values across posts.

## 2. Existing category-specific metadata

- Jobs: department, designation, recruitment type, qualifications, age criteria, application mode, organization type and official notification/website URLs. Job posts can carry per-post department and multilingual education details.
- Schemes: scheme type, beneficiaries, eligibility, benefits, required documents, application mode, application URL and official website.
- Examinations: exam type/mode, exam name, conducting authority, syllabus, pattern, instructions and official website.
- Admit cards: issuing authority, exam name, release/exam dates, download/login URLs and official website.
- Results: result type, examination name/date, result/merit/cut-off/scorecard URLs and official website.
- Articles and guides: article type, reading time, source name and source URL.
- Videos: provider, video/embed/thumbnail URLs, duration and available languages.
- Tools: category-specific tool metadata (not a reusable taxonomy).

These are useful category-specific fields but the same authority, department, exam, qualification or source can be entered repeatedly with different spelling and formatting.

## 3. Tags are currently keywords, not a taxonomy

- Post stores `meta_keywords` as JSON.
- PostEditor exposes a local tag input, splits comma-separated values, trims them and de-duplicates case-insensitively within the current editor session.
- The editor submits these values as `meta_keywords`.
- No Tag model, PostTag relation, canonical tag slug, multilingual tag label, alias registry, tag moderation/merge lifecycle or tag-specific API was identified.
- No backend tag normalization or global uniqueness contract was identified.

Consequences:
- Similar concepts can be stored as unrelated strings (for example abbreviations, spelling variants or English/Marathi/Hindi forms).
- Tags cannot be reliably browsed, counted, merged, moderated or reused as first-class entities.
- JSON keywords are convenient for SEO but are not a substitute for normalized content tags.

Recommendation: retain `meta_keywords` for SEO compatibility while introducing a separate normalized Tag taxonomy for editorial tagging. Do not silently reinterpret or delete existing keyword data.

## 4. Reusable taxonomy gaps

No reusable taxonomy entity models were found in `backend/apps/portal/models.py` beyond Category and fixed TextChoices. The following data is currently stored as free text, repeated values or fixed choices:

- Government authorities and organizations.
- Departments and ministries.
- Exam boards, conducting authorities and exam families.
- Job designations and recruitment classifications.
- Education qualifications and subject/discipline labels.
- Locations, state/district/city identities and geographic aliases.
- Scheme domains and beneficiary groups.
- Article topics and video topics.
- Official sources and publisher identities.

The Auth Organizations app is a separate tenant/workspace system; it should not be reused as a directory of government authorities or public-sector publishers. Portal content taxonomies must remain owned by the Portal service and must not introduce cross-database foreign keys into Auth.

## 5. Official-source provenance gaps

Current source-related fields are URLs and optional labels embedded in category details:
- JobDetails: official_notification_url and official_website.
- SchemeDetails, ExaminationDetails, AdmitCardDetails and ResultDetails: official_website plus category-specific action URLs.
- ArticleGuideDetails: source_name and source_url.
- PostLink and PostResource: arbitrary URLs; resources can be marked `official_link`.

No first-class source registry, source domain allowlist, source type, source ownership, verification status, verified timestamp, verifier identity, canonical source URL, source reliability history or per-post source evidence record was identified.

A URL being present or labeled official does not establish that it belongs to the issuing authority. The portal currently cannot reliably distinguish an official government notification from a third-party repost based on a structured provenance record.

## 6. Target normalized data contract

Introduce these Portal-owned entities in a later implementation/migration step:

### Taxonomy
- **TaxonomyType:** stable key, localized display names, description, active flag and whether hierarchy is allowed.
- **TaxonomyTerm:** taxonomy type, stable slug/code, localized labels/descriptions, optional parent term, active flag, sort order and timestamps.
- **TaxonomyAlias:** normalized alias, language, target term and uniqueness within the taxonomy type.
- **PostTaxonomyTerm:** Post, taxonomy term, relation role (topic, department, authority, qualification, location, scheme domain, exam family, etc.), primary flag and sort order.

Enforce uniqueness of a term's stable key/slug within its taxonomy type, prevent self-parenting and cycles, validate parent and child taxonomy types, and prevent duplicate Post-term-role assignments.

### Tags
- **Tag:** canonical slug, localized labels, optional description, moderation state, active state and timestamps.
- **TagAlias:** normalized alias and language, unique within the relevant tag namespace.
- **PostTag:** Post, Tag, optional assignment source/actor and timestamps; unique Post/Tag pair.

Use explicit alias normalization (Unicode normalization, whitespace folding and case folding) while preserving original localized labels. Avoid destructive transliteration of Marathi/Hindi names into the canonical display value.

### Organizations and departments
Represent public authorities as taxonomy terms initially, with explicit taxonomy types and external identifiers where known. If later requirements need rich organization profiles (official domains, parent ministry, jurisdiction, contact details), promote them into dedicated Portal-owned directory entities without coupling them to Auth tenant organizations.

### Locations
Use stable country/state/district/city identifiers and parent-child relationships, with localized names and aliases. Keep the existing Post free-text fields during transition; map only confidently resolved values. Preserve raw source wording for editorial review when mapping is ambiguous.

### Official sources
- **OfficialSource:** source name, source type, canonical domain, allowed URL patterns (where appropriate), jurisdiction, owning authority taxonomy term, active status and verification metadata.
- **PostSource:** Post, OfficialSource, exact source URL, source role (notification, application, result, reference, article citation), source publication date, checked-at timestamp, verification status, verifier identity, evidence note and optional content checksum.

Do not treat domain matching alone as complete verification: use HTTPS and normalized host checks, explicit approved-domain rules, redirect-aware validation, and human review for ambiguous or newly submitted sources. Never fetch arbitrary submitted URLs from the application server without SSRF protections.

## 7. API and editor contract requirements

- Expose read-only taxonomy endpoints with type, localized labels, aliases and parent/child navigation.
- Provide authenticated/admin endpoints for taxonomy term create/update/merge/deactivate and tag moderation.
- Use stable IDs in write payloads; labels are presentation values, not foreign-key substitutes.
- Provide server-side validation that taxonomy terms match the expected taxonomy type for a given relation role.
- Add source registry lookup and PostSource create/update endpoints with role and verification state.
- Keep legacy text/URL fields readable during a staged migration; define one canonical write path before deprecating duplicates.
- Update PostEditor to use searchable taxonomy pickers, allow controlled creation requests where permitted, and clearly show source verification state.
- Keep free-text notes where real-world source wording cannot be mapped to a controlled term.
- Ensure public serializers expose only active public taxonomy labels and safe source metadata; never expose private verifier notes or internal moderation details.

## 8. Data migration and compatibility plan

1. Resolve and document the existing Portal migration graph before creating new schema migrations.
2. Add taxonomy/tag/source tables without changing current Post or category-detail columns.
3. Backfill SEO keywords into Tag only after normalization and collision review; retain original `meta_keywords`.
4. Build a reviewed mapping from existing free-text organization, department, location, qualification and exam authority values to taxonomy terms.
5. Leave ambiguous values unmapped and preserve their original text.
6. Create PostTaxonomyTerm and PostTag associations in idempotent batches with audit counts.
7. Backfill source records only where source identity and official status can be established; do not infer verification from URL labels.
8. Introduce dual-read/controlled-write compatibility, reconcile counts and duplicates, then switch public/admin consumers.
9. Deprecate legacy fields only in a later explicitly approved breaking-change step, after all consumers and historical records are accounted for.

## 9. Integrity, governance and performance controls

- Stable taxonomy keys and normalized aliases must have database uniqueness constraints.
- Prevent taxonomy hierarchy cycles in service validation and provide safe handling for concurrent parent changes.
- Restrict taxonomy/source management to authorized editorial roles; public users receive read-only active terms.
- Record who created, changed, merged, verified or deactivated taxonomy and source records.
- Prefer deactivation/merge with redirects over hard deletion when terms are already referenced.
- Add indexes for taxonomy type/active/parent, normalized alias lookup, Post-tag and Post-term reverse lookups, source domain/status and Post-source role.
- Add pagination and bounded query sizes to taxonomy endpoints.
- Cache public taxonomy responses with explicit invalidation/versioning after editorial changes.
- Protect URL verification against private IPs, localhost, DNS rebinding, redirects to private networks, unsafe schemes, oversized responses and timeouts.
- Add duplicate suggestions using normalized names and aliases, but require editorial confirmation before merging.

## 10. Step outcome and verification boundary

**Completed:** Existing metadata and category-specific field inventory; tag storage/editor behavior audit; taxonomy and source-registry gap analysis; target entities, API contract, migration/backfill plan, governance and security requirements documented.

**Not implemented in this step:** No models, serializers, endpoints, admin UI, migration files, backfills or runtime behavior changed. This is intentional: schema expansion should follow a separate migration-integrity step and an explicit implementation sequence so existing production data and legacy content remain safe.

No tests, builds, database connections, live data queries, migrations, URL fetches or source verification were performed.
