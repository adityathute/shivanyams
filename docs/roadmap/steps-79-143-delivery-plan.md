# Content, AI, SEO, analytics and operations plan — Steps 79–143

This document records the current repository evidence and the safe delivery boundaries for the final roadmap phases. It distinguishes existing code from proposed work; a planned capability is not considered implemented until its backend contract, authorization, persistence and operational behavior exist.

## Phase 6 — Content and publishing (79–93)

### Current implementation found
- `Post` and category-specific detail models support jobs, schemes, examinations, admit cards, results, articles, videos and tools.
- Public content APIs return published/active posts.
- Admin content APIs create, retrieve, update and delete posts by content kind.
- New content is created as draft.
- Review endpoint records status transitions in `PostStatusHistory`.
- Content serializers and PostEditor provide structured content editing.
- Comments support parent/reply relationships, status moderation, reactions and reports.
- Newsletter and per-post subscriptions exist.

### Gaps to close
1. Separate editorial roles from global platform admin role.
2. Define a typed rich-content/media schema and sanitize HTML/URLs server-side.
3. Add explicit autosave draft endpoint with optimistic concurrency/version token.
4. Add scheduled publication worker and timezone policy; a date field alone is not scheduling.
5. Define reviewer assignment, approval requirements and conflict-of-interest rules.
6. Add immutable revision snapshots and restore-as-new-version.
7. Add safe archive/restore semantics distinct from hard delete.
8. Add public related-content scoring with category/tag constraints.
9. Add bounded server-side content search and filters.
10. Enforce reply parent belongs to the same post; enforce maximum nesting depth in service logic.
11. Define report lifecycle, moderator notes, reviewer identity and immutable moderation events.
12. Enforce content ownership/object permissions on every write.

Do not claim autosave, scheduling, revision history, or a full editorial workflow until persisted and transactionally enforced.

## Phase 7 — AI architecture (94–111)

### Current SDK state
The SDK contains `packages/ai` with a minimal `ShivanyaAI.chat()` client that posts to `/api/ai/chat`. The Portal repository does not currently expose a confirmed AI endpoint/provider implementation. The SDK client alone is not an AI platform.

### Recommended architecture
- Provider adapter interface behind a server-only service; never expose provider secrets to browser bundles.
- Model registry with provider, model, capabilities, active state, cost metadata and rollout policy.
- Separate product workflows: visitor assistant, admin assistant, content drafting, summarization, translation, SEO suggestions and internal knowledge Q&A.
- Server-side authorization and data-source allowlists for each workflow.
- Retrieval over published/approved content only for visitor Q&A; draft/private/admin content must never leak into public retrieval.
- Citations must point to canonical public URLs and identify source documents actually used.
- Structured output schemas, input/output size caps, timeouts, retries with bounded backoff and provider fallback policy.
- Per-user/IP/org rate limits, token budgets, spend caps, abuse detection and usage ledger.
- Prompt-injection defense: retrieved content is untrusted data; no tool/action execution from content instructions.
- Feedback and quality signals with privacy-aware retention; redact credentials, personal data and sensitive account fields from logs.
- Human review before AI-generated content can be published.
- Feature flags and provider kill switch for incidents.

### Workflow rules
- Visitor assistant can access only public published content.
- Admin assistant requires explicit admin permission and only sees records the acting admin is authorized to access.
- Draft generation never auto-publishes.
- Translation preserves source links and factual fields; it must be reviewed before publication.
- SEO recommendations are advisory and must not silently alter canonical metadata.
- Cost/usage checks happen before provider calls and are enforced server-side.

## Phase 8 — SEO and discovery (112–127)

### Current state
The Next.js root layout currently sets only a basic title and description. No App Router `robots.ts` or `sitemap.ts` file was found in the current tree. There is no confirmed Search Console/Bing integration or SEO analytics pipeline in the repository.

### Required implementation
- Per-page metadata from canonical content records; localized titles/descriptions for en/mr/hi.
- Canonical URL policy for language, pagination, query parameters and duplicate slugs.
- Dynamic XML sitemap with only published/active canonical URLs, last-modified dates, and sitemap index when volume requires.
- robots policy that blocks private/admin/authenticated routes while allowing public content.
- JSON-LD only where page data supports it (Article, JobPosting, BreadcrumbList, Organization); never invent salary, dates or employer fields.
- Open Graph/Twitter metadata and stable social image fallbacks.
- Slug change redirects with collision checks and permanent redirect history.
- Crawlable pagination and internal links; avoid client-only navigation as the sole discovery path.
- Core Web Vitals baseline and image/font optimization.
- Search Console/Bing verification ownership and submission via environment-managed credentials.
- Crawl/index diagnostics, sitemap error tracking and noindex/canonical conflict monitoring.
- SEO analytics should distinguish impressions, clicks and on-site search from page views.
- AI SEO recommendations must be grounded in page content and require approval.

Do not index drafts, pending review, private admin routes, filtered query permutations, or soft-deleted posts.

## Phase 9 — Analytics and operations (128–135)

### Existing analytics
Portal has website visitor/view records, post visitor/view records, engagement models, admin dashboard statistics, website analytics and post engagement details. These are first-party event records, not a complete central analytics/operations platform.

### Required controls
- Define metric semantics (unique visitor, session, page view, engagement) and version the definitions.
- Add configurable retention, deletion/anonymization jobs and data-export policy.
- Minimize IP and user-agent collection; document purpose, access, retention and consent requirements.
- Prevent analytics endpoints from trusting client-supplied user IDs or arbitrary forwarded IP headers.
- Add event deduplication/idempotency and bounded ingestion/rate limits.
- Build date-range reports and safe CSV exports with role-based access and audit.
- Add structured request IDs, correlation IDs, error rates and latency metrics.
- Health checks should distinguish liveness from dependency readiness and avoid exposing secrets.
- Backups require encryption, offsite storage, restore drills and retention rotation; a backup command alone is not a recovery plan.
- Deployment needs environment separation, secret rotation, migration preflight, health gates and rollback instructions.

## Phase 10 — SDK/Auth alignment and handover (136–143)

### Current repository relationship
- SDK branch `sdk-v3` currently contains the reusable Core, AI, UI, Shell and Auth packages.
- Portal consumes packed SDK tarballs; its CI workflow currently pins an older SDK commit.
- Auth backend owns identity/session authority; Portal relies on its authenticated identity and admin role contract.
- SDK AI client targets `/api/ai/chat`, but no matching Portal endpoint was found in the current API route tree.

### Alignment requirements
1. Publish package versions only after CI build/test and changelog.
2. Pin exact SDK commit or immutable package versions in Portal CI; never silently track a moving branch.
3. Maintain API compatibility fixtures for cookie mode, CSRF, refresh, logout, profile and role payloads.
4. Keep token mode opt-in and document its threat model; browser token storage must not become the default.
5. Use one shared permission-code contract and remove role-slug assumptions only after coordinated rollout.
6. Add compatibility tests for every supported Auth/SDK API response shape.
7. Establish privacy/data-retention matrix for account, analytics, comments, reports, AI prompts and generated content.
8. Review financial calculations against authoritative billing records and decimal arithmetic.
9. Create release, migration, backup restore, incident and rollback runbooks.
10. Final handover must list tested commit SHAs, known gaps, required environment variables, manual verification steps and rollback points.

## Step-by-step delivery status

| Steps | Status in current repository |
|---|---|
| 79–93 | Core content, review, comments and reactions exist; advanced CMS lifecycle items remain gaps |
| 94–111 | SDK AI client exists; server provider, retrieval, policy, budgets and workflows remain unimplemented |
| 112–127 | Basic root metadata exists; technical SEO generation and webmaster integrations remain gaps |
| 128–135 | First-party portal analytics exists; privacy lifecycle and operational recovery remain gaps |
| 136–139 | SDK packages and Auth integration exist; pinned commit and permission/API contract alignment need work |
| 140–143 | Security docs exist; full retention, financial, release and testing handover still require execution |

No production data migration, backup, deployment, external provider connection, or test/build is performed by this documentation pass.
