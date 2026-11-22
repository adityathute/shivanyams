# Organization domain design — Steps 46–56

## Current state and ownership decision

The Portal currently has a `Post.organization_type` choice used to classify government content. That field is not a business organization record. The Auth service currently owns users, roles, permissions, and sessions, but has no Organization, Plant, Membership, or Invitation model.

Do not reuse `Post.organization_type` or global user roles as tenant membership. Business organizations need a distinct tenant boundary. Recommended ownership:

- Auth owns global identity, credentials, sessions, and global platform roles.
- Organization domain owns tenant membership, organization-level roles, invitations, plants, contacts, and organization activity.
- Portal owns public posts and content workflows. If organization-authored content is introduced, it stores a validated organization identifier and applies tenant authorization before reads/writes.
- Subscription/billing owns plan entitlements and organization/member/plant limits; no frontend-only plan gate is authoritative.

The organization domain should live in the Auth backend initially because it is the canonical identity and permission authority. Keep it a separate Django app/domain package rather than expanding the user model with many tenant fields. Portal should consume a narrow Auth authorization contract and must not connect to Auth's database.

## Proposed entity model

| Entity | Important fields | Invariants |
|---|---|---|
| Organization | UUID, legal/display name, slug, status, description, logo reference, primary color, created_by_user_id | Slug unique; soft-disable before destructive removal; tenant owns its data. |
| Plant | UUID, organization_id, code, name, address, city, state, country, pincode, is_headquarters, status | Exactly one active HQ per organization; plant code unique within organization. |
| Membership | UUID, organization_id, user_id, role, status, joined_at, invited_by | Unique organization/user; user must be active; role is organization-scoped. |
| Invitation | UUID, organization_id, plant scope, normalized email, role, token_hash, expires_at, accepted_at, revoked_at, invited_by | Store only token hash; one pending invite per organization/email/scope; acceptance is atomic and idempotent. |
| OrganizationContact | UUID, organization_id, optional plant_id, type, value, label, is_primary | Contact belongs to the same organization as its optional plant. |
| OrganizationActivity | UUID, organization_id, actor_user_id, action, target_type, target_id, metadata, created_at | Append-only event; metadata schema is allowlisted; never store credentials or invitation raw tokens. |
| OrganizationEntitlement | organization_id, plan_code, limits snapshot/reference, status, valid_until | Entitlements derived from billing authority, not client claims. |

Use UUID identifiers at API boundaries. Keep Auth user IDs as references within the same service database; Portal stores the external identity/organization IDs as scalar values only.

## Plant and headquarters rules

1. Every organization starts with one headquarters plant.
2. Headquarters is a plant record with an explicit immutable identity and an `is_headquarters` marker, not a second unrelated address field.
3. Exactly one active HQ must exist. HQ can be edited, but it cannot be deleted while the organization is active.
4. Other plants are optional and always scoped to one organization.
5. Changing HQ is a dedicated transaction: lock organization, validate target plant, demote old HQ, promote new HQ, write activity event.
6. Organization's display address is derived from the HQ; do not maintain a second independently editable copy.

## Organization roles and permissions

Global platform roles and tenant roles must remain separate.

| Tenant role | Organization profile | Plants | Members/invitations | Contacts | Billing |
|---|---|---|---|---|---|
| Owner | Full | Full | Full; transfer ownership | Full | View/manage per billing policy |
| Admin | Read/update permitted fields | Manage assigned plants | Manage within assigned plant scope; cannot remove owner or change ownership | Manage assigned scope | View only |
| Staff | Read permitted organization summary | Only assigned plant(s) | No member administration | Read permitted contacts | No access |

Authorization must evaluate organization membership, membership status, role, and plant scope on every request. Never accept organization_id or plant_id from the request without checking the authenticated user's membership. Admin/staff assigned to a non-HQ plant must not gain implicit HQ membership or permissions.

Owner transfer is a separate audited action requiring re-authentication. Last active owner cannot be removed or downgraded.

## Invitations and membership lifecycle

- Invitation creation requires owner/admin permission for the requested plant scope.
- Normalize email and verify it is not already an active member.
- Generate a high-entropy token; persist only a cryptographic hash; send raw token only through email.
- Set a short configurable expiry, support revocation, and enforce a maximum pending invitation count.
- Acceptance locks the invitation, checks expiry/revocation/email identity, and creates membership atomically.
- Repeated acceptance returns the already-created membership without duplicate rows.
- Member removal is a status transition plus activity event; preserve history.
- Re-invitation creates a new token/version and invalidates prior pending tokens.

## Organization profile, logo, and contacts

- Store logo as a validated media reference; enforce size, decoded image format, pixel limit, and safe storage policy.
- Keep brand color as a validated hex value from an allowlist or strict parser.
- Store address fields as structured data, including country; validate Indian pincode only when country is India.
- Contacts use explicit types (phone, email, website, support URL) with normalized values and per-organization/plant ownership.
- Never expose private contact or member information through public organization serializers by default.

## Subscription limits

Define limits as server-side entitlements, not hard-coded frontend checks. At minimum: number of active organizations per account, active plants per organization, active members per organization, and pending invitations. Use atomic quota checks to prevent concurrent creates exceeding a limit. Downgrade/expiry must not delete tenant data; block new over-limit actions and offer a safe read-only/grace policy.

## API boundary proposal

Versioned endpoints under Auth `/api/v1/organizations/`:

- `GET/POST /` — list/create organizations available to current user.
- `GET/PATCH /<organization_id>/` — profile.
- `GET/POST /<organization_id>/plants/` and `PATCH/DELETE /<organization_id>/plants/<plant_id>/`.
- `POST /<organization_id>/plants/<plant_id>/set-headquarters/`.
- `GET/POST /<organization_id>/members/`, member detail/status endpoints.
- `GET/POST /<organization_id>/invitations/`, revoke/resend/accept endpoints.
- `GET/POST /<organization_id>/contacts/`.
- `GET /<organization_id>/activity/`.

Every route must resolve tenant membership before touching a tenant-owned row. Use serializers for shape validation and domain services for multi-row transactions. Keep response envelopes consistent with existing Auth API responses.

## Steps 46–56 delivery status

This commit establishes the domain model, boundaries, data invariants, API shape, and security rules. It intentionally does not create models or migrations: production data state, plan entitlements, exact member policy, media storage, and existing UI integration must be confirmed before schema rollout. The current application does not yet provide organization CRUD, plant/member management, invitation delivery, or organization activity endpoints.
