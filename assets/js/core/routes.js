export const ROUTES = {
  home: "index.html",
  pack: "pack.html",
  quote: "cotizar.html",
  services: "servicios.html",
}

export const SECTION_IDS = {
  packs: "packs",
  projects: "proyectos",
  about: "sobre-mi",
  process: "proceso",
  faq: "faq",
}

const PACK_ID_PARAM = "id"
const QUOTE_PACK_PARAM = "pack"

export function packHref(packId) {
  return `${ROUTES.pack}?${PACK_ID_PARAM}=${encodeURIComponent(packId)}`
}

export function quoteHref(packId) {
  return `${ROUTES.quote}?${QUOTE_PACK_PARAM}=${encodeURIComponent(packId)}`
}

export function homeSectionHref(sectionId) {
  return `${ROUTES.home}#${sectionId}`
}

export function readPackIdParam() {
  return new URLSearchParams(window.location.search).get(PACK_ID_PARAM)
}

export function readQuotePackParam() {
  return new URLSearchParams(window.location.search).get(QUOTE_PACK_PARAM)
}
