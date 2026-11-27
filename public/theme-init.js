/* File Location: shivanyams/public/theme-init.js
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: 312c7c24b5ab1211f534ce9c2f871004d0441398
 * Both repositories are read-only references.
 */
// Cleanup Status: Clean
// Cleanup Info: Theme initialization reviewed; storage access is guarded and fallback behavior is retained.

// UI Components: 0
// SDK UI Components: 0
// Custom UI Components: 0
// CSS Selectors: 0
// DOM APIs: localStorage and document.documentElement
// Cleanup: Theme bootstrap only; guarded storage access and fallback retained.

(() => {
  try {
    const savedTheme = localStorage.getItem("shivanya-theme");

    document.documentElement.dataset.theme =
      savedTheme === "dark" ? "dark" : "light";
  } catch {
    document.documentElement.dataset.theme = "light";
  }
})();
