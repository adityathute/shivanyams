(() => {
  try {
    const hasAuthToken = sessionStorage.getItem("shivanya.auth.access");
    const savedTheme = localStorage.getItem("shivanya-theme");

    const theme =
      hasAuthToken && (savedTheme === "dark" || savedTheme === "light")
        ? savedTheme
        : "light";

    document.documentElement.dataset.theme = theme;
  } catch {
    document.documentElement.dataset.theme = "light";
  }
})();