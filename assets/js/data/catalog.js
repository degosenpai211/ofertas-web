export const USD_RATE = 11
export const BUNDLE_DISCOUNT_RATE = 0.25
export const BUNDLE_ID = "bundleLandings"

const DEMO_PAGE_FOLDER = "ejemplos"
const SCREENSHOT_FOLDER = "assets/img/demos"
const BUNDLE_COMPONENT_IDS = ["pack1", "pack3"]

function createDemo({ slug, brand, color, page = `${slug}.html` }) {
  return {
    slug,
    brand,
    color,
    href: `${DEMO_PAGE_FOLDER}/${page}`,
    screenshot: `${SCREENSHOT_FOLDER}/${slug}.webp`,
  }
}

const DEMOS = {
  landingOne: createDemo({ slug: "landing-1", brand: "Café Barrio", color: "#3C2A1E" }),
  landingThree: createDemo({ slug: "landing-3", brand: "Lucía Mendes", color: "#11403F" }),
  web: createDemo({ slug: "web", brand: "Estudio Vargas", color: "#0D2137", page: "web/" }),
  shop: createDemo({ slug: "tienda", brand: "Andes Market", color: "#8C3B2A" }),
  frontend: createDemo({ slug: "frontend-pro", brand: "Aurea Studio", color: "#1A1816" }),
  ai: createDemo({ slug: "ia", brand: "Hiland Bot", color: "#2F6F62" }),
  crud: createDemo({ slug: "crud", brand: "Panel Norte", color: "#1C1916" }),
  erp: createDemo({ slug: "erp", brand: "Taller OS", color: "#12202C" }),
  data: createDemo({ slug: "datos", brand: "Taller en números", color: "#22313F" }),
}

const LANDING_THREE_EXTRAS = [
  { id: "extraSection", priceBs: 350 },
  { id: "formToEmail", priceBs: 250 },
  { id: "secondLanguagePair", priceBs: 600 },
  { id: "photoGallery", priceBs: 300 },
  { id: "seoExtra", priceBs: 400 },
  { id: "testimonials", priceBs: 280 },
  { id: "bookingCalendar", priceBs: 350 },
  { id: "heroVideo", priceBs: 400 },
]

export const PACK_CATEGORIES = ["web", "systems", "dataAi"]

export const PACKS = [
  {
    id: "pack1",
    category: "web",
    priceBs: 720,
    days: { min: 3, max: 6 },
    featured: false,
    demos: [DEMOS.landingOne],
    extras: [
      { id: "extraSectionFromSecond", priceBs: 350 },
      { id: "copywriting", priceBs: 250 },
      { id: "analyticsPixel", priceBs: 180 },
      { id: "entranceAnimation", priceBs: 200 },
      { id: "faviconOpenGraph", priceBs: 120 },
      { id: "googleMap", priceBs: 150 },
      { id: "callButton", priceBs: 100 },
      { id: "openingHours", priceBs: 80 },
    ],
  },
  {
    id: "pack3",
    category: "web",
    priceBs: 1800,
    days: { min: 6, max: 10 },
    featured: true,
    demos: [DEMOS.landingThree],
    extras: LANDING_THREE_EXTRAS,
  },
  {
    id: "packWeb",
    category: "web",
    priceBs: 3500,
    days: { min: 11, max: 17 },
    featured: false,
    demos: [DEMOS.web],
    extras: [
      { id: "extraPage", priceBs: 400 },
      { id: "staticBlog", priceBs: 900 },
      { id: "secondLanguage", priceBs: 700 },
      { id: "textPanel", priceBs: 800 },
      { id: "domainHosting", priceBs: 300 },
      { id: "floatingWhatsapp", priceBs: 150 },
      { id: "mapDirections", priceBs: 200 },
      { id: "themeToggle", priceBs: 400 },
      { id: "workCarousel", priceBs: 350 },
    ],
  },
  {
    id: "packShop",
    category: "web",
    priceBs: 8500,
    days: { min: 22, max: 34 },
    featured: false,
    demos: [DEMOS.shop],
    extras: [
      { id: "extraProduct", priceBs: 25, perUnit: true },
      { id: "stripe", priceBs: 1400 },
      { id: "bankQr", priceBs: 350 },
      { id: "coupons", priceBs: 600 },
      { id: "stockAlerts", priceBs: 800 },
      { id: "ordersToSheets", priceBs: 450 },
      { id: "variants", priceBs: 700 },
      { id: "wishlist", priceBs: 500 },
      { id: "orderEmail", priceBs: 350 },
    ],
  },
  {
    id: "packFront",
    category: "web",
    priceBs: 3200,
    days: { min: 8, max: 13 },
    featured: false,
    demos: [DEMOS.frontend],
    extras: [
      { id: "extraInnerPage", priceBs: 550 },
      { id: "themeToggle", priceBs: 400 },
      { id: "webgl", priceBs: 1800 },
      { id: "secondLanguageMotion", priceBs: 700 },
      { id: "casesCarousel", priceBs: 400 },
      { id: "tooltips", priceBs: 250 },
      { id: "animatedPricing", priceBs: 350 },
    ],
  },
  {
    id: "packIA",
    category: "dataAi",
    priceBs: 2200,
    days: { min: 6, max: 11 },
    featured: false,
    demos: [DEMOS.ai],
    extras: [
      { id: "extraChannel", priceBs: 800 },
      { id: "ragPdf", priceBs: 1200 },
      { id: "voice", priceBs: 900 },
      { id: "extraTool", priceBs: 700 },
      { id: "promptTuning", priceBs: 250 },
      { id: "quietHours", priceBs: 200 },
      { id: "humanHandoff", priceBs: 350 },
    ],
  },
  {
    id: "packData",
    category: "dataAi",
    priceBs: 1500,
    days: { min: 5, max: 9 },
    featured: false,
    demos: [DEMOS.data],
    extras: [
      { id: "extraSource", priceBs: 500 },
      { id: "monthlyRefresh", priceBs: 350 },
      { id: "liveDashboard", priceBs: 900 },
      { id: "forecast", priceBs: 800 },
      { id: "pdfReport", priceBs: 300 },
      { id: "teamSession", priceBs: 150 },
    ],
  },
  {
    id: "packCrud",
    category: "systems",
    priceBs: 4800,
    days: { min: 11, max: 22 },
    featured: false,
    demos: [DEMOS.crud],
    extras: [
      { id: "extraResource", priceBs: 1100 },
      { id: "exportCsv", priceBs: 400 },
      { id: "changeLog", priceBs: 600 },
      { id: "photoUpload", priceBs: 500 },
      { id: "combinedFilters", priceBs: 350 },
      { id: "readOnlyRole", priceBs: 450 },
      { id: "importCsv", priceBs: 400 },
    ],
  },
  {
    id: "packErp",
    category: "systems",
    // Precio conversable: se muestra como rango y la cotización suma el rango completo.
    priceBs: 6800,
    priceMaxBs: 8500,
    days: { min: 18, max: 29 },
    featured: false,
    demos: [DEMOS.erp],
    extras: [
      { id: "extraModule", priceBs: 2250 },
      { id: "loginRoles", priceBs: 1080 },
      { id: "reports", priceBs: 720 },
      { id: "whatsappFromOrder", priceBs: 540 },
      { id: "partsAlerts", priceBs: 405 },
      { id: "pwa", priceBs: 540 },
      { id: "secondBranch", priceBs: 1620 },
    ],
  },
]

function sumBundleListPrices() {
  return PACKS.filter((pack) => BUNDLE_COMPONENT_IDS.includes(pack.id)).reduce((sum, pack) => sum + pack.priceBs, 0)
}

const bundleOldPriceBs = sumBundleListPrices()

export const BUNDLE = {
  id: BUNDLE_ID,
  oldPriceBs: bundleOldPriceBs,
  priceBs: Math.round(bundleOldPriceBs * (1 - BUNDLE_DISCOUNT_RATE)),
  days: { min: 8, max: 13 },
  featured: false,
  demos: [DEMOS.landingOne, DEMOS.landingThree],
  extras: LANDING_THREE_EXTRAS,
}

export const QUOTE_PACK_IDS = [
  BUNDLE_ID,
  "pack1",
  "pack3",
  "packWeb",
  "packFront",
  "packIA",
  "packData",
  "packCrud",
  "packShop",
  "packErp",
]

export const QUOTE_EXTRAS = [
  { id: "extraPage", priceBs: 350 },
  { id: "secondLang", priceBs: 600 },
  { id: "formEmail", priceBs: 250 },
  { id: "qrBo", priceBs: 350 },
  { id: "stripe", priceBs: 1400 },
  { id: "api", priceBs: 500 },
  { id: "dashboard", priceBs: 1500 },
  { id: "aiHook", priceBs: 900 },
  { id: "erpModule", priceBs: 2250 },
  { id: "crudResource", priceBs: 1100 },
  { id: "maintenance", priceBs: 280 },
]

export const JOB_PRICE_KINDS = { fixed: "fixed", from: "from", monthly: "monthly" }

export const JOBS = [
  { id: "apiHookup", priceBs: 500, priceKind: JOB_PRICE_KINDS.from },
  { id: "miniBackend", priceBs: 2200, priceKind: JOB_PRICE_KINDS.from },
  { id: "formToSheets", priceBs: 450, priceKind: JOB_PRICE_KINDS.fixed },
  { id: "fixSite", priceBs: 350, priceKind: JOB_PRICE_KINDS.from },
  { id: "maintenance", priceBs: 280, priceKind: JOB_PRICE_KINDS.monthly },
  { id: "training", priceBs: 150, priceKind: JOB_PRICE_KINDS.fixed },
  { id: "frontendExtra", priceBs: 550, priceKind: JOB_PRICE_KINDS.from },
  { id: "aiHook", priceBs: 900, priceKind: JOB_PRICE_KINDS.from },
]

export function packsInCategory(category) {
  return PACKS.filter((pack) => pack.category === category)
}

export function findPack(packId) {
  if (packId === BUNDLE_ID) return BUNDLE
  return PACKS.find((pack) => pack.id === packId)
}
