<!-- File Location: shivanyams/README.md
Reference Repositories:
  shivanya-sdk v1.0.0 (branch sdk-v2)
  shivanya-auth v1.0.0 (branch auth-v2)

Repository Commit: 312c7c24b5ab1211f534ce9c2f871004d0441398
Both repositories are read-only references.
-->
<!-- Cleanup Status: Clean -->
<!-- Cleanup Info: Batch 14 audit. Replaced create-next-app boilerplate with accurate local setup for the Next.js Portal and separate Django API; documents sibling SDK tarball prerequisite and current branch workflow. -->

# ShivanyaMS V2 — Job Portal

ShivanyaMS is a Next.js frontend with a separate Django REST API. Authentication is delegated to the shared Shivanya Auth service; the Portal backend stores Portal business data only.

## Requirements
- Node.js 24
- npm (the repository uses package-lock.json)
- pnpm 11.9.0 for building local Shivanya SDK packages
- Python 3.10+ and PostgreSQL for the Django API
- The read-only shivanya-sdk repository checked out beside this repository as ../shivanya-sdk

## Frontend setup

The frontend dependencies reference SDK package tarballs in the sibling shivanya-sdk directory. Build and pack the SDK packages first, using the pinned SDK revision from .github/workflows/ci.yml, then install the Portal dependencies.

```powershell
npm ci
npm run dev
```

Open http://localhost:3000.

Create .env.local from .env.local.example and set NEXT_PUBLIC_PORTAL_API_URL to the Portal API base URL reachable by the browser. The default local value is http://localhost:8001/api/v1/portal.

Useful commands:
```powershell
npm run lint
npm run build
npm run start
```

## Backend setup

See backend/README.md for Django API setup, environment variables, database configuration and authentication flow.

## Repository workflow
- Active working branch: shiv-v2
- CI runs on pushes and pull requests targeting shiv-v2.
- shivanya-sdk and shivanya-auth are reference dependencies; do not modify them as part of this repository's work.
