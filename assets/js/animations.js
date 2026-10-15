import { prefersReducedMotion } from "./core/environment.js"
import { formatNumber } from "./core/format.js"

const REVEAL_SELECTOR = ".reveal"
const COUNT_SELECTOR = "[data-count]"
const SPOTLIGHT_SELECTOR = ".spotlight"
const REVEAL_ENABLED_CLASS = "has-reveal"
const VISIBLE_CLASS = "is-visible"
const REVEAL_DELAY_PROPERTY = "--reveal-delay"
const REVEAL_STAGGER_MS = 90
const REVEAL_ROOT_MARGIN = "0px 0px -8% 0px"
const COUNT_UP_DURATION_MS = 900
const COUNT_UP_START_VALUE = 0
const EASE_OUT_POWER = 3
const ELEMENT_IDS = { mobileQuote: "mobile-quote", hero: "hero", finalCta: "cta-final" }

const root = document.documentElement
let activeObservers = []
let isSpotlightBound = false

function disconnectObservers() {
  activeObservers.forEach((observer) => observer.disconnect())
  activeObservers = []
}

function observeOnce({ targets, onEnter, rootMargin = "0px" }) {
  const observer = new IntersectionObserver((entries) => {
    const entering = entries.filter((entry) => entry.isIntersecting).map((entry) => entry.target)
    entering.forEach((target) => observer.unobserve(target))
    if (entering.length > 0) onEnter(entering)
  }, { rootMargin })
  targets.forEach((target) => observer.observe(target))
  activeObservers.push(observer)
}

function groupBySection(elements) {
  const groups = new Map()
  elements.forEach((element) => {
    const section = element.closest("section") ?? document.body
    if (!groups.has(section)) groups.set(section, [])
    groups.get(section).push(element)
  })
  return [...groups.values()]
}

function revealGroup(elements) {
  elements.forEach((element, order) => {
    element.style.setProperty(REVEAL_DELAY_PROPERTY, `${order * REVEAL_STAGGER_MS}ms`)
    element.classList.add(VISIBLE_CLASS)
  })
}

function enableReveals() {
  root.classList.add(REVEAL_ENABLED_CLASS)
  observeOnce({
    targets: document.querySelectorAll(`${REVEAL_SELECTOR}:not(.${VISIBLE_CLASS})`),
    onEnter: (elements) => groupBySection(elements).forEach(revealGroup),
    rootMargin: REVEAL_ROOT_MARGIN,
  })
}

function showRevealsImmediately() {
  root.classList.remove(REVEAL_ENABLED_CLASS)
}

function easeOut(progress) {
  return 1 - (1 - progress) ** EASE_OUT_POWER
}

function animateCount(element) {
  const target = Number(element.dataset.count)
  const startTime = performance.now()
  const step = (now) => {
    const progress = Math.min((now - startTime) / COUNT_UP_DURATION_MS, 1)
    element.textContent = formatNumber(target * easeOut(progress))
    if (progress < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

// Se fija el ancho final antes de contar para que el texto vecino ("Bs") no se mueva.
function reserveFinalWidths(counters) {
  const widths = counters.map((counter) => counter.getBoundingClientRect().width)
  counters.forEach((counter, index) => {
    counter.style.minWidth = `${widths[index]}px`
    counter.textContent = formatNumber(COUNT_UP_START_VALUE)
  })
}

// Se espera a las fuentes web: medir con la fuente de respaldo daría un ancho incorrecto.
function observeCountUps() {
  document.fonts.ready.then(() => {
    const counters = [...document.querySelectorAll(COUNT_SELECTOR)].filter((counter) => counter.isConnected)
    reserveFinalWidths(counters)
    observeOnce({ targets: counters, onEnter: (elements) => elements.forEach(animateCount) })
  })
}

function moveSpotlight(event) {
  const card = event.target.closest?.(SPOTLIGHT_SELECTOR)
  if (!card) return
  const bounds = card.getBoundingClientRect()
  card.style.setProperty("--x", `${event.clientX - bounds.left}px`)
  card.style.setProperty("--y", `${event.clientY - bounds.top}px`)
}

function bindSpotlight() {
  if (isSpotlightBound) return
  isSpotlightBound = true
  document.addEventListener("pointermove", moveSpotlight, { passive: true })
}

function setMobileQuoteVisible(button, isVisible) {
  button.classList.toggle(VISIBLE_CLASS, isVisible)
  button.toggleAttribute("inert", !isVisible)
}

function bindMobileQuote() {
  const button = document.getElementById(ELEMENT_IDS.mobileQuote)
  const hero = document.getElementById(ELEMENT_IDS.hero)
  const finalCta = document.getElementById(ELEMENT_IDS.finalCta)
  if (!button || !hero || !finalCta) return
  const state = { isPastHero: false, hasReachedFinalCta: false }
  setMobileQuoteVisible(button, false)
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const isAbove = entry.boundingClientRect.top < 0
      if (entry.target === hero) state.isPastHero = !entry.isIntersecting && isAbove
      else state.hasReachedFinalCta = entry.isIntersecting || isAbove
    })
    setMobileQuoteVisible(button, state.isPastHero && !state.hasReachedFinalCta)
  })
  observer.observe(hero)
  observer.observe(finalCta)
  activeObservers.push(observer)
}

export function initAnimations({ isFirstRender }) {
  disconnectObservers()
  bindMobileQuote()
  if (prefersReducedMotion() || !isFirstRender) {
    showRevealsImmediately()
    if (!prefersReducedMotion()) bindSpotlight()
    return
  }
  bindSpotlight()
  enableReveals()
  observeCountUps()
}
