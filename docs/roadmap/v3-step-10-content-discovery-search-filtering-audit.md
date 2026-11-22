# V3 Step 10 — Content discovery, search, filtering and categorization audit

**Scope:** Source-level audit of public category feeds, content detail lookup, category metadata, search/filter/sort/pagination behavior, related-job discovery, admin content discovery, API filter configuration and search-oriented indexes.

**Audited branch and starting HEAD:** `adityathute/shivanyams` / `shiv-v3` — `91426074d1c25d2997dc9874a5ce118168355751`.

No runtime code, content records, schema, migrations or database data were changed.

## 1. Category and route normalization

- Backend supports eight content kinds: jobs, schemes, examination, admit-card, results, articles, videos and tools.
- Explicit aliases map `admit-card` to Category slug `admit-cards` and `articles` to `articles-guides`.
- Category lookup rejects unknown kinds and requires the Category row to be active.
- Category metadata endpoint returns active categories ordered by `sort_order` and `name_en`.
- Frontend normalizes the category aliases and separately maintains a fixed eight-category display order.
- CategoryGrid filters out inactive categories and categories without a known frontend configuration.

Risk: category identity/aliases are duplicated in backend and frontend constants. Adding or renaming a category requires coordinated updates; drift can make an active backend category invisible or cause an unknown kind.

## 2. Public content feed and detail discovery

- Public feed route: `content/<kind>/`; detail route: `content/<kind>/<slug>/`.
- Public queryset is restricted to the resolved active Category, PUBLISHED status, non-null published_at and active Post.
- Feed/detail querysets select category and job details and prefetch common nested content, related posts and job subrecords.
- Detail lookup uses the globally unique Post slug within the category-scoped queryset.
- Public endpoint is a ReadOnlyModelViewSet. No per-view `search_fields`, `filterset_fields`, `filterset_class` or explicit `ordering_fields` were found on this viewset.
- The global DRF configuration installs DjangoFilterBackend, SearchFilter and OrderingFilter, but installing filter backends does not itself define useful search/filter fields. The public content viewset does not configure those fields.

**Finding — public API discovery parameters are not a documented contract:** Search, date/status filters, tag/organization filters and ordering are not explicitly declared on PublicContent. Client-supplied query parameters should not be assumed to work as discovery filters.

## 3. Frontend category search

CategoryPage:
- Uses the shared PortalData context's `data.items` collection.
- Filters to the current category type in memory.
- Search matches the displayed item title, category label and description using case-insensitive substring matching.
- Sorts results by the item's date descending.
- Shows the filtered result count and a localized empty state.
- The search form prevents native submission; typing updates local state immediately.

Limitations:
- Search is limited to the already-loaded client-side item collection; it is not a server-side search request.
- It does not explicitly search full article body, multilingual alternate titles, tags, organization, location, eligibility, department, qualification, exam board, notification number or other category-specific fields.
- No server-driven filter facets, date range, location, state, organization, job type, qualification, deadline or category-specific filters are exposed in this page.
- No URL query-state persistence, shareable filter links or explicit debounce/request cancellation for remote search is present because this search is local.
- Client-side date sorting depends on the date value provided by the shared data layer; missing or inconsistent dates can produce unstable ordering.
- The search button is a submit affordance but submission only prevents the default form action; actual behavior is driven by input changes.

## 4. Related jobs discovery

- RelatedJobsPage reads the same shared PortalData collection.
- It filters jobs in memory by organization_type or tags, using a normalized slug comparison.
- Results are displayed with count, localized labels and links to job detail pages.
- No server-side related-jobs endpoint, pagination, sorting control or facet count API was found in this route.
- The route derives its display label from the filtered jobs, so an empty result falls back to a humanized URL slug.

Risk: related-job result completeness depends on how much job data the shared client data provider has loaded. This approach becomes expensive and incomplete if the provider is bounded/paginated or the catalogue grows substantially.

## 5. Pagination and query performance

Backend global DRF policy:
- Page-number pagination, default 20 records.
- Client may request `page_size`; maximum is 100.
- Global filter backends are DjangoFilterBackend, SearchFilter and OrderingFilter.

Public category feeds inherit the default pagination policy unless explicitly overridden; category metadata explicitly disables pagination.

Admin content:
- Each category-specific AdminContent queryset returns all statuses within that category and prefetches nested content.
- Admin dashboard requests all eight category endpoints in parallel.
- It follows every DRF `next` URL and accumulates every page into browser memory.
- Search, category/status/active/date filters, sorting and pagination are then applied client-side.
- Admin pagination therefore does not bound the total amount fetched or held in memory. Each category may generate multiple sequential page requests; the dashboard's eight category fetches run concurrently.

**Performance risk:** As content grows, the admin dashboard downloads every post and its nested metadata before showing a filtered page. This increases API work, response bytes, browser memory, initial load time and risk of partial dashboard failure.

**Public performance risk:** Public page discovery currently depends on shared frontend data loading rather than explicit server-side search/filter contracts. The category feed prefetches substantial nested data for every row, which can be wasteful for list cards if the shared provider uses full PostSerializer payloads.

## 6. Search indexes and data model

- Post has a globally unique slug and indexes for category/status/published_at, status/created_at, owner/status, featured/status and organization_type/status.
- These indexes support core category/status/featured/organization lookups.
- No dedicated full-text search vector, trigram index, normalized search document, multilingual search index or explicit tag index was identified in the reviewed Post schema.
- Tags appear in frontend job data and are used for related-job filtering, but a normalized backend tag/facet model and indexed query contract were not confirmed.
- A B-tree index on status/date does not provide efficient arbitrary substring search across title/summary/body. Search at scale needs a deliberate strategy (PostgreSQL full-text/trigram or a dedicated search service) and measured query plans.
- No database EXPLAIN, representative data benchmark or index-usage statistics were collected.

## 7. Admin discovery behavior

- Admin dashboard gathers all category endpoints and combines the results.
- Search fields: English title, Marathi title and slug.
- Filters: category, status, active/inactive and updated-within period.
- Sorts: newest/oldest creation, newest/oldest update, title, views and unique visitors.
- Pagination is browser-side after all category pages are loaded.
- The backend AdminContent viewset has no explicit search/filter/order field declarations in its class source; the admin dashboard implements its own client-side search/filter logic.

Gaps:
- Hindi title and multilingual summary/body are not searched.
- Search does not cover author/owner, organization, tags, external notification identifiers or detail-model fields.
- There is no backend query contract for search/filter/order, so the dashboard cannot request only the current page or server-filtered results.
- The dashboard performs eight category requests even when the user selects a single category filter.

## 8. Recommended target architecture

1. Publish one canonical category registry or shared generated contract for category slugs, aliases, display names and supported filters.
2. Add explicit public API search contract: `search`, `ordering`, `page`, `page_size` and validated category-specific filters.
3. Search only public-eligible records; never allow query parameters to expose drafts, inactive posts or unpublished related targets.
4. Use serializer-safe allowlists for filter and ordering fields; do not expose arbitrary ORM field ordering.
5. Build category-aware filter facets (location/state, organization, job type, qualification, deadline, exam board, scheme type, result year, resource type) only where the category has the corresponding data.
6. Implement a backend search service with normalized multilingual text and defined tokenization/partial-match behavior. Select PostgreSQL full-text/trigram or a search engine after data-volume and language requirements are measured.
7. Add indexed normalized tags and organization taxonomy where they are first-class discovery dimensions.
8. Use lightweight list serializers and separate detail serializers so list queries do not prefetch/serialize every nested detail collection.
9. Move admin search, filters, ordering and pagination to the API; request only the active category/filter/page and avoid downloading the full catalogue.
10. Preserve search and filter state in URL query parameters, support debounced requests, abort stale requests and provide consistent empty/loading/error states.
11. Add deterministic tie-breaker ordering (for example published_at then id) to avoid records moving between pages when timestamps match.
12. Add query-plan and performance checks for realistic catalogue sizes, including concurrent category/admin access.

## 9. Verification boundary

- Inspected Portal public/admin viewsets, route registrations, global DRF settings, pagination class, Post/Category indexes, CategoryPage, CategoryGrid, RelatedJobsPage and admin dashboard discovery logic.
- Source-level review only; no live database, query plans, production content, browser runtime or search service was inspected.
- No tests, builds, migrations, database queries, indexing changes or runtime code changes were performed.
- Findings must be confirmed with API contract tests and representative-data performance tests during the authorized testing phase.
