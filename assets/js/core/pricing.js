import { BUNDLE, BUNDLE_DISCOUNT_RATE, PACKS } from "../data/catalog.js"
import { formatBs, formatBsRange, formatPercent } from "./format.js"
import { fillTemplate } from "./text.js"

export function bundleSavingsBs() {
  return BUNDLE.oldPriceBs - BUNDLE.priceBs
}

function priceTokens() {
  const tokens = {
    discount: formatPercent(BUNDLE_DISCOUNT_RATE),
    bundleOld: formatBs(BUNDLE.oldPriceBs),
    savings: formatBs(bundleSavingsBs()),
  }
  PACKS.forEach((pack) => {
    tokens[pack.id] = formatBsRange(pack.priceBs, pack.priceMaxBs)
  })
  return tokens
}

export function withPrices(text) {
  return fillTemplate(text, priceTokens())
}
