# V3 Step 2 — Frontend Route, Page, Component and Workflow Map

**Status:** Completed (source inventory and route-to-component mapping)  
**Roadmap:** 270 steps  
**Branch:** `adityathute/shiv-v3`  
**Date:** 2026-11-22  
**Step 1 reference:** `docs/roadmap/v3-step-01-platform-audit.md`

## 1. Scope and method

Inspected the recursive Portal repository tree and the Next.js App Router page/layout entry files. The route map below reflects source files present in `src/app`; it is not a claim that every route has been browser-tested or that every linked API operation is working.

Inventory:
- 35 App Router route/layout files: 34 page entry files and one root layout.
- 106 files under `src/components` (a mixture of TSX, CSS and supporting config/hooks; not 106 React components).
- Root page renders the shared HomePage.
- Root layout initializes language/theme from cookies and wraps the site in PortalLayout.
- The public site supports English, Marathi and Hindi through the i18n package and local dictionaries.

## 2. Complete App Router route inventory

| URL pattern | Route entry file | Current page/component |
|---|---|---|
| `/` | `src/app/page.tsx` | `HomePage` |
| `/jobs` | `src/app/jobs/page.tsx` | `JobsPage` |
| `/jobs/[slug]` | `src/app/jobs/[slug]/page.tsx` | `PortalPostDetail(category="jobs")` |
| `/jobs/related/[filterType]/[slug]` | `src/app/jobs/related/[filterType]/[slug]/page.tsx` | `RelatedJobsPage` |
| `/schemes` | `src/app/schemes/page.tsx` | `SchemesPage` |
| `/schemes/[slug]` | `src/app/schemes/[slug]/page.tsx` | `PortalPostDetail(category="schemes")` |
| `/examination` | `src/app/examination/page.tsx` | `ExaminationPage` |
| `/examination/[slug]` | `src/app/examination/[slug]/page.tsx` | `PortalPostDetail(category="examination")` |
| `/admit-cards` | `src/app/admit-cards/page.tsx` | `AdmitCardsPage` |
| `/admit-cards/[slug]` | `src/app/admit-cards/[slug]/page.tsx` | `PortalPostDetail(category="admit-cards")` |
| `/results` | `src/app/results/page.tsx` | `ResultsPage` |
| `/results/[slug]` | `src/app/results/[slug]/page.tsx` | `PortalPostDetail(category="results")` |
| `/videos` | `src/app/videos/page.tsx` | `VideosPage` |
| `/videos/[slug]` | `src/app/videos/[slug]/page.tsx` | `PortalPostDetail(category="videos")` |
| `/guides` | `src/app/guides/page.tsx` | `GuidesPage` |
| `/guides/[slug]` | `src/app/guides/[slug]/page.tsx` | `PortalPostDetail(category="guides")` |
| `/tools` | `src/app/tools/page.tsx` | `ToolsPage` |
| `/tools/[slug]` | `src/app/tools/[slug]/page.tsx` | `PortalPostDetail(category="tools")` |
| `/saved` | `src/app/saved/page.tsx` | `SavedPostsPage` (via saved page component) |
| `/admin` | `src/app/admin/page.tsx` | Admin dashboard |
| `/admin/add-content` | `src/app/admin/add-content/page.tsx` | Admin content creation |
| `/admin/add-post` | `src/app/admin/add-post/page.tsx` | Admin post creation/editor |
| `/admin/comments` | `src/app/admin/comments/page.tsx` | Admin comment moderation |
| `/admin/edit-post/[kind]/[slug]` | `src/app/admin/edit-post/[kind]/[slug]/page.tsx` | Admin post editing |
| `/admin/engagement/[postId]` | `src/app/admin/engagement/[postId]/page.tsx` | Post engagement detail |
| `/admin/preview/[kind]/[slug]` | `src/app/admin/preview/[kind]/[slug]/page.tsx` | Admin content preview |
| `/about` | `src/app/about/page.tsx` | About page |
| `/contact` | `src/app/contact/page.tsx` | Contact page |
| `/feedback` | `src/app/feedback/page.tsx` | Feedback page |
| `/disclaimer` | `src/app/disclaimer/page.tsx` | Disclaimer page |
| `/privacy` | `src/app/privacy/page.tsx` | Privacy page |
| `/terms` | `src/app/terms/page.tsx` | Terms page |
| `/exams` | `src/app/exams/page.tsx` | Additional exams route |
| `/batch-examination` | `src/app/batch-examination/page.tsx` | Batch examination route |

Root layout:
- `src/app/layout.tsx` — reads `shivanya-language` and `shivanya-theme` cookies, defaults language to English and theme to light, and wraps children in `PortalLayout`.

## 3. Shared frontend component architecture

### Application shell
- `PortalLayout` and `PortalShell.css`: shared page frame.
- `PortalHeader`: global header/navigation entry.
- `PortalSidebar`: category/site navigation.
- `PortalFooter` and `SiteMobileFooter`: desktop/mobile footer structures.
- `PortalLanguageContext`, `PortalAuthContext`, `LanguageDropdown`: language and auth state integration.

### Homepage
- `HomePage`: homepage composition.
- `HeroSection`: top/hero area.
- `UpdatesSection`: update/content section.
- `CategoryGrid` and category configuration: category navigation/data mapping.
- Important-links config/hook: external and priority links.

### Category listing pages
- Dedicated listing page components exist for Jobs, Schemes, Examination, Admit Cards, Results, Videos, Guides and Tools.
- Category page/grid components provide shared category rendering.
- Character/illustration components exist for the category families.
- Listing styles are split into category-specific CSS files.

### Shared content detail and engagement
- `PortalPostDetail`: shared post detail rendering across category routes.
- `PortalContentNotFound` and not-found recommendations config: missing-content handling.
- `PostFAQSection`, `PostCommentsSection`, `PostEngagementActions`: shared detail sections.
- `NewsletterSubscribeButton`: newsletter subscription action.
- Saved-post components render the saved content area.

### Admin UI
- `PostEditor`: shared content editing surface.
- Admin route pages cover dashboard, add/edit/preview, comments and engagement.
- Admin utilities are local to the admin route group.

### Static pages
- Dedicated About, Contact, Disclaimer, Feedback, Privacy and Terms page components and styles exist.

### Other page families
- Related jobs page.
- Video sections and video character assets.
- Tools and category character/illustration assets.
- Animated scene components (banyan tree, birds, clock, clouds, government building, terrain, moon, stars and sun).

## 4. User workflow map (source-level)

| User journey | Entry points | Shared components / operations to verify in later phases |
|---|---|---|
| Discover latest updates | Home `/` | Hero, update feed, category grid, important links |
| Browse a category | Eight category listing routes | Listing filters, pagination, API category mapping, language and empty/error states |
| Read a post | Eight dynamic detail routes | Post detail, dates, resources, links, FAQs, related content, view tracking |
| Find related jobs | `/jobs/related/[filterType]/[slug]` | Filter parsing, ownership/category constraints, related-job query and empty state |
| Save/unsave content | `/saved` and post detail | Auth state, saved-post API, duplicate handling, unauthenticated behavior |
| Engage with a post | Post detail | Reactions, comments/replies, reports, shares and subscriptions |
| Subscribe to newsletter | Shared content/footer placement | Email validation, duplicate subscription, consent and delivery operations |
| Create/manage portal content | Admin add-content/add-post | Role gate, category mapping, validation, related records and draft save |
| Edit/review/publish content | Admin edit/preview/dashboard | Status transition permissions, audit history, scheduling, preview and publish |
| Moderate comments | `/admin/comments` | Reports, review actions, moderation permissions and audit |
| Inspect engagement | `/admin/engagement/[postId]` | Aggregation, privacy limits and authorized access |
| Contact the organization | `/contact` | Server-side form endpoint, spam controls, delivery and admin tracking |
| Send feedback | `/feedback` | Validation, abuse controls, storage and review workflow |
| Read legal information | About, Disclaimer, Privacy, Terms | Accurate legal copy, language coverage and last-updated policy |

This is a workflow map inferred from the route/component structure. Each action must be checked against actual API behavior and authorization in its dedicated implementation phase.

## 5. Route and architecture observations

1. **Shared detail route strategy:** eight categories reuse `PortalPostDetail`. This reduces duplication but makes the category-to-API/detail-model mapping a high-impact contract. Keep category configuration centralized and validate every kind.
2. **Potential route taxonomy aliases:** both `/examination` and `/exams` exist; `/batch-examination` is a separate route. Decide whether these are intentional destinations, legacy aliases or separate workflows before changing URLs.
3. **Guides naming:** public route uses `/guides`, while the earlier admin mapping uses `articles`. Define an explicit compatibility map; do not rename persisted category slugs casually.
4. **Admin coverage is incomplete relative to full platform goals:** current route tree has seven admin page entry points. User/organization/subscription/billing/site settings/operations workspaces are not represented in this App Router inventory.
5. **Static pages are present:** FAQ/help, accessibility statement, careers, press/media, cookie preferences and other support pages are not present as top-level route entries in this inventory. Add only where product requirements confirm they are needed.
6. **Route-level metadata:** inspected root layout has global metadata; route-specific metadata coverage is a later SEO task.
7. **No route-level loading/error/not-found entry files** were found by the route-file inventory pattern. This does not rule out component-level loading or fallback states.
8. **No route was exercised in a browser.** Existence in Git does not prove runtime success.

## 6. Recommended route verification checklist for later implementation

For each public listing/detail route:
- Confirm the canonical category slug and API content-kind mapping.
- Confirm public visibility: only active, published and currently eligible content is exposed.
- Confirm pagination/filter/search parameters are validated and bounded.
- Confirm localized title/body/labels and sensible fallback behavior.
- Confirm not-found, server-error, empty and loading states.
- Confirm page metadata, canonical URL and structured data.
- Confirm links, dates, resources, files and external URLs are safe and correct.
- Confirm view analytics do not leak personal data.

For each admin route:
- Confirm server-side permission enforcement for every read/write action.
- Confirm organization/tenant scope where content belongs to an organization.
- Confirm validation and safe error responses.
- Confirm audit events for sensitive mutations.
- Confirm no hidden admin data is exposed through client bundles or public APIs.

For Contact/Feedback:
- Confirm backend persistence/delivery, rate limits, spam protection, consent and admin handling.

## 7. Deliverables and boundaries

- Added this route/page/component/workflow map only.
- No existing application route or component was changed.
- No V2/master branch was touched.
- No tests, builds, migrations, database access or production operations were performed.
- Step 3 should map backend apps, models, serializers, services, API endpoints and data ownership against this frontend route inventory.
