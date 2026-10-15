import { initAnimations } from "./animations.js"
import { applyStaticText } from "./core/text.js"
import { renderChrome, updateThemeToggle } from "./render/chrome.js"
import { bindScreenshotFallbacks } from "./render/components.js"
import { renderFinalCta } from "./render/cta.js"
import { renderHome } from "./render/home.js"
import { renderPackDetail } from "./render/pack-detail.js"
import { captureQuoteDraft, renderQuotePage } from "./render/quote.js"
import { renderServices } from "./render/services.js"
import { applyInitialTheme, watchSystemTheme } from "./theme.js"

function renderPage() {
  renderChrome({ onLanguageChange: handleLanguageChange })
  applyStaticText()
  renderHome()
  renderPackDetail()
  renderServices()
  renderQuotePage()
  renderFinalCta()
  bindScreenshotFallbacks()
}

// El navegador salta al #ancla antes de que JS dibuje las secciones, cuando la página
// todavía no tiene su alto final; por eso se repite el salto después del render.
function scrollToInitialHash() {
  const targetId = decodeURIComponent(window.location.hash.slice(1))
  if (!targetId) return
  document.getElementById(targetId)?.scrollIntoView({ behavior: "instant" })
}

function handleLanguageChange() {
  captureQuoteDraft()
  renderPage()
  initAnimations({ isFirstRender: false })
}

function start() {
  applyInitialTheme()
  renderPage()
  scrollToInitialHash()
  initAnimations({ isFirstRender: true })
  watchSystemTheme(updateThemeToggle)
}

start()
