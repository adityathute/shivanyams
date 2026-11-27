# ShivanyaMS V2 — Repository Rulebook

## MASTER ONLY — Reserved for the repository owner

> This section belongs exclusively to the Master (repository owner). Only the Master may add, edit, or remove rules in this section. AI agents and other developers must never modify, delete, reformat, or move this section. They must read and follow every rule written here. The Master may update this section at any time; the AI-only rules below must then be adjusted when necessary to comply with the Master's instructions, without changing this section.

### Master rules

1. The Master personally maintains this section. AI agents must leave it untouched and follow the instructions written here.

---

## AI ONLY — Instructions for AI agents

The following rules are for AI agents. The Master may edit them, and AI agents may improve or update this AI-only section when instructed by the Master or when necessary to bring it into line with the Master rules above. Never change the MASTER ONLY section.

### Repository and branch scope

- Work only in `adityathute/shivanyams` on branch `shiv-v2`, unless the Master explicitly changes this rule.
- Treat `shivanya-sdk` and `shivanya-auth` as read-only reference repositories if provided.
- Do not switch branches or modify other repositories unless explicitly authorized by the Master.

### Workflow for every task

1. Understand the request and inspect the existing implementation, related components, styles, utilities, routes, and data flow before making changes.
2. Reuse existing components, helpers, CSS classes, utilities, and established patterns where appropriate. Do not create duplicates.
3. Identify the smallest set of files required for the requested change. Edit only those files; do not make unrelated changes.
4. If the Master asks for an explanation or confirmation before coding, explain the intended behavior and wait for approval.
5. Otherwise, implement the requested functionality directly. Do not replace implementation with documentation-only changes.
6. Preserve existing behavior and features unless the Master explicitly requests otherwise.
7. Review the final diff for correctness, duplication, unused code, accidental formatting changes, and unrelated edits.
8. Complete one requested task at a time, then wait for the Master's next instruction.

### Code organization and quality

- Put code in the correct existing feature, component, service, or style location.
- Follow the repository's architecture, naming conventions, formatting, and folder structure.
- Keep code concise, readable, maintainable, and efficient.
- Avoid unnecessary abstractions, dependencies, wrappers, comments, and extra lines of code.
- Prefer existing shared components, hooks, utilities, constants, and helpers when they fit.
- Extract shared logic only when it is genuinely reused; avoid both copy-paste and needless abstraction.
- Keep responsibilities clear and do not mix unrelated features in one component or stylesheet.

### CSS and responsive layout

- Inspect existing styles before adding or changing CSS.
- Reuse existing classes, design tokens, variables, and shared styles.
- Do not introduce duplicate selectors, repeated declarations, unnecessary overrides, or broad global selectors.
- Keep styling changes limited to the requested feature.
- Respect the existing parent/container dimensions. Child content must not overflow its available width or disrupt neighboring cards and layout.
- Base responsive behavior on the actual available container space and content where appropriate; do not assume viewport breakpoints alone solve every layout.
- Check narrow and wide layouts and account for long text, empty content, and wrapping.

### Safety and verification

- Do not remove or rewrite existing functionality unless explicitly requested.
- Check relevant imports, types, route paths, API contracts, responsive behavior, and loading, empty, and error states.
- Run appropriate checks when available. Report exactly what was and was not tested; never claim a build, test, or browser verification that did not happen.
- Do not invent implementation results, commit hashes, or successful checks.

### Git and delivery

- Commit completed changes to the approved repository and `shiv-v2` branch when repository write access is available.
- Use a clear, specific commit message.
- After committing/pushing, provide the exact command the Master needs to pull the changes, normally `git pull origin shiv-v2`.
- State which files were changed and summarize the result briefly.
- Do not start the next task until the Master gives the next instruction.
