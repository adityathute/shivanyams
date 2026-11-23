# ShivanyaMS V3 release handover

## Current delivery boundary

- Portal: `adityathute/shivanyams`, branch `shiv-v3`.
- Auth: `adityathute/shivanya-auth`, branch `auth-v3`.
- SDK: `adityathute/shivanya-sdk`, branch `sdk-v3`.
- Portal CI checks out the SDK by immutable commit SHA and builds packed SDK artifacts.

## Required environment configuration

- Portal: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_PORTAL_API_URL`, `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` (optional), database settings and the existing Auth integration variables.
- Auth: existing secure cookie domain, secure flag, SameSite, CORS and CSRF trusted-origin settings must match the deployed subdomains.
- Never expose database credentials, Auth signing secrets, OAuth credentials, provider keys or backup encryption keys through `NEXT_PUBLIC_*` variables.

## Operator actions still required

- Apply the Portal additive migration `0059_seo_redirects_analytics_event_ids` after reviewing it and taking a backup.
- Schedule `python manage.py expire_analytics` according to the approved retention schedule; run dry-run first.
- Configure encrypted off-site database and media backups and perform restore drills.
- Add the production domain to Search Console and set the verification environment variable; submit the generated sitemap through the verified property.
- Execute CI/build/tests, Django checks, migration checks and production smoke tests before release. These were not run as part of the source changes.

## Rollback

Preserve additive schema until compatibility is established. Roll back application artifacts to a recorded immutable SHA; use the backup/restore runbook for data recovery rather than reversing migrations blindly.
