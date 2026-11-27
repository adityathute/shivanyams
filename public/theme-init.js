// File: public/theme-init.js
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
