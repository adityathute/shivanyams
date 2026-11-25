# CSS Organization Guide (AI)

Read this file before creating or changing CSS.

## Rules
- Put all **new or reorganized CSS** in `src/styles/organized/`.
- Keep existing CSS in `src/styles/legacy/`. Do not edit, move, rename, or delete legacy files unless the user explicitly asks for that migration.
- Do not change visual styles, selectors, or behavior unless the task requests a design change.
- Check legacy and organized styles before adding rules; avoid duplicate component rules.
- Never assume a CSS file is unused. Search all imports and references before removing anything.
- Respect Next.js global-CSS import constraints and update only imports required by the task.
- Do not create extra CSS, configuration, or documentation files unless requested.

## Folder map
- `globals/` — resets, fonts, tokens, and app-wide styles.
- `components/` — reusable shared component styles.
- `pages/` — page-specific styles.
- `portal/` — public portal sections and layouts.
- `admin/` — admin dashboard styles.

## File conventions
- Use clear names, e.g. `organized/components/PortalButton.css`.
- Keep each stylesheet focused on one component, page, or closely related feature.
- Reuse existing design tokens; avoid competing global values.
- Keep responsive rules and component states with the relevant stylesheet.

## Safe workflow
1. Inspect the component, imports, and related stylesheets.
2. Add or migrate only the CSS required by the user's task.
3. Preserve appearance and behavior unless a redesign is requested.
4. Update relevant imports and avoid loading duplicate rules for the same component.
5. Search all references before removing any legacy file.
6. Report changed files and whether build/tests were run.

## Important
Existing CSS continues to use the current legacy setup unless the user explicitly requests a mode change or migration. This guide is documentation only; it does not import, enable, or disable CSS.
