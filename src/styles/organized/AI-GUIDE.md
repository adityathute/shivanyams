# CSS Organization Guide (AI)

Read this file before creating or changing CSS.

## CSS mode switch

Use only `src/styles/css.config.ts`:

- `USE_ORGANIZED_CSS = false` — legacy global styling is active.
- `USE_ORGANIZED_CSS = true` — organized global styling is active.

Do not add separate mode flags in components, pages, or stylesheets.

The legacy and organized global stylesheets may both be imported by the root layout, but their visual rules must remain scoped to their matching `data-css-mode`. The shared `shivanya-ui/styles` stylesheet remains available in both modes because it belongs to the shared UI SDK.

## Rules

- Put all new or reorganized CSS in `src/styles/organized/`.
- Keep existing CSS in `src/styles/legacy/`.
- Do not move, rename, or delete legacy files until their replacements are implemented and tested.
- Check `shivanya-ui` for an existing component before creating a replacement.
- Prefer shared components and use local overrides only when necessary.
- Keep global foundations in `foundations/`.
- Keep reusable component styles in `components/`.
- Keep page-specific styles in `pages/`.
- Keep portal section and layout styles in `portal/`.
- Keep admin dashboard styles in `admin/`.
- Add organized global foundation imports through `organized/index.css`.
- Scope organized global selectors to `html[data-css-mode="organized"]`.
- Keep legacy global rules scoped to legacy mode.
- Respect Next.js global-CSS import constraints.
- Preserve SDK versions, application behavior, responsive behavior, and CSS module boundaries.

## CSS quality

- Use design tokens instead of repeating colors, spacing, radii, and shadows.
- Avoid broad global selectors when a component or page scope is sufficient.
- Avoid duplicate resets and competing typography rules.
- Avoid `!important` unless a documented third-party override requires it.
- Keep selectors shallow and predictable.
- Test light and dark themes and the project's common desktop and mobile viewport sizes.

## Safe workflow

1. Inspect the component, imports, and related stylesheets.
2. Check the shared UI SDK before creating a component.
3. Add or migrate only the CSS required by the current task.
4. Preserve appearance and behavior unless a redesign is requested.
5. Search all references before removing legacy CSS.
6. Test the page in organized-only mode before declaring migration complete.
7. Report changed files and whether build/tests were run.

## Completion rule

A page is not considered migrated until it works with `USE_ORGANIZED_CSS = true`, has been checked in the browser, and no longer depends on legacy global styling for its appearance.
