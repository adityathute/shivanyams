# AI Agent Instructions

These instructions apply to the entire ShivanyaMS V2 repository.

## Repository and branch scope

- Make changes only in `adityathute/shivanyams` on branch `shiv-v2`, unless the user explicitly changes this instruction.
- Treat `shivanya-sdk` and `shivanya-auth` as read-only reference repositories if they are provided.
- Do not switch branches or modify other repositories as part of routine work.

## Required workflow before every change

1. Inspect the existing implementation, related components, styles, utilities, routes, and data flow before editing.
2. Search for an existing component, helper, CSS class, or pattern that can be reused. Do not create a duplicate just because it is easier.
3. Identify the smallest set of files that must change and keep unrelated concerns separate.
4. Follow the repository's existing architecture, naming conventions, formatting, and folder structure.
5. Preserve existing behavior and features. Change only what is necessary for the requested task.
6. Implement the actual requested functionality. Do not substitute documentation-only changes for code implementation.
7. Review the final diff for duplicate logic, repeated styles, unused code, accidental formatting churn, and unrelated edits.

## Code organization and quality

- Put new code in the correct existing feature/component/service/style folder; do not scatter related code across unrelated files.
- Keep implementations concise, readable, maintainable, and efficient. Avoid unnecessary abstractions, dependencies, wrappers, comments, and extra lines of code.
- Prefer existing shared components, hooks, utilities, constants, and helpers when they fit.
- Extract shared logic or UI only when it is genuinely reused; avoid both copy-paste and needless abstraction.
- Keep responsibilities clear: do not mix unrelated features or concerns in one component or stylesheet.
- Use clear, consistent names that match the surrounding code.

## CSS and styling rules

- Inspect existing styles before adding CSS.
- Do not introduce duplicate CSS class names or create another class that repeats an existing class's responsibility.
- Reuse existing classes, design tokens, variables, and shared styles whenever possible.
- Keep styles close to their established feature or component organization; follow the project's existing CSS module/organized CSS conventions.
- Add only the selectors and declarations required for the change. Avoid repeated declarations, unnecessary overrides, and broad global selectors.
- Do not change unrelated pages or themes while styling a requested feature.

## Safety and verification

- Do not remove or rewrite existing functionality unless the user explicitly asks.
- Avoid unrelated refactors and large-scale formatting changes.
- Check imports, types, route paths, API contracts, responsive behavior, and loading/empty/error states relevant to the change.
- Run appropriate checks when available and report accurately which checks were run. Never claim a build, test, or browser verification that was not performed.
- Keep each requested task focused; finish the current task and wait for the user's next instruction.
- Commit changes to the approved repository and branch when repository write access is available, using a clear, specific commit message.
