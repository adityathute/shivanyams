# Administration platform review — Steps 57–78

## Existing administration surface

### Access control

- Portal API admin views use `IsPortalAdmin`, which requires an authenticated Auth identity with the global `admin` role.
- The Next.js `/admin` pages independently check the Auth user's `roles` for `admin`.
- Auth administrative user and role list APIs use permission codes (`users.read`, `roles.read`) and permit superusers.
- Django's built-in `/admin/` is a separate staff/superuser session surface. It must not be treated as equivalent to the external Auth role gate.

The current Portal admin role check is a coarse global role. It is not a per-module permission matrix. Do not expose staff access by simply adding a role slug without defining action-level permissions.

## Feature inventory

| Roadmap step | Existing capability | Remaining gap |
|---|---|---|
| 57 Dashboard | Portal admin homepage with post totals, users, website views/visitors and engagement summary | Date-range comparisons, durable KPI definitions, export |
| 58 Protected admin access | Auth role gate in frontend and Portal API | Consistent centralized permission-code checks and session/role-change refresh |
| 59 Admin roles | Auth roles/permissions tables and `HasPermissionCode` | Role/permission management UI and audited assignment workflow |
| 60 User management | Auth admin user list and role list | Detail view, status controls, filters/search (filters implemented separately), audit history |
| 61 Verification/approval | Email verification workflow | No moderation queue or privileged manual-verification workflow; policy and proof requirements needed |
| 62 Subscription/payment | No confirmed billing administration API in these backends | Billing provider integration, payment ledger, refunds, invoices, reconciliation |
| 63 Organizations | No Organization model/API | Tenant domain design is documented separately |
| 64 Plants/members | No Plant/Membership model/API | Tenant-scoped management and membership invitations |
| 65 Categories | Portal Category model, public API and Django admin | Hierarchical categories/subcategories not modeled |
| 66 Content | Post model, category detail models, admin content API and editor UI | Complete CMS lifecycle, bulk review and revisions |
| 67 Jobs | JobDetails, JobPost, education, fee and vacancy models | Recruitment-specific editorial/admin reports |
| 68 Schemes | SchemeDetails and category-specific content | Structured scheme lifecycle and eligibility review |
| 69 Exams/admit cards | ExaminationDetails and AdmitCardDetails | Dedicated admin queues and data quality checks |
| 70 Results/notifications | ResultDetails and PostDate; no separate notification domain | Notification delivery/preferences and delivery history |
| 71 Videos/media | VideoDetails and URL-based media metadata | Central media asset/storage/transcoding lifecycle |
| 72 Comments/reports | Admin comment moderation UI, comment/report models and review endpoints | Separate post reports queue, moderator assignment and audit trail |
| 73 Website configuration | No general website configuration model/API confirmed | Typed settings with validation, versioning and cache invalidation |
| 74 Homepage/navigation | Category and ImportantLink data; frontend homepage composition remains code/config driven | Admin-managed menus, homepage sections and preview/publish |
| 75 Audit logs | PostStatusHistory captures post status transitions | General append-only admin audit events across users, roles, settings, reports and billing |
| 76 Analytics | Website/post view models, dashboard stats, visitor analytics, post engagement | Privacy-safe retention, date cohorts, exports and metric definitions |
| 77 Bulk actions/export | Some Django admin built-in list actions and bounded detail exports | Explicit permission-gated preview/confirm actions, export audit, safe deletion policy |
| 78 Admin settings/permissions | Auth role/permission models and read APIs | Permission editor, role assignment workflow, policy documentation and change audit |

## Admin API contract currently present

Portal endpoints under `/api/v1/portal/` include:

- `admin/stats/`
- `admin/content/<kind>/` and `admin/content/<kind>/<slug>/`
- `admin/content/slug-availability/`
- `admin/content/<post_id>/review/`
- `admin/comments/`
- `admin/content/<post_id>/engagement/`
- `admin/website-analytics/`
- `admin/organization-types/`

Auth administrative endpoints under `/api/v1/users/`:

- `GET /` requires `users.read`; paginated user list.
- `GET /roles/` requires `roles.read`; paginated role list.

User list now supports safe allowlisted query parameters:

- `search` searches email, username, first name and last name (maximum 120 characters).
- `is_active=true|false`
- `email_verified=true|false`
- `is_staff=true|false`
- `role=<role-slug>`
- `ordering=date_joined|-date_joined|email|-email`

Unsupported boolean/order values return validation errors. Querysets retain deterministic ordering and role filtering uses `distinct()`.

## Recommended admin permission matrix

Use explicit permission codes per module/action, for example `content.read`, `content.create`, `content.review`, `comments.moderate`, `reports.review`, `users.read`, `users.manage`, `roles.read`, `roles.manage`, `organizations.manage`, `analytics.read`, `settings.manage`, `billing.read`, and `billing.manage`.

A role should be a bundle of permission codes, not a hard-coded UI label. Backend authorization remains authoritative. For high-impact actions (user deactivation, role change, billing/refund, organization ownership transfer, bulk deletion), require explicit confirmation, record actor/target/reason, and consider recent re-authentication.

## Delivery boundary

The Auth user-list filtering improvement is implemented in the Auth repository. The inventory above is an evidence-based gap map, not a claim that all 22 administration features are already implemented. Billing/payment management, tenant administration, website configuration, generic audit logs, and role-management writes require dedicated domain/policy work before implementation.
