# V3 Step 7 — Organization and multi-tenant authorization audit

**Scope:** Source-level review of the Auth service organization domain, tenant membership/plant scope enforcement, organization APIs, invitations, tenant data relationships, administrative surfaces, and the Portal/Auth ownership boundary.

**Audited branches and starting heads**
- Portal — `adityathute/shivanyams` / `shiv-v3` — `8e3f4361969ec7e3918c71afc2b4b6346f879e3a`
- Auth — `adityathute/shivanya-auth` / `auth-v3` — `02b46b7c33390fa1c093521bdd8e75320c0795e0`

No runtime code, database schema, migration, membership, organization or invitation record was changed.

## 1. Domain ownership and service boundary

- Auth service owns users and global identity. The organization app is registered in Auth and owns Organization, Plant, Membership, MembershipPlant, Invitation, OrganizationContact, OrganizationActivity and OrganizationEntitlement.
- Tenant roles (owner/admin/staff) are separate from global Auth roles.
- Portal does not own organization membership tables. Its architecture handbook says Portal must not query the Auth database and must use an explicit Auth authorization contract for future organization-authored content.
- Portal's `Post.organization_type` is a content classification, not a business organization tenant.

**Migration/deployment gate:** The Auth tree contains the organization models and API, but no `backend/apps/organizations/migrations/` files were found in the audited branch. The app documentation also records that organization migrations have not been created. The organization schema therefore must not be assumed to exist in a deployed database.

## 2. Tenant data model and invariants

| Model | Tenant boundary and invariant |
|---|---|
| Organization | UUID-backed organization record, unique slug, lifecycle status and creator |
| Plant | Belongs to one organization; code unique within organization; conditional unique constraint permits one active HQ |
| Membership | Belongs to one organization and one Auth user; unique organization/user; owner/admin/staff roles and active/removed state |
| MembershipPlant | Maps a membership to an explicitly assigned plant; unique membership/plant pair |
| Invitation | Organization, optional plant, normalized email, tenant role, token digest, expiry and lifecycle status |
| OrganizationContact | Organization-owned contact, optionally attached to a plant |
| OrganizationActivity | Append-only activity record with actor, target and metadata |
| OrganizationEntitlement | One-to-one entitlement placeholder for plan/status/valid-until |

Model-level safeguards:
- Plant code uniqueness and one active HQ are database constraints.
- Active HQ cannot be deleted or deactivated without another active HQ through the model save/delete paths.
- MembershipPlant, Invitation and OrganizationContact validate that the referenced plant belongs to the same organization; their save paths call `full_clean()`.
- Invitation email is normalized before save.
- Activity records reject updates through the model save method.
- Membership user deletion is protected; organization deletion cascades to its tenant records.

These safeguards are valuable, but model save/clean methods do not protect direct SQL or every bulk update/delete path. Critical tenant invariants should be enforced by database constraints wherever the schema permits.

## 3. Tenant resolution and plant visibility

- Organization access is resolved through an active membership for the authenticated user; non-members receive a not-found response rather than an organization record.
- Owners see all active plants.
- Admins and staff see only active plants explicitly linked through MembershipPlant.
- Plant list uses this visibility helper.
- Member list and invitation list are restricted to owner/admin; admin results are narrowed to the admin's assigned plant scope.
- Owner-only operations include organization profile update, plant creation, HQ switching, member role change/removal and activity history.
- Admins can invite only within their assigned plant scope.
- Staff cannot administer members or create invitations.
- Contact creation is owner/admin; admins must select an assigned plant.

**Positive finding:** The central tenant lookup and plant visibility helpers establish a clear organization boundary and reduce the risk of trusting a caller-supplied organization ID alone.

## 4. API surface observed

All routes are under Auth `/api/v1/organizations/`.

| Route | Methods | Intended access and behavior |
|---|---|---|
| `/` | GET, POST | List current user's active organizations; create organization and initial HQ/owner |
| `<organization_id>/` | GET, PATCH | Active member reads; owner updates profile |
| `<organization_id>/plants/` | GET, POST | Visible plants; owner creates |
| `<organization_id>/plants/<plant_id>/set-headquarters/` | POST | Dedicated service verifies active owner and switches HQ transactionally |
| `<organization_id>/members/` | GET | Owner/admin list; admin list limited by plant scope |
| `<organization_id>/members/<membership_id>/` | PATCH, DELETE | Owner changes non-owner role or removes non-owner |
| `<organization_id>/invitations/` | GET, POST | Owner/admin list/create; admin limited to assigned plants |
| `invitations/accept/` | POST | Signed-in, active, email-verified account accepts matching email invitation |
| `<organization_id>/contacts/` | GET, POST | Members read visible contacts; owner/admin create within permitted scope |
| `<organization_id>/activity/` | GET | Owner-only activity history |

All listed views require Authenticated access at the DRF layer, with organization membership/role checks applied in the view or domain service. HQ switching does not rely only on the outer authentication check: its service explicitly verifies active owner membership.

## 5. Transactional workflows

- Organization creation is atomic: create organization, first active HQ plant, owner membership and activity event.
- HQ switch locks the organization, verifies owner, locks the target active plant, switches the HQ marker and writes activity.
- Invitation creation locks the organization and actor membership, checks role and plant scope, generates a high-entropy token, stores only SHA-256 digest, writes activity and sends the raw token by email after commit. Invitation TTL is seven days.
- Invitation acceptance locks the invitation and organization, verifies exact normalized account email, active/verified user and expiry, creates/reactivates membership, assigns plant scope, marks invitation accepted and records activity.
- Role changes and member removals are atomic and owner-only. Removal is a status transition and deletes plant scopes; it does not hard-delete membership history.
- Owner cannot be demoted or removed through the member management endpoints. Ownership transfer is not implemented.

## 6. Findings and gaps

### High — Invitation acceptance does not re-check organization lifecycle status

Invitation creation rejects inactive organizations, but `accept_invitation()` does not check `organization.status == ACTIVE` after it loads and locks the organization. A still-pending, unexpired invitation could therefore be accepted after the organization has been deactivated, provided its plant checks pass (or it has no plant).

**Recommendation:** reject acceptance for inactive organizations inside the same transaction before membership creation. Consider revoking pending invitations when an organization is suspended/deactivated.

### High — Organization entitlement is not connected to billing or quota enforcement

OrganizationEntitlement is a placeholder and organization creation does not perform a server-side entitlement/quota check. No atomic limits for organizations per user, plants, members or pending invitations are enforced.

**Recommendation:** connect the organization domain to the billing source of truth and enforce quotas transactionally. Client-side subscription gating must not be treated as authorization.

### High — Organization schema has no migrations in the audited branch

The organization app models and endpoints exist, but migration files are absent. Deploying or using these APIs without a deliberate schema rollout would fail or leave environment drift.

**Recommendation:** establish deployed database state, generate and review migrations, then use a controlled migration/release plan. Do not create or apply migrations as part of this audit step.

### High — Organization deactivation and suspension workflow is incomplete

Organization has lifecycle status, but the inspected API surface does not expose a dedicated owner/platform-admin suspend/reactivate workflow. Acceptance also lacks the status check noted above. Define how active memberships, sessions, invitations, reads and billing behave during suspension.

### Medium — Member plant-scope assignment is not exposed as a complete API workflow

A domain helper `assign_membership_plant()` exists and validates tenant/role constraints, but there is no corresponding member plant-scope assignment/removal endpoint in the registered organization URL list. This limits operational management of staff/admin assignments after invitation acceptance.

### Medium — Admin member-list response can reveal full plant IDs for a shared member

The admin member queryset is filtered to members sharing at least one of the admin's assigned plants. However, MembershipSerializer's `plant_ids` method returns every plant scope on each returned member, not only the intersection with the requesting admin's assigned plant IDs. If a member is assigned to multiple plants and the admin is assigned to only one, the response can disclose other plant identifiers in the same organization.

**Recommendation:** scope the serialized plant IDs to the requesting admin's visible plant set, or use a role-specific serializer. Test both cross-plant member listing and detail payloads.

### Medium — Admin contact listing hides organization-level contacts from non-owners

For any non-owner, contact listing filters to `plant_id` in visible plant IDs. This excludes contacts where `plant_id IS NULL`, including organization-wide contacts. Confirm whether staff/admin should see organization-level public contacts; if yes, include organization-level records while still restricting plant-specific records.

### Medium — Expired invitation lifecycle is only enforced at acceptance

Expired invitations remain in PENDING status until a cleanup task (not found in this audit) materializes EXPIRED. There are no revoke/resend endpoints in the URL registry, although the model has REVOKED status and revoked timestamp.

**Recommendation:** add explicit revoke/resend workflows, expiry cleanup, pending invitation limits and activity events. Keep the existing acceptance-time expiry check as defense in depth.

### Medium — Contact and plant lifecycle management is incomplete

The API exposes plant listing/creation and HQ switching, but not plant update/deactivation. Contacts expose list/create but not update/delete. Define owner/admin scope and ensure the active HQ invariant remains intact when lifecycle endpoints are added.

### Medium — Ownership transfer and last-owner guarantees are not implemented

Current endpoints prevent demoting/removing the owner and do not permit invitation-based owner role. This protects the initial owner, but there is no audited transfer workflow. Define re-authentication, recipient acceptance, atomic transfer, concurrent transfer protection and last-owner invariant before supporting multiple owners.

### Medium — Activity audit trail coverage is incomplete

Core workflows write events, but the domain has no exposed event for contact changes or plant updates/deactivation because those workflows do not exist. Django admin can modify several organization models directly; such changes may bypass the domain service event trail. Keep sensitive admin operations audited or make activity-sensitive fields read-only through generic admin editing.

### Medium — Cross-tenant constraints rely partly on application validation

MembershipPlant, Invitation and OrganizationContact validate that plant and parent organization match via `full_clean()`. This protects normal model save paths, but direct bulk operations and raw SQL can bypass it. Add database-level enforcement where feasible and keep all API querysets tenant-scoped.

## 7. Portal/Auth boundary review

- Portal must not import Auth organization models or connect to Auth's database.
- Portal organization-authored content must validate organization access through a narrow Auth authorization contract or a short-lived signed authorization context.
- Portal should store organization IDs as external scalar references and enforce tenant authorization before any organization-scoped read/write.
- Current Portal public content organization type is not a tenant ID and must not be repurposed as one.
- No complete cross-service organization authorization endpoint/SDK contract was confirmed in the inspected source.

## 8. Recommended implementation order

1. Add inactive-organization rejection to invitation acceptance and define suspension semantics.
2. Add the missing reviewed organization migrations after confirming deployed database state.
3. Connect billing entitlements and enforce atomic organization/plant/member/invitation quotas.
4. Add member plant-scope assignment/removal endpoints with owner-only policy and tenant checks.
5. Restrict admin member serializer plant IDs to the requester's visible scope.
6. Decide organization-level contact visibility for admins/staff.
7. Add invitation revoke/resend and expiry cleanup.
8. Add plant/contact lifecycle endpoints with HQ and tenant invariants.
9. Add audited ownership transfer and last-owner protection.
10. Establish the Portal-to-Auth organization authorization contract before organization-authored Portal content ships.

## 9. Verification boundary

- Inspected Auth organization models, serializers, views, URL registry, permissions, services, membership services, admin configuration and architecture documentation.
- Inspected Portal organization-domain design and verified that the Portal codebase treats business organization identity as an external boundary.
- No live database, migrations, production environment, user or invitation records were accessed.
- No tests, builds, migrations, schema changes, API calls or application code modifications were performed.
- Findings are source-level and must be validated in the authorized testing phase.
