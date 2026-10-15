import { prefersReducedMotion } from "./core/environment.js"
import { getSavedTheme, saveTheme } from "./core/preferences.js"

const THEMES = { light: "light", dark: "dark" }
const DARK_SCHEME_QUERY = "(prefers-color-scheme: dark)"
const THEME_TRANSITION_MS = 400
const THEME_CHANGING_CLASS = "is-theme-changing"
const THEME_DURATION_PROPERTY = "--theme-transition-duration"

const root = document.documentElement

function systemTheme() {
  return window.matchMedia(DARK_SCHEME_QUERY).matches ? THEMES.dark : THEMES.light
}

function setThemeAttribute(theme) {
  root.dataset.theme = theme
}

export function isDarkTheme() {
  return root.dataset.theme === THEMES.dark
}

export function applyInitialTheme() {
  root.style.setProperty(THEME_DURATION_PROPERTY, `${THEME_TRANSITION_MS}ms`)
  setThemeAttribute(getSavedTheme() ?? systemTheme())
}

// La transición de colores solo se activa durante el cambio, para no pisar las
// transiciones de hover del resto del tiempo.
function runThemeTransition(changeTheme) {
  if (prefersReducedMotion()) {
    changeTheme()
    return
  }
  root.classList.add(THEME_CHANGING_CLASS)
  changeTheme()
  window.setTimeout(() => root.classList.remove(THEME_CHANGING_CLASS), THEME_TRANSITION_MS)
}

export function toggleTheme() {
  const nextTheme = isDarkTheme() ? THEMES.light : THEMES.dark
  saveTheme(nextTheme)
  runThemeTransition(() => setThemeAttribute(nextTheme))
}

export function watchSystemTheme(onThemeChange) {
  window.matchMedia(DARK_SCHEME_QUERY).addEventListener("change", () => {
    if (getSavedTheme()) return
    runThemeTransition(() => setThemeAttribute(systemTheme()))
    onThemeChange()
  })
}
