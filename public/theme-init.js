(() => {
  try {
    const savedTheme = localStorage.getItem("shivanya-theme");

    document.documentElement.dataset.theme =
      savedTheme === "dark" ? "dark" : "light";
  } catch {
    document.documentElement.dataset.theme = "light";
  }
})();