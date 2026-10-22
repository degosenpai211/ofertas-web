import { BS_LABEL, formatBs, formatDays, formatNumber, formatPricePair, formatUsd, formatUsdRange, toUsd } from "../core/format.js"
import { dict, fillTemplate } from "../core/text.js"
import { arrowIcon } from "./icons.js"

const SCREENSHOT_SIZE = { width: 640, height: 400 }
const PLACEHOLDER_SELECTOR = ".shot-placeholder"
const SCREENSHOT_IMAGE_SELECTOR = ".shot-image"

export function renderInto(elementId, buildMarkup) {
  const container = document.getElementById(elementId)
  if (!container) return
  container.innerHTML = buildMarkup()
}

export function renderScreenshot(demo) {
  const alt = fillTemplate(dict().screenshotAlt, { brand: demo.brand })
  return `<div class="shot" style="--brand-color: ${demo.color}">
    <span class="shot-placeholder" aria-hidden="true">${demo.brand}</span>
    <img class="shot-image" src="${demo.screenshot}" alt="${alt}" width="${SCREENSHOT_SIZE.width}" height="${SCREENSHOT_SIZE.height}" loading="lazy" decoding="async" />
  </div>`
}

function showPlaceholderInstead(image) {
  const placeholder = image.parentElement?.querySelector(PLACEHOLDER_SELECTOR)
  if (placeholder) {
    placeholder.removeAttribute("aria-hidden")
    placeholder.setAttribute("role", "img")
    placeholder.setAttribute("aria-label", image.alt)
  }
  image.remove()
}

export function bindScreenshotFallbacks() {
  document.querySelectorAll(SCREENSHOT_IMAGE_SELECTOR).forEach((image) => {
    if (image.complete && image.naturalWidth === 0) {
      showPlaceholderInstead(image)
      return
    }
    image.addEventListener("error", () => showPlaceholderInstead(image), { once: true })
  })
}

function renderCountedNumber(amountBs) {
  return `<span class="count-value" data-count="${amountBs}">${formatNumber(amountBs)}</span>`
}

export function renderCountedBs(amountBs, maxBs) {
  const range = maxBs ? `${renderCountedNumber(amountBs)}–${renderCountedNumber(maxBs)}` : renderCountedNumber(amountBs)
  return `${range} ${BS_LABEL}`
}

export function renderUsdAndDays(pack) {
  const t = dict()
  const negotiable = pack.priceMaxBs ? ` · ${t.negotiablePrice}` : ""
  return `${formatUsdRange(pack.priceBs, pack.priceMaxBs)} · ${formatDays(pack.days, t.daysUnit)}${negotiable}`
}

export function renderOldPrice(amountBs) {
  return `<s class="price-old"><span class="visually-hidden">${dict().oldPrice}: </span>${formatBs(amountBs)}</s>`
}

export function renderLinkLabel(label) {
  return `<span class="card-link">${label} ${arrowIcon()}</span>`
}

export function renderMediaCard({ href, demo, title, content, linkLabel, isFeatured }) {
  const featuredClass = isFeatured ? " is-featured" : ""
  const badge = isFeatured ? `<span class="badge card-badge">${dict().featuredBadge}</span>` : ""
  return `<a class="card spotlight reveal${featuredClass}" href="${href}">
    ${badge}
    <div class="card-media">${renderScreenshot(demo)}</div>
    <div class="card-body">
      <h3 class="card-title">${title}</h3>
      ${content}
      ${renderLinkLabel(linkLabel)}
    </div>
  </a>`
}

function formatExtraBs(extra) {
  const suffix = extra.perUnit ? ` ${dict().perUnit}` : ""
  return `${formatBs(extra.priceBs)}${suffix}`
}

function renderTipButton(extra, name) {
  const label = fillTemplate(dict().extraTipLabel, { name })
  return `<button class="tip-btn" type="button" data-tip="${formatPricePair(extra.priceBs)}" aria-label="${label}">i</button>`
}

function renderExtraRow(extra, showTips) {
  const name = dict().extraNames[extra.id]
  const tip = showTips ? renderTipButton(extra, name) : ""
  return `<tr>
    <td>${name}${tip}</td>
    <td class="is-numeric">
      <span class="price-bs">${formatExtraBs(extra)}</span>
      <span class="price-usd">${formatUsd(toUsd(extra.priceBs))}</span>
    </td>
  </tr>`
}

export function renderExtrasTable({ extras, showTips }) {
  const t = dict()
  return `<table class="data-table extras-table">
    <thead><tr>
      <th scope="col">${t.extraItem}</th>
      <th scope="col" class="is-numeric">${t.extraPrice}</th>
    </tr></thead>
    <tbody>${extras.map((extra) => renderExtraRow(extra, showTips)).join("")}</tbody>
  </table>`
}
