import { formatBs, formatBsRange, formatDays, formatUsdRange } from "../core/format.js"
import { bundleSavingsBs, withPrices } from "../core/pricing.js"
import { packHref } from "../core/routes.js"
import { dict, fillTemplate } from "../core/text.js"
import { CONTACT } from "../config.js"
import { BUNDLE, PACKS, PACK_CATEGORIES, packsInCategory } from "../data/catalog.js"
import {
  renderCountedBs,
  renderExtrasTable,
  renderInto,
  renderLinkLabel,
  renderMediaCard,
  renderOldPrice,
  renderScreenshot,
  renderUsdAndDays,
} from "./components.js"

const CONTAINER_IDS = {
  heroOffer: "hero-offer",
  techMarquee: "tech-marquee",
  packGroups: "pack-groups",
  projectGrid: "project-grid",
  aboutBox: "about-box",
  extrasGrid: "mods-grid",
  processSteps: "process-steps",
  compareTable: "compare-table",
  faqList: "faq-list",
}
const ABOUT_PHOTO = { src: "assets/img/diego.webp", size: 512 }
const EXTRAS_PREVIEW_PACK_COUNT = 3
const EXTRAS_PREVIEW_ROW_COUNT = 3
const STEP_NUMBER_DIGITS = 2

const COMPARE_COLUMNS = [
  {
    labelKey: "comparePack",
    isRowHeader: true,
    cell: (pack, t) => `${t[pack.id].name}${pack.featured ? ` <span class="badge">${t.featuredBadge}</span>` : ""}`,
  },
  { labelKey: "comparePrice", isNumeric: true, cell: (pack) => formatBsRange(pack.priceBs, pack.priceMaxBs) },
  { labelKey: "compareUsd", isNumeric: true, cell: (pack) => formatUsdRange(pack.priceBs, pack.priceMaxBs) },
  { labelKey: "compareDays", cell: (pack, t) => formatDays(pack.days, t.daysUnit) },
  { labelKey: "compareExtras", isNumeric: true, cell: (pack) => String(pack.extras.length) },
  {
    labelKey: "compareLink",
    isLabelHidden: true,
    cell: (pack, t) => `<a class="table-link" href="${packHref(pack.id)}">${t.seePack}</a>`,
  },
]

function heroOfferMarkup() {
  const t = dict()
  const [frontDemo, backDemo] = BUNDLE.demos
  const savings = fillTemplate(t.offerSavings, { savings: formatBs(bundleSavingsBs()) })
  return `<div class="hero-offer-float">
    <a class="offer-card" href="${packHref(BUNDLE.id)}">
      <div class="offer-shots">
        <div class="offer-shot offer-shot-back">${renderScreenshot(backDemo)}</div>
        <div class="offer-shot offer-shot-front">${renderScreenshot(frontDemo)}</div>
      </div>
      <span class="badge">${savings}</span>
      <p class="offer-title">${t[BUNDLE.id].name}</p>
      <p class="offer-prices">
        ${renderOldPrice(BUNDLE.oldPriceBs)}
        <span class="price-main">${renderCountedBs(BUNDLE.priceBs)}</span>
      </p>
      <p class="price-meta">${renderUsdAndDays(BUNDLE)}</p>
    </a>
  </div>`
}

function techMarqueeMarkup() {
  const items = dict()
    .techList.map((name) => `<li class="marquee-item">${name}</li>`)
    .join("")
  return `<div class="marquee-track">
    <ul class="marquee-group">${items}</ul>
    <ul class="marquee-group" aria-hidden="true">${items}</ul>
  </div>`
}

function packCardMarkup(pack) {
  const t = dict()
  const text = t[pack.id]
  return renderMediaCard({
    href: packHref(pack.id),
    demo: pack.demos[0],
    title: text.name,
    isFeatured: pack.featured,
    linkLabel: t.seePack,
    content: `<p class="price-main">${renderCountedBs(pack.priceBs, pack.priceMaxBs)}</p>
      <p class="price-meta">${renderUsdAndDays(pack)}</p>
      <p class="card-text">${withPrices(text.blurb)}</p>`,
  })
}

function packGroupMarkup(category) {
  const [title, lead] = dict().categories[category]
  return `<div class="pack-group" id="packs-${category}">
    <div class="pack-group-head reveal">
      <h3 class="pack-group-title">${title}</h3>
      <p class="section-lead">${lead}</p>
    </div>
    <div class="card-grid">${packsInCategory(category).map(packCardMarkup).join("")}</div>
  </div>`
}

function externalLinkMarkup(href, label) {
  return `<a class="project-link" href="${href}" target="_blank" rel="noopener">${renderLinkLabel(label)}</a>`
}

function projectLinksMarkup(project) {
  const t = dict()
  const links = []
  if (project.demo) links.push(`<a class="project-link" href="${project.demo}">${renderLinkLabel(t.liveExample)}</a>`)
  if (project.live) links.push(externalLinkMarkup(project.live, t.projectLive))
  if (project.code) links.push(externalLinkMarkup(project.code, t.projectCode))
  return links.join("")
}

function projectCardMarkup(project) {
  const tags = project.tags.map((tag) => `<li class="tag">${tag}</li>`).join("")
  return `<article class="project-card reveal">
    <p class="eyebrow">${project.role}</p>
    <h3 class="card-title">${project.title}</h3>
    <p class="card-text">${project.text}</p>
    <ul class="tag-list">${tags}</ul>
    <div class="project-links">${projectLinksMarkup(project)}</div>
  </article>`
}

function aboutMarkup() {
  const t = dict()
  const paragraphs = t.aboutParagraphs.map((paragraph) => `<p>${paragraph}</p>`).join("")
  return `<div class="about reveal">
    <img class="about-photo" src="${ABOUT_PHOTO.src}" alt="${t.aboutPhotoAlt}" width="${ABOUT_PHOTO.size}" height="${ABOUT_PHOTO.size}" loading="lazy" decoding="async" />
    <div class="about-copy">
      <h2 class="section-title">${t.aboutTitle}</h2>
      ${paragraphs}
      <div class="button-row">
        <a class="btn btn-secondary" href="${CONTACT.github}" target="_blank" rel="noopener">GitHub</a>
        <a class="btn btn-secondary" href="${CONTACT.linkedin}" target="_blank" rel="noopener">LinkedIn</a>
      </div>
    </div>
  </div>`
}

function extrasCardMarkup(pack) {
  const t = dict()
  return `<article class="extras-card reveal">
    <h3 class="extras-card-title">${t[pack.id].name}</h3>
    ${renderExtrasTable({ extras: pack.extras.slice(0, EXTRAS_PREVIEW_ROW_COUNT), showTips: false })}
    <a class="extras-card-link" href="${packHref(pack.id)}">${renderLinkLabel(t.seeAllExtras)}</a>
  </article>`
}

function stepMarkup([title, description], index) {
  const number = String(index + 1).padStart(STEP_NUMBER_DIGITS, "0")
  return `<li class="step reveal">
    <span class="step-number" aria-hidden="true">${number}</span>
    <h3 class="step-title">${title}</h3>
    <p class="step-text">${description}</p>
  </li>`
}

function compareHeaderCell(column) {
  const t = dict()
  const numericClass = column.isNumeric ? ` class="is-numeric"` : ""
  const label = column.isLabelHidden ? `<span class="visually-hidden">${t[column.labelKey]}</span>` : t[column.labelKey]
  return `<th scope="col"${numericClass}>${label}</th>`
}

function compareBodyCell(column, pack) {
  const content = column.cell(pack, dict())
  if (column.isRowHeader) return `<th scope="row">${content}</th>`
  const numericClass = column.isNumeric ? ` class="is-numeric"` : ""
  return `<td${numericClass}>${content}</td>`
}

function compareRowMarkup(pack) {
  const featuredClass = pack.featured ? ` class="is-featured"` : ""
  return `<tr${featuredClass}>${COMPARE_COLUMNS.map((column) => compareBodyCell(column, pack)).join("")}</tr>`
}

function compareTableMarkup() {
  return `<table class="data-table compare-table">
    <caption class="visually-hidden">${dict().compareCaption}</caption>
    <thead><tr>${COMPARE_COLUMNS.map(compareHeaderCell).join("")}</tr></thead>
    <tbody>${PACKS.map(compareRowMarkup).join("")}</tbody>
  </table>`
}

function faqItemMarkup([question, answer]) {
  return `<details class="faq-item reveal">
    <summary>${question}</summary>
    <div class="faq-answer"><p>${answer}</p></div>
  </details>`
}

export function renderHome() {
  renderInto(CONTAINER_IDS.heroOffer, heroOfferMarkup)
  renderInto(CONTAINER_IDS.techMarquee, techMarqueeMarkup)
  renderInto(CONTAINER_IDS.packGroups, () => PACK_CATEGORIES.map(packGroupMarkup).join(""))
  renderInto(CONTAINER_IDS.projectGrid, () => dict().projects.map(projectCardMarkup).join(""))
  renderInto(CONTAINER_IDS.aboutBox, aboutMarkup)
  renderInto(CONTAINER_IDS.extrasGrid, () =>
    PACKS.slice(0, EXTRAS_PREVIEW_PACK_COUNT).map(extrasCardMarkup).join("")
  )
  renderInto(CONTAINER_IDS.processSteps, () => dict().processSteps.map(stepMarkup).join(""))
  renderInto(CONTAINER_IDS.compareTable, compareTableMarkup)
  renderInto(CONTAINER_IDS.faqList, () => dict().faqItems.map(faqItemMarkup).join(""))
}
