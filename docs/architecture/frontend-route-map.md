# ShivanyaMS Frontend Route and Layout Map

Branch: `shiv-v3`
Audit step: 2 of 143
Scope: frontend routes, layouts, shared application shell, and route-level composition.
Source: repository tree and source files inspected on the `shiv-v3` branch.

## 1. Route inventory

The current App Router contains 34 `page.tsx` routes.

| Area | Route | Purpose / route type |
|---|---|---|
| Home | `/` | Homepage |
| Jobs | `/jobs` | Jobs listing |
| Jobs | `/jobs/[slug]` | Job detail |
| Jobs | `/jobs/related/[filterType]/[slug]` | Related jobs |
| Schemes | `/schemes` | Schemes listing |
| Schemes | `/schemes/[slug]` | Scheme detail |
| Guides | `/guides` | Guides listing |
| Guides | `/guides/[slug]` | Guide detail |
| Admit cards | `/admit-cards` | Admit-card listing |
| Admit cards | `/admit-cards/[slug]` | Admit-card detail |
| Examination | `/examination` | Examination listing |
| Examination | `/examination/[slug]` | Examination detail |
| Examination | `/exams` | Additional exams page |
| Examination | `/batch-examination` | Batch examination page |
| Results | `/results` | Results listing |
| Results | `/results/[slug]` | Result detail |
| Videos | `/videos` | Videos listing |
| Videos | `/videos/[slug]` | Video detail |
| Tools | `/tools` | Tools listing |
| Tools | `/tools/[slug]` | Tool detail |
| Account | `/saved` | Saved content |
| Admin | `/admin` | Admin overview and content dashboard |
| Admin | `/admin/add-content` | Add general content |
| Admin | `/admin/add-post` | Add a post |
| Admin | `/admin/edit-post/[kind]/[slug]` | Edit a post |
| Admin | `/admin/preview/[kind]/[slug]` | Post preview |
| Admin | `/admin/comments` | Comments and reports moderation |
| Admin | `/admin/engagement/[postId]` | Post engagement details |
| Information | `/about` | About |
| Information | `/contact` | Contact |
| Information | `/feedback` | Feedback |
| Legal | `/privacy` | Privacy policy |
| Legal | `/terms` | Terms |
| Legal | `/disclaimer` | Disclaimer |

## 2. Layout and rendering structure

There is one App Router layout:

- `src/app/layout.tsx`
  - Reads the `shivanya-language` and `shivanya-theme` cookies on the server.
  - Validates the initial language against English, Marathi, and Hindi.
  - Sets the document language, theme, and color scheme.
  - Imports `globals.css` and `portal-base.css`.
  - Wraps all routes in `PortalLayout`.

Shared application shell:

- `src/components/portal/layout/PortalLayout.tsx`
  - `AuthProvider` in cookie mode.
  - `PortalAuthProvider`.
  - `PortalDataProvider`.
  - `PortalLanguageProvider`.
  - `PortalShell`.
- `PortalShell` uses the SDK `DashboardShell`.
- Header: `PortalHeader`.
- Sidebar navigation: `getPortalNavigation` from `PortalSidebar.tsx`.
- Sidebar/mobile footer slot: `SiteMobileFooter`.
- Main footer component: `PortalFooter`, used by homepage composition.

Provider nesting, outer to inner:

```text
RootLayout
└── PortalLayout
    └── AuthProvider
        └── PortalAuthProvider
            └── PortalDataProvider
                └── PortalLanguageProvider
                    └── PortalShell
                        └── DashboardShell
                            ├── PortalHeader
                            ├── PortalSidebar navigation
                            ├── SiteMobileFooter slot
                            └── Current route page
```

## 3. Frontend application areas

- Public content: jobs, schemes, guides, admit cards, examination, results, videos, and tools.
- User area: saved content and account controls in the shared header.
- Administration: content dashboard, content creation/editing/preview, comments/reports, and engagement details.
- Informational pages: about, contact, and feedback.
- Legal pages: privacy, terms, and disclaimer.
- Shared platform services: authentication, language, content data, navigation, visitor tracking, and API access.

## 4. Shared frontend modules

- `src/components/portal/layout/`: shared shell, header, sidebar, and footer.
- `src/components/portal/context/`: authentication modal coordination and language state.
- `src/components/portal/data/portal-data.tsx`: shared portal data context and content types.
- `src/components/portal/category/`: category metadata and API URL helpers.
- `src/components/portal/home/`: homepage sections.
- `src/components/admin/`: admin-specific reusable components such as the post editor.
- `src/lib/authenticated-fetch.ts`: authenticated API request helper.
- `src/i18n/dictionaries/`: translation dictionaries.
- `src/styles/shared/`: shared styles.

## 5. Findings to address in later steps

1. All routes currently share one root layout; there are no separate route-group layouts.
2. The route tree has no dedicated `loading.tsx`, `error.tsx`, `not-found.tsx`, or nested `layout.tsx` files. Add these only where they improve actual route behavior.
3. Admin pages perform client-side role checks and redirect non-admin users. Backend authorization must remain the security boundary and will be audited separately.
4. The homepage ticker constructs some paths that do not match the current App Router folders:
   - It constructs `/admit-card/[slug]`, while the route is `/admit-cards/[slug]`.
   - It constructs `/articles/[slug]`, while the route is `/guides/[slug]`.
   - It constructs `/examinations/[slug]`, while the route is `/examination/[slug]`.
   These are candidates for correction in a later dedicated route/link step; they were not changed during this inventory.
5. `PortalShell` records public route views and deliberately skips paths beginning with `/admin`. Visitor collection, consent/privacy handling, and backend event processing will be reviewed in the analytics/data-collection steps.
6. The shared shell currently wraps admin routes as well as public routes. Any future admin-specific shell separation must preserve existing navigation and authentication behavior.

## 6. Scope and verification

This step documents the current frontend route and layout architecture. No route behavior, API contract, CSS, or source component was changed.

No tests, builds, or runtime checks were run. This inventory is based on the tracked GitHub tree and inspected source files on `shiv-v3`.
