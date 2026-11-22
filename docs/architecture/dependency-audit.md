# Dependency and lockfile audit

> Step 9 of 143 — inspection only. No dependency versions were upgraded or downgraded in this step.

## 1. Current dependency sources

| Area | Manifest / lockfile | Finding |
|---|---|---|
| Next.js frontend | `package.json` | npm project; exact versions for Next, React, React DOM and eslint-config-next. |
| Frontend transitive dependencies | `package-lock.json` | npm lockfile v3; 407 package entries; registry dependencies have resolved versions and integrity hashes. |
| Django backend | `backend/requirements.txt` | Version ranges, not exact pins. |
| Python dependency lock | None found | Backend installs are not fully reproducible from a committed lockfile. |
| SDK packages | Local `.tgz` files referenced by npm | Six packages are consumed as local tarballs built from the separate SDK repository in CI. |

## 2. Frontend direct dependency baseline

| Package | Manifest constraint | Locked version |
|---|---:|---:|
| `next` | `16.3.8` | `16.3.8` |
| `react` | `19.2.8` | `19.2.8` |
| `react-dom` | `19.2.8` | `19.2.8` |
| `eslint` | `^9` | `9.39.5` |
| `eslint-config-next` | `16.3.8` | `16.3.8` |
| `typescript` | `^5` | `5.9.3` |
| `@types/node` | `^20` | `20.19.43` |
| `@types/react` | `^19` | `19.3.0` |
| `@types/react-dom` | `^19` | `19.3.0` |

The locked Next.js release declares Node.js `>=20.9.0`; the existing CI workflow uses Node 24, which satisfies that declared engine range. React and React DOM are aligned at 19.2.8, and the locked React DOM peer requirement is satisfied.

## 3. Local SDK package baseline

| Package | Local tarball version | Lockfile entry |
|---|---:|---|
| `shivanya-ai` | `0.1.2` | Present |
| `shivanya-auth` | `1.0.1` | Present |
| `shivanya-core` | `1.1.0` | Present |
| `shivanya-i18n` | `1.0.0` | Present |
| `shivanya-shell` | `1.1.1` | Present |
| `shivanya-ui` | `1.1.1` | Present |

The lockfile records local file URLs and integrity values for all six packages. The Auth, Shell, and UI packages declare React 18/19 peer ranges, compatible with this app's React 19 dependency.

The CI workflow checks out the SDK at a fixed commit, builds and packs the six packages into the sibling `../shivanya-sdk` directory, then recalculates the local tarball integrity values before `npm ci`. This is an intentional build prerequisite, not a conventional self-contained npm install. A fresh local clone must have the sibling SDK checkout and matching generated tarballs before running `npm ci`.

The fixed SDK checkout revision in CI is separate from the moving `sdk-v3` branch. Keep that pin deliberate and update it only alongside a reviewed SDK package compatibility/release change.

## 4. Backend dependency baseline

Current declared ranges:

- `Django>=5.1,<6.1`
- `djangorestframework>=3.15,<4`
- `djangorestframework-simplejwt>=5.3,<6`
- `psycopg[binary]>=3.2,<4`
- `python-decouple>=3.8,<4`
- `django-cors-headers>=4.6,<5`
- `django-filter>=24.3,<26`

There is no committed pip/uv/Poetry lockfile or hash-pinned requirements file. The allowed ranges permit different resolved versions on different install dates. Introduce a reproducible backend lock in a dedicated change after the supported Python/runtime and deployment platform are confirmed; do not invent pins from an unexecuted environment.

## 5. Workflow and maintenance observations

1. The existing GitHub Actions workflow is named Application CI but its push and pull-request filters target `Master` and `shivanyams-v2`, not the active `shiv-v3` branch. As configured, ordinary pushes and PRs targeting `shiv-v3` will not trigger this workflow. Correcting branch triggers belongs in a focused CI workflow change.
2. The workflow uses Node 24 and npm for the Portal app, and pnpm for the SDK workspace. The SDK setup is needed for the local tarball build.
3. The npm lockfile root dependency declarations match the current `package.json` declarations. No missing direct dependency lock entries were found.
4. Do not run `npm install`, `npm update`, or package upgrade commands merely to refresh versions. Any future upgrade must be compatibility-reviewed against Next.js, React, the SDK tarballs, and the Auth application, then deliberately lock and verify it.
5. The backend ranges and absence of a lockfile are a reproducibility risk, but changing them without a confirmed deployment runtime can create incompatible pins.

## 6. Step 9 decision

No dependency changes were made. The current frontend lockfile is structurally aligned with the manifest, and the SDK tarball build path is documented in CI. The outstanding work is explicit: align CI triggers with the active branch, define a backend lock strategy, and maintain an intentional SDK package release/pin matrix. These should be addressed in their relevant workflow/release steps rather than making unverified version changes here.
