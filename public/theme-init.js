// File: public/theme-init.js
// Cleanup Status: Clean
// Cleanup Info: Theme initialization reviewed; storage access is guarded and fallback behavior is retained.

(() => {
  try {
    const savedTheme = localStorage.getItem("shivanya-theme");

    document.documentElement.dataset.theme =
      savedTheme === "dark" ? "dark" : "light";
  } catch {
    document.documentElement.dataset.theme = "light";
  }
})();
