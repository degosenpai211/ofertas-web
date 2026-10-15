import { formatPercent } from "../core/format.js"
import { withPrices } from "../core/pricing.js"
import { ROUTES, SECTION_IDS, homeSectionHref, quoteHref, readPackIdParam } from "../core/routes.js"
import { dict, fillTemplate } from "../core/text.js"
import { BUNDLE_DISCOUNT_RATE, findPack } from "../data/catalog.js"
import { renderCountedBs, renderExtrasTable, renderOldPrice, renderUsdAndDays } from "./components.js"
import { checkIcon, minusIcon } from "./icons.js"

const CONTAINER_ID = "pack-detail"
const TIP_ID = "float-tip"
const TIP_VISIBLE_CLASS = "is-visible"
const TIP_OFFSET_PX = 8
const DEFAULT_PACK_ID = "pack1"

function breadcrumbsMarkup(packName) {
  const t = dict()
  return `<nav class="breadcrumbs" aria-label="${t.breadcrumbLabel}">
    <ol>
      <li><a href="${ROUTES.home}">${t.breadcrumbHome}</a></li>
      <li><a href="${homeSectionHref(SECTION_IDS.packs)}">${t.navPacks}</a></li>
      <li aria-current="page">${packName}</li>
    </ol>
  </nav>`
}

function promoMarkup(pack) {
  if (!pack.oldPriceBs) return ""
  const label = fillTemplate(dict().promoFirstPurchase, { discount: formatPercent(BUNDLE_DISCOUNT_RATE) })
  return `<span class="badge">${label}</span>`
}

function summaryMarkup(pack, text) {
  const oldPrice = pack.oldPriceBs ? renderOldPrice(pack.oldPriceBs) : ""
  return `<header class="pack-summary reveal">
    ${promoMarkup(pack)}
    <h1 class="pack-title">${text.name}</h1>
    <p class="pack-price-row">
      ${oldPrice}
      <span class="price-main">${renderCountedBs(pack.priceBs)}</span>
      <span class="price-meta">${renderUsdAndDays(pack)}</span>
    </p>
    <p class="section-lead">${withPrices(text.blurb)}</p>
    <div class="button-row">
      <a class="btn btn-primary" href="${quoteHref(pack.id)}">${dict().quoteThisPack}</a>
    </div>
  </header>`
}

function demoFrameMarkup(demo) {
  const t = dict()
  return `<figure class="browser-frame reveal">
    <div class="browser-bar">
      <span class="browser-dots" aria-hidden="true"><span></span><span></span><span></span></span>
      <span class="browser-url">${demo.href}</span>
      <a class="browser-open" href="${demo.href}" target="_blank" rel="noopener">${t.openFull}</a>
    </div>
    <iframe src="${demo.href}" title="${fillTemplate(t.demoLabel, { brand: demo.brand })}" loading="lazy"></iframe>
  </figure>`
}

function includesMarkup(text) {
  const items = text.includes
    .map((item) => `<li><span class="check-icon">${checkIcon()}</span><span>${withPrices(item)}</span></li>`)
    .join("")
  return `<section class="pack-block reveal">
    <h2 class="block-title">${dict().includes}</h2>
    <ul class="check-list">${items}</ul>
  </section>`
}

function factMarkup(title, description) {
  return `<section class="fact reveal">
    <h2 class="fact-title">${title}</h2>
    <p>${description}</p>
  </section>`
}

function extrasMarkup(pack) {
  const t = dict()
  return `<section class="pack-block reveal">
    <h2 class="block-title">${t.extrasSectionTitle}</h2>
    <div class="table-scroll">${renderExtrasTable({ extras: pack.extras, showTips: true })}</div>
    <div class="float-tip" id="${TIP_ID}" role="tooltip"></div>
  </section>`
}

function excludesMarkup(items) {
  if (!items?.length) return ""
  const t = dict()
  const list = items
    .map((item) => `<li class="excludes-item"><span class="excludes-icon">${minusIcon()}</span>${item}</li>`)
    .join("")
  return `<section class="excludes pack-excludes reveal">
    <h2 class="block-title">${t.excludesTitle}</h2>
    <ul class="excludes-list">${list}</ul>
  </section>`
}

function packDetailMarkup(pack, text) {
  const t = dict()
  return [
    breadcrumbsMarkup(text.name),
    summaryMarkup(pack, text),
    `<div class="demo-stack">${pack.demos.map(demoFrameMarkup).join("")}</div>`,
    includesMarkup(text),
    `<div class="facts">${factMarkup(t.goodFor, text.goodFor)}${factMarkup(t.stack, text.stack)}</div>`,
    extrasMarkup(pack),
    excludesMarkup(text.excludes),
  ].join("")
}

function positionTip(button, tip) {
  const { computePosition, offset, flip, shift } = window.FloatingUIDOM
  computePosition(button, tip, {
    placement: "top",
    strategy: "fixed",
    middleware: [offset(TIP_OFFSET_PX), flip(), shift()],
  }).then(({ x, y }) => {
    tip.style.left = `${x}px`
    tip.style.top = `${y}px`
  })
}

// Floating UI se carga como script clásico solo en pack.html para este tooltip.
function bindTips(container) {
  const tip = container.querySelector(`#${TIP_ID}`)
  if (!tip || !window.FloatingUIDOM) return
  container.querySelectorAll("[data-tip]").forEach((button) => {
    const show = () => {
      tip.textContent = button.dataset.tip
      tip.classList.add(TIP_VISIBLE_CLASS)
      positionTip(button, tip)
    }
    const hide = () => tip.classList.remove(TIP_VISIBLE_CLASS)
    button.addEventListener("mouseenter", show)
    button.addEventListener("focus", show)
    button.addEventListener("mouseleave", hide)
    button.addEventListener("blur", hide)
  })
}

export function renderPackDetail() {
  const container = document.getElementById(CONTAINER_ID)
  if (!container) return
  const t = dict()
  const packId = readPackIdParam() || DEFAULT_PACK_ID
  const pack = findPack(packId)
  const text = pack ? t[packId] : undefined
  if (!pack || !text) {
    container.innerHTML = `<p class="section-lead">${t.packNotFound}</p>`
    return
  }
  document.title = `${text.name} · ${t.brand}`
  container.innerHTML = packDetailMarkup(pack, text)
  bindTips(container)
}
