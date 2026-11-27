# ShivanyaMS V2 — Repository Rulebook

## MASTER ONLY — Reserved for the repository owner
## फक्त MASTER साठी — केवळ रेपॉझिटरीच्या मालकासाठी राखीव

> **EN:** This section belongs exclusively to the Master (repository owner). Only the Master may add, edit, or remove rules in this section. AI agents and other developers must never modify, delete, reformat, or move this section. They must read and follow every rule written here. The Master may update this section at any time; the AI-only rules below must then be adjusted when necessary to comply with the Master's instructions, without changing this section.
>
> **मराठी:** हा विभाग केवळ Master (रेपॉझिटरीचा मालक) यांच्यासाठी आहे. या विभागात नियम जोडणे, बदलणे किंवा काढून टाकणे हे फक्त Master करू शकतात. AI एजंट्स आणि इतर डेव्हलपर्सनी हा विभाग कधीही बदलू, हटवू, पुन्हा फॉरमॅट करू किंवा दुसरीकडे हलवू नये. त्यांनी येथे दिलेले प्रत्येक नियम वाचून पाळावेत. Master कधीही या विभागातील नियम अपडेट करू शकतात. अशा वेळी Master यांच्या सूचनांशी जुळवून घेण्यासाठी आवश्यक असल्यास खालील AI-only नियम बदलता येतील; मात्र हा Master विभाग बदलायचा नाही.

### Master rules / Master चे नियम

1. **EN:** The Master personally maintains this section. AI agents must leave it untouched and follow the instructions written here.
   
   **मराठी:** हा विभाग Master स्वतः सांभाळतील. AI एजंट्सनी या विभागात कोणताही बदल करू नये आणि येथे लिहिलेल्या सूचनांचे पालन करावे.

2. **EN:** Whenever the Master asks to add or update a rule, use the rule number specified by the Master. Add or edit that exact numbered rule in this Master section. Write each rule first in English and then in Marathi, without adding language labels. When the Master refers to a rule number while requesting code changes, apply that rule to the requested implementation. Do not renumber, overwrite, or change other Master rules.
   
   **मराठी:** Master यांनी एखादा नियम जोडण्यास किंवा बदलण्यास सांगितल्यास, त्यांनी दिलेला नियम क्रमांकच वापरावा. हा Master विभागात त्याच क्रमांकाचा नियम जोडावा किंवा संपादित करावा. प्रत्येक नियम आधी इंग्रजीत आणि त्यानंतर मराठीत लिहावा; भाषेची नावे किंवा लेबल लावू नयेत. कोडमध्ये बदल करण्यास सांगताना Master यांनी एखाद्या नियम क्रमांकाचा उल्लेख केल्यास, त्या नियमानुसार संबंधित बदल करावेत. इतर Master नियमांचे क्रमांक बदलू नयेत, ते बदलू नयेत किंवा त्यांच्या जागी दुसरे नियम लिहू नयेत.

3. **EN:** Gradually remove outdated legacy code throughout the frontend and move or rebuild functionality in the appropriate organized code structure wherever practical. Before moving or deleting anything, inspect its usage, dependencies, routes, imports, and behavior. Keep legacy code only while it is still required for active functionality or compatibility; remove it when it is genuinely unused and safe to delete. Prefer the organized structure for new and updated frontend work, avoid creating more legacy code, and perform this cleanup incrementally during relevant tasks without breaking existing features.
   
   **मराठी:** संपूर्ण फ्रंटएंडमधील जुना (Legacy) कोड टप्प्याटप्प्याने कमी करावा आणि शक्य असेल तिथे त्यातील कार्यक्षमता योग्यरित्या व्यवस्थित (Organized) कोड संरचनेत हलवावी किंवा पुन्हा तयार करावी. कोणताही कोड हलवण्यापूर्वी किंवा हटवण्यापूर्वी त्याचा वापर, अवलंबित्व (Dependencies), रूट्स, इम्पोर्ट्स आणि कार्यपद्धती तपासावी. सक्रिय फीचर्स किंवा सुसंगततेसाठी आवश्यक असेपर्यंतच Legacy कोड ठेवावा; तो खरोखर वापरात नसल्याची आणि सुरक्षितपणे हटवता येण्याची खात्री झाल्यावरच काढून टाकावा. नवीन आणि अपडेट केलेल्या फ्रंटएंड कामासाठी शक्यतो Organized संरचनेचा वापर करावा, नवीन Legacy कोड तयार करू नये आणि संबंधित काम करताना विद्यमान फीचर्स न मोडता ही साफसफाई टप्प्याटप्प्याने करावी.

---

## AI ONLY — Instructions for AI agents

The following rules are for AI agents. The Master may edit them, and AI agents may improve or update this AI-only section when instructed by the Master or when necessary to bring it into line with the Master rules above. Never change the MASTER ONLY section.

### Repository and branch scope

- Work only in `adityathute/shivanyams` on branch `shiv-v2`, unless the Master explicitly changes this rule.
- Treat `shivanya-sdk` and `shivanya-auth` as read-only reference repositories if provided.
- Do not switch branches or modify other repositories unless explicitly authorized by the Master.

### FEATURES ONLY

- Look for small, genuinely useful feature improvements related to the task. Suggest them clearly; implement them when they fit the request, existing product direction, and available scope. Do not silently expand the task or add unrelated features.
- Build features in the organized feature/component structure. Prefer concise, readable code and existing shared components, hooks, utilities, and styles; avoid unnecessary files, abstractions, dependencies, and duplicate logic.
- Clean and organize both TSX/TS and CSS files as part of relevant frontend work. Inspect each file's role and dependencies first; move code to the correct organized location and remove legacy code only after confirming it is unused or safely replaced.
- Keep CSS class names feature-scoped and distinctive. Do not define the same class selector repeatedly across files or create duplicate styles; reuse a class definition when appropriate. Do not force an artificial one-class-per-file structure.
- When a touched file still contains required legacy behavior, add at most one short status comment at the end of that file identifying that legacy behavior is still active and cleanup remains pending. Use the correct comment syntax for the file. Do not add status comments to files with no remaining legacy code, and remove or update the comment once the legacy code is fully cleaned.
- Before structural cleanup, inspect and plan the organized destination so existing behavior is preserved. After the change, summarize the final organized files and clearly identify any legacy code that remains; never claim cleanup is complete when it is not.

### Workflow for every task

1. Understand the request and inspect the existing implementation, related components, styles, utilities, routes, and data flow before making changes.
2. Reuse existing components, helpers, CSS classes, utilities, and established patterns where appropriate. Do not create duplicates.
3. Identify the smallest set of files required for the requested change and avoid unrelated edits.
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
