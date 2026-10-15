import { CONTACT } from "../config.js"
import { mailHref, waHref } from "../core/contact.js"
import { tabletUpQuery } from "../core/environment.js"
import { SUPPORTED_LANGS, getLang, saveLang } from "../core/preferences.js"
import { ROUTES, SECTION_IDS, homeSectionHref } from "../core/routes.js"
import { dict, fillTemplate } from "../core/text.js"
import { isDarkTheme, toggleTheme } from "../theme.js"
import { closeIcon, menuIcon, moonIcon, sunIcon } from "./icons.js"

const HEADER_ID = "site-header"
const FOOTER_ID = "site-footer"
const NAV_ID = "site-nav"
const HEADER_SCROLL_THRESHOLD_PX = 8
const SCROLLED_CLASS = "is-scrolled"
const MENU_OPEN_CLASS = "is-open"
const ESCAPE_KEY = "Escape"

const NAV_LINKS = [
  { labelKey: "navPacks", href: homeSectionHref(SECTION_IDS.packs) },
  { labelKey: "navProjects", href: homeSectionHref(SECTION_IDS.projects) },
  { labelKey: "navAbout", href: homeSectionHref(SECTION_IDS.about) },
  { labelKey: "navServices", href: ROUTES.services },
  { labelKey: "navFaq", href: homeSectionHref(SECTION_IDS.faq) },
]

const FOOTER_LINKS = [
  { labelKey: "navPacks", href: homeSectionHref(SECTION_IDS.packs) },
  { labelKey: "navProjects", href: homeSectionHref(SECTION_IDS.projects) },
  { labelKey: "navServices", href: ROUTES.services },
  { labelKey: "navQuote", href: ROUTES.quote },
]

let areGlobalListenersBound = false

function linkListMarkup(links, className) {
  const t = dict()
  return links.map(({ labelKey, href }) => `<li><a class="${className}" href="${href}">${t[labelKey]}</a></li>`).join("")
}

function themeToggleLabel() {
  const t = dict()
  return isDarkTheme() ? t.themeToLight : t.themeToDark
}

function themeToggleIcon() {
  return isDarkTheme() ? sunIcon() : moonIcon()
}

function otherLang() {
  return SUPPORTED_LANGS.find((lang) => lang !== getLang())
}

function headerMarkup() {
  const t = dict()
  return `<div class="wrap header-bar">
    <a class="brand" href="${ROUTES.home}">${t.brand}</a>
    <nav class="site-nav" id="${NAV_ID}" aria-label="${t.navLabel}">
      <ul class="nav-list">
        ${linkListMarkup(NAV_LINKS, "nav-link")}
        <li class="nav-quote-item"><a class="nav-link" href="${ROUTES.quote}">${t.navQuote}</a></li>
      </ul>
    </nav>
    <div class="header-actions">
      <button class="icon-btn" type="button" data-theme-toggle aria-label="${themeToggleLabel()}">${themeToggleIcon()}</button>
      <button class="icon-btn lang-btn" type="button" data-lang-toggle aria-label="${t.otherLangLabel}">${t.otherLang}</button>
      <a class="btn btn-primary header-quote" href="${ROUTES.quote}">${t.navQuote}</a>
      <button class="icon-btn menu-btn" type="button" data-menu-toggle aria-controls="${NAV_ID}" aria-expanded="false" aria-label="${t.menuOpen}">${menuIcon()}</button>
    </div>
  </div>`
}

function langSwitchMarkup() {
  const current = getLang()
  return SUPPORTED_LANGS.map(
    (lang) => `<button type="button" data-lang="${lang}" aria-pressed="${lang === current}">${lang.toUpperCase()}</button>`
  ).join("")
}

function footerMarkup() {
  const t = dict()
  const copyright = fillTemplate(t.footerCopyright, { year: new Date().getFullYear(), owner: CONTACT.ownerName })
  return `<div class="wrap footer-grid">
    <div class="footer-brand">
      <a class="brand" href="${ROUTES.home}">${t.brand}</a>
      <p>${t.city}</p>
    </div>
    <nav aria-label="${t.footerLinksTitle}">
      <h2 class="footer-title">${t.footerLinksTitle}</h2>
      <ul class="footer-list">${linkListMarkup(FOOTER_LINKS, "footer-link")}</ul>
    </nav>
    <div>
      <h2 class="footer-title">${t.footerContactTitle}</h2>
      <ul class="footer-list">
        <li><a class="footer-link" href="${mailHref()}">${CONTACT.email}</a></li>
        <li><a class="footer-link" href="${waHref()}">${t.writeWa} · ${CONTACT.phoneLabel}</a></li>
        <li><a class="footer-link" href="${CONTACT.github}" target="_blank" rel="noopener">GitHub</a></li>
        <li><a class="footer-link" href="${CONTACT.linkedin}" target="_blank" rel="noopener">LinkedIn</a></li>
      </ul>
    </div>
    <div>
      <h2 class="footer-title">${t.footerLangTitle}</h2>
      <div class="lang-switch" role="group" aria-label="${t.footerLangTitle}">${langSwitchMarkup()}</div>
    </div>
  </div>
  <div class="wrap footer-bottom">
    <p>${copyright}</p>
  </div>`
}

function findMenuParts() {
  const header = document.getElementById(HEADER_ID)
  return {
    nav: header?.querySelector(`#${NAV_ID}`),
    button: header?.querySelector("[data-menu-toggle]"),
  }
}

function setMenuOpen(isOpen) {
  const { nav, button } = findMenuParts()
  if (!nav || !button) return
  const t = dict()
  nav.classList.toggle(MENU_OPEN_CLASS, isOpen)
  button.setAttribute("aria-expanded", String(isOpen))
  button.setAttribute("aria-label", isOpen ? t.menuClose : t.menuOpen)
  button.innerHTML = isOpen ? closeIcon() : menuIcon()
}

function isMenuOpen() {
  return findMenuParts().nav?.classList.contains(MENU_OPEN_CLASS) ?? false
}

export function updateThemeToggle() {
  const button = document.querySelector("[data-theme-toggle]")
  if (!button) return
  button.setAttribute("aria-label", themeToggleLabel())
  button.innerHTML = themeToggleIcon()
}

function changeLanguage(lang, onLanguageChange) {
  if (lang === getLang()) return
  saveLang(lang)
  onLanguageChange()
}

function bindHeaderControls(header, onLanguageChange) {
  header.querySelector("[data-theme-toggle]").addEventListener("click", () => {
    toggleTheme()
    updateThemeToggle()
  })
  header.querySelector("[data-lang-toggle]").addEventListener("click", () => changeLanguage(otherLang(), onLanguageChange))
  header.querySelector("[data-menu-toggle]").addEventListener("click", () => setMenuOpen(!isMenuOpen()))
  header.querySelector(`#${NAV_ID}`).addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenuOpen(false)
  })
}

function bindFooterControls(footer, onLanguageChange) {
  footer.querySelectorAll("[data-lang]").forEach((button) => {
    button.addEventListener("click", () => changeLanguage(button.dataset.lang, onLanguageChange))
  })
}

function updateHeaderBackground() {
  const header = document.getElementById(HEADER_ID)
  header?.classList.toggle(SCROLLED_CLASS, window.scrollY > HEADER_SCROLL_THRESHOLD_PX)
}

function bindGlobalListeners() {
  if (areGlobalListenersBound) return
  areGlobalListenersBound = true
  window.addEventListener("scroll", updateHeaderBackground, { passive: true })
  document.addEventListener("keydown", (event) => {
    if (event.key === ESCAPE_KEY && isMenuOpen()) setMenuOpen(false)
  })
  tabletUpQuery().addEventListener("change", (query) => {
    if (query.matches) setMenuOpen(false)
  })
}

export function renderChrome({ onLanguageChange }) {
  const header = document.getElementById(HEADER_ID)
  const footer = document.getElementById(FOOTER_ID)
  if (header) {
    header.innerHTML = headerMarkup()
    bindHeaderControls(header, onLanguageChange)
  }
  if (footer) {
    footer.innerHTML = footerMarkup()
    bindFooterControls(footer, onLanguageChange)
  }
  bindGlobalListeners()
  updateHeaderBackground()
}
