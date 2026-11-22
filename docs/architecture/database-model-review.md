# Database model review

**Scope:** `backend/apps/portal/models.py`, related serializers/admin registration, and the existing migration history.

**Review policy:** This step is an integrity review, not a schema redesign. No field, table, constraint, or historical migration is changed here. Schema changes are deferred where they could reject existing data or change API behavior without a data audit.

## Current model structure

The portal uses a shared `Post` record with one-to-one category detail records and related collections for links, FAQs, dates, resources, and related posts. The reviewed model set also covers reactions, saved posts, comments/reports, subscriptions, shares, visitor identities, page-view events, publication history, and newsletter subscriptions.

Important existing protections include:

- Unique canonical category and post slugs.
- Protected category deletion and cascading ownership for post-owned detail/child records.
- One-to-one category detail records.
- Unique per-user post/comment reactions, saved posts, subscriptions, and reports.
- Unique job post numbers within a recruitment notification.
- Date and age range check constraints.
- Prevention of a post relating to itself.
- Unique visitor identity per post and unique website visitor identity.

## Findings and follow-up priorities

### 1. Model `clean()` validation is not automatically enforced by ordinary saves

`JobPost.clean()` and `PostDate.clean()` contain important cross-field validation. Django does not call `full_clean()` automatically from `Model.save()`. Any write path that bypasses the corresponding serializer/admin validation can therefore persist combinations that the model's `clean()` method would reject.

**Follow-up:** Centralize validation in serializers/services and explicitly call `full_clean()` in controlled write workflows where compatible. Audit existing write paths before enforcing this globally; bulk operations require separate handling.

### 2. Category-specific detail ownership is not enforced at the database level

A `Post` can have one-to-one detail rows for multiple content types, or no matching detail row. The current serializer rejects more than one detail object in its normal write path, but that is not a database constraint and does not cover every possible ORM/admin/import path.

**Follow-up:** Define the authoritative category-to-detail mapping and enforce it in service validation. A cross-table database constraint is not straightforward; do not add a fragile constraint or alter existing rows without a data audit.

### 3. Comment parent integrity needs application-level protection

The self-referencing `Comment.parent` foreign key does not itself guarantee that a parent comment belongs to the same post, nor does it prevent cycles or enforce a chosen reply-depth limit.

**Follow-up:** Validate same-post parentage, prohibit self/ancestor cycles, and enforce the intended reply depth in the comment service. Existing records should be checked before any cleanup or constraint migration.

### 4. Post-view visitor ownership is represented by two independent foreign keys

`PostView` references both `Post` and `PostVisitor`, while `PostVisitor` itself references a post. A normal foreign key does not guarantee that both references point to the same post.

**Follow-up:** Ensure the view-recording service always derives the post from the visitor or validates the pair in one transaction. Consider a database-level composite-key strategy only if the integrity requirement and PostgreSQL migration impact justify it.

### 5. Visitor analytics contain personal and potentially identifying data

`WebsiteVisitor` and `WebsiteView` store IP address and full-name snapshots, alongside visitor IDs and browsing events. This may be operationally useful but requires clear collection purpose, access controls, retention, and deletion/anonymization rules.

**Follow-up:** Address this in the platform privacy/retention step. Do not delete or alter historical analytics data as part of this model review.

### 6. JSON fields require explicit shape validation

Fields such as `Post.meta_keywords`, `VideoDetails.available_languages`, `ToolDetails.configuration`, and `PostDate.month_years` allow flexible JSON values. Defaults are callable, which avoids sharing a mutable default, but the database column alone does not guarantee the expected list/object structure.

**Follow-up:** Validate each field's expected shape at serializer/service boundaries and keep backwards-compatible handling for stored values.

## Model design decisions retained

- External Auth identities remain scalar IDs rather than cross-repository database foreign keys.
- The shared `Post` plus category-specific one-to-one detail design is retained.
- Existing counter fields remain denormalized; their transactional update strategy is handled in service-layer work.
- Existing `on_delete` behavior, field lengths, null/blank semantics, and migration history are not changed in this review.

## Safe next sequence

1. Add focused service/serializer validation for the integrity gaps, with explicit compatibility handling.
2. Inspect existing data for cross-post comment parents, mismatched post-view visitor references, and multiple detail records.
3. Only then add database constraints or data migrations where they are enforceable and safe.
4. Review indexes separately against actual query patterns and PostgreSQL query plans.

No tests, builds, migrations, or data mutations were run for this review.
