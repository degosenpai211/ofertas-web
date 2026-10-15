export const THEME_STORAGE_KEY = "ofertas-theme"
export const SUPPORTED_LANGS = ["es", "en"]

const LANG_STORAGE_KEY = "ofertas-lang"
const DEFAULT_LANG = "es"
const SAVED_THEMES = ["light", "dark"]

export function getLang() {
  const saved = localStorage.getItem(LANG_STORAGE_KEY)
  return SUPPORTED_LANGS.includes(saved) ? saved : DEFAULT_LANG
}

export function saveLang(lang) {
  localStorage.setItem(LANG_STORAGE_KEY, lang)
}

export function getSavedTheme() {
  const saved = localStorage.getItem(THEME_STORAGE_KEY)
  return SAVED_THEMES.includes(saved) ? saved : null
}

export function saveTheme(theme) {
  localStorage.setItem(THEME_STORAGE_KEY, theme)
}
