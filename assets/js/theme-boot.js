// Script clásico en <head>: fija el tema antes del primer pintado. Los ES modules se
// ejecutan después y producirían un parpadeo. La clave debe coincidir con THEME_STORAGE_KEY.
(function applySavedTheme() {
  const THEME_STORAGE_KEY = "ofertas-theme"
  const saved = localStorage.getItem(THEME_STORAGE_KEY)
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
  const isDark = saved === "dark" || (saved !== "light" && prefersDark)
  document.documentElement.dataset.theme = isDark ? "dark" : "light"
})()
