import { CONTACT } from "../config.js"
import { mailHref, waHref } from "../core/contact.js"
import { formatBs, formatDays, formatPricePair, formatUsd, toUsd } from "../core/format.js"
import { getLang, SUPPORTED_LANGS } from "../core/preferences.js"
import { readQuotePackParam } from "../core/routes.js"
import { dict, fillTemplate } from "../core/text.js"
import { QUOTE_EXTRAS, QUOTE_PACK_IDS, findPack } from "../data/catalog.js"
import { renderOldPrice } from "./components.js"

const FORM_ID = "quote-form"
const SCOPES = { local: "local", remote: "remote" }
const QUOTE_ACTIONS = { mail: "mail", whatsapp: "wa", print: "print" }
const LISTENING_FLAG = "listening"

let quoteDraft = null

function readField(data, name) {
  return String(data.get(name) ?? "")
}

export function captureQuoteDraft() {
  const form = document.getElementById(FORM_ID)
  if (!form || form.childElementCount === 0) return
  const data = new FormData(form)
  quoteDraft = {
    name: readField(data, "name"),
    industry: readField(data, "industry"),
    scope: readField(data, "scope"),
    projectLang: readField(data, "projectLang"),
    pack: readField(data, "pack"),
    extras: data.getAll("extra").map(String),
    timeline: readField(data, "timeline"),
  }
}

function checkOption(form, { name, value }) {
  if (!value) return
  const input = form.querySelector(`[name="${name}"][value="${CSS.escape(value)}"]`)
  if (input) input.checked = true
}

function restoreQuoteDraft(form, draft) {
  form.elements.name.value = draft.name
  form.elements.industry.value = draft.industry
  form.elements.projectLang.value = draft.projectLang || getLang()
  form.elements.timeline.value = draft.timeline
  checkOption(form, { name: "scope", value: draft.scope })
  checkOption(form, { name: "pack", value: draft.pack })
  draft.extras.forEach((extraId) => checkOption(form, { name: "extra", value: extraId }))
}

function selectedPack(form) {
  const packId = form.querySelector("[name=pack]:checked")?.value
  return packId ? findPack(packId) : undefined
}

function selectedExtras(form) {
  return [...form.querySelectorAll("[name=extra]:checked")]
    .map((input) => QUOTE_EXTRAS.find((extra) => extra.id === input.value))
    .filter(Boolean)
}

function preselectPackFromUrl(form) {
  checkOption(form, { name: "pack", value: readQuotePackParam() })
  fillQuoteTimeline(form)
}

function fillQuoteTimeline(form) {
  const pack = selectedPack(form)
  if (pack) form.elements.timeline.value = formatDays(pack.days, dict().daysUnit)
}

function buildQuote(form) {
  const pack = selectedPack(form)
  const extras = selectedExtras(form)
  const pricedItems = pack ? [pack, ...extras] : extras
  return {
    name: form.elements.name.value.trim(),
    industry: form.elements.industry.value.trim(),
    scope: form.querySelector("[name=scope]:checked")?.value ?? "",
    projectLang: form.elements.projectLang.value,
    timeline: form.elements.timeline.value.trim(),
    pack,
    extras,
    totalBs: pricedItems.reduce((sum, item) => sum + item.priceBs, 0),
    totalUsd: pricedItems.reduce((sum, item) => sum + toUsd(item.priceBs), 0),
  }
}

function formatQuoteTotal(quote) {
  return `${formatBs(quote.totalBs)} (${formatUsd(quote.totalUsd)})`
}

function quoteExtrasText(extras) {
  const t = dict()
  if (extras.length === 0) return t.quoteNoExtras
  return extras.map((extra) => `- ${t.quoteExtraNames[extra.id]}: ${formatPricePair(extra.priceBs)}`).join("\n")
}

function quoteMessage(quote) {
  const t = dict()
  const scopeLabel = quote.scope === SCOPES.remote ? t.quoteRemote : t.quoteLocal
  return [
    fillTemplate(t.quoteHeading, { owner: CONTACT.ownerName }),
    `${t.quoteName}: ${quote.name}`,
    `${t.quoteIndustry}: ${quote.industry}`,
    `${t.quoteScope}: ${scopeLabel}`,
    `${t.quoteLang}: ${quote.projectLang.toUpperCase()}`,
    `${t.quotePack}: ${t[quote.pack.id].name} — ${formatPricePair(quote.pack.priceBs)}`,
    `${t.quoteExtras}:`,
    quoteExtrasText(quote.extras),
    `${t.quoteTotal}: ${formatQuoteTotal(quote)}`,
    `${t.quoteTimeline}: ${quote.timeline || formatDays(quote.pack.days, t.daysUnit)}`,
  ].join("\n")
}

function updateQuoteTotal(form) {
  const total = form.querySelector("[data-quote-total]")
  if (total) total.textContent = formatQuoteTotal(buildQuote(form))
}

function sendQuote(channel, form) {
  const quote = buildQuote(form)
  const error = form.querySelector("[data-quote-error]")
  const isMissingData = !quote.name || !quote.industry || !quote.scope || !quote.pack
  error.hidden = !isMissingData
  if (isMissingData) return
  const body = quoteMessage(quote)
  window.location.href = channel === QUOTE_ACTIONS.whatsapp ? waHref(body) : mailHref(body)
}

function handleQuoteAction(event, form) {
  const action = event.target.closest("[data-quote-action]")?.dataset.quoteAction
  if (!action) return
  if (action === QUOTE_ACTIONS.print) {
    window.print()
    return
  }
  sendQuote(action, form)
}

function bindQuoteForm(form) {
  if (form.dataset[LISTENING_FLAG]) return
  form.dataset[LISTENING_FLAG] = "true"
  form.addEventListener("change", (event) => {
    if (event.target.name === "pack") fillQuoteTimeline(form)
    updateQuoteTotal(form)
  })
  form.addEventListener("click", (event) => handleQuoteAction(event, form))
}

function optionMarkup({ type, name, value, title, meta }) {
  const required = type === "radio" ? " required" : ""
  return `<label class="quote-option">
    <input type="${type}" name="${name}" value="${value}"${required} />
    <span class="quote-option-text">
      <span class="quote-option-title">${title}</span>
      <span class="quote-option-meta">${meta}</span>
    </span>
  </label>`
}

function packOptionMarkup(packId) {
  const t = dict()
  const pack = findPack(packId)
  const oldPrice = pack.oldPriceBs ? `${renderOldPrice(pack.oldPriceBs)} ` : ""
  return optionMarkup({
    type: "radio",
    name: "pack",
    value: packId,
    title: t[packId].name,
    meta: `${oldPrice}${formatPricePair(pack.priceBs)} · ${formatDays(pack.days, t.daysUnit)}`,
  })
}

function extraOptionMarkup(extra) {
  return optionMarkup({
    type: "checkbox",
    name: "extra",
    value: extra.id,
    title: dict().quoteExtraNames[extra.id],
    meta: formatPricePair(extra.priceBs),
  })
}

function scopeOptionMarkup(scope, label) {
  return `<label class="quote-option"><input type="radio" name="scope" value="${scope}" required /> ${label}</label>`
}

function quoteFormMarkup() {
  const t = dict()
  const langOptions = SUPPORTED_LANGS.map((lang) => `<option value="${lang}">${lang.toUpperCase()}</option>`).join("")
  return `
    <fieldset>
      <legend>${t.quoteClient}</legend>
      <div class="quote-grid">
        <label>${t.quoteName}<input name="name" type="text" required autocomplete="name" /></label>
        <label>${t.quoteIndustry}<input name="industry" type="text" required /></label>
      </div>
      <p class="quote-legend">${t.quoteScope}</p>
      <div class="quote-options">
        ${scopeOptionMarkup(SCOPES.local, t.quoteLocal)}
        ${scopeOptionMarkup(SCOPES.remote, t.quoteRemote)}
      </div>
      <label>${t.quoteLang}<select name="projectLang">${langOptions}</select></label>
    </fieldset>
    <fieldset>
      <legend>${t.quotePack}</legend>
      <div class="quote-options">${QUOTE_PACK_IDS.map(packOptionMarkup).join("")}</div>
    </fieldset>
    <fieldset>
      <legend>${t.quoteExtras}</legend>
      <div class="quote-options">${QUOTE_EXTRAS.map(extraOptionMarkup).join("")}</div>
    </fieldset>
    <label>${t.quoteTimeline}<input name="timeline" type="text" /></label>
    <p class="quote-total">${t.quoteTotal}: <strong data-quote-total></strong></p>
    <p class="quote-error" data-quote-error hidden>${t.quoteNeedFields}</p>
    <div class="quote-actions no-print">
      <button class="btn btn-primary" type="button" data-quote-action="${QUOTE_ACTIONS.mail}">${t.quoteSendMail}</button>
      <button class="btn btn-secondary" type="button" data-quote-action="${QUOTE_ACTIONS.whatsapp}">${t.quoteSendWa}</button>
      <button class="btn btn-secondary" type="button" data-quote-action="${QUOTE_ACTIONS.print}">${t.printBtn}</button>
    </div>
  `
}

export function renderQuotePage() {
  const form = document.getElementById(FORM_ID)
  if (!form) return
  form.innerHTML = quoteFormMarkup()
  form.elements.projectLang.value = getLang()
  if (quoteDraft) restoreQuoteDraft(form, quoteDraft)
  else preselectPackFromUrl(form)
  updateQuoteTotal(form)
  bindQuoteForm(form)
}
