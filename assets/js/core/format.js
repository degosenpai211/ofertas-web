import { USD_RATE } from "../data/catalog.js"

export const BS_LABEL = "Bs"

const USD_LABEL = "USD"
const THOUSANDS_SEPARATOR = "."
const THOUSANDS_GROUPS = /\B(?=(\d{3})+(?!\d))/g
const USD_ROUNDING_STEP = 5
const USD_FINE_ROUNDING_LIMIT = 20
const PERCENT_FACTOR = 100

export function formatNumber(value) {
  return String(Math.round(value)).replace(THOUSANDS_GROUPS, THOUSANDS_SEPARATOR)
}

export function formatBs(amountBs) {
  return `${formatNumber(amountBs)} ${BS_LABEL}`
}

export function formatUsd(amountUsd) {
  return `${USD_LABEL} ${formatNumber(amountUsd)}`
}

// Los extras chicos mantienen el dólar exacto; los precios grandes redondean a 5 para leerse como precio de lista.
export function toUsd(amountBs) {
  const exactUsd = amountBs / USD_RATE
  if (exactUsd < USD_FINE_ROUNDING_LIMIT) return Math.round(exactUsd)
  return Math.round(exactUsd / USD_ROUNDING_STEP) * USD_ROUNDING_STEP
}

export function formatPricePair(amountBs) {
  return `${formatBs(amountBs)} (${formatUsd(toUsd(amountBs))})`
}

// Un pack con priceMaxBs se muestra como rango conversable; el resto, como precio cerrado.
export function formatBsRange(minBs, maxBs) {
  if (!maxBs) return formatBs(minBs)
  return `${formatNumber(minBs)}–${formatBs(maxBs)}`
}

export function formatUsdRange(minBs, maxBs) {
  if (!maxBs) return formatUsd(toUsd(minBs))
  return `${USD_LABEL} ${formatNumber(toUsd(minBs))}–${formatNumber(toUsd(maxBs))}`
}

export function formatPackPricePair(pack) {
  return `${formatBsRange(pack.priceBs, pack.priceMaxBs)} (${formatUsdRange(pack.priceBs, pack.priceMaxBs)})`
}

export function formatDays(days, unit) {
  return `${days.min}–${days.max} ${unit}`
}

export function formatPercent(rate) {
  return `${Math.round(rate * PERCENT_FACTOR)}%`
}
