import { CONTACT } from "../assets/js/config.js"
import { formatBs, formatPricePair } from "../assets/js/core/format.js"
import { findPack } from "../assets/js/data/catalog.js"

// Panel de extras compartido por las demos. Envuelve el #page de la demo en una vista
// previa (con marco de celular opcional) y arma el panel con los extras del pack.
// Los precios salen del catálogo; cada demo solo define cómo se explica cada extra
// y qué cambia en su página.

const PAGE_ID = "page"
const WIDE_PANEL_QUERY = "(min-width: 860px)"
const PARAMS = { panel: "panel", extras: "extras", device: "device" }
const PANEL_CLOSED_VALUE = "0"
const DEVICES = { desktop: "desktop", phone: "phone" }
const TOAST_DURATION_MS = 3200
const FLASH_CLASS = "flash"
const PHONE_CLASS = "is-phone"
const TOAST_VISIBLE_CLASS = "is-visible"

const CLOSE_ICON =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>'

function chromeMarkup({ title, included }) {
  const includedItems = included.map((item) => `<li>${item}</li>`).join("")
  return `<div class="workspace">
    <div class="viewport" data-part="viewport">
      <div class="stage" data-part="stage" tabindex="0" aria-label="Vista previa del sitio"></div>
      <p class="toast" data-part="toast" role="status" aria-live="polite"></p>
    </div>
    <aside class="panel" id="extras-panel" data-part="panel" aria-label="Extras del pack" hidden>
      <header class="panel-head">
        <div>
          <h2>${title}</h2>
          <p>Activa un extra y míralo en la página.</p>
        </div>
        <button class="icon-button" data-part="close" type="button" aria-label="Cerrar panel">${CLOSE_ICON}</button>
      </header>
      <div class="device" data-part="device" role="group" aria-label="Tamaño de pantalla">
        <button type="button" data-device="${DEVICES.desktop}" aria-pressed="true">Computadora</button>
        <button type="button" data-device="${DEVICES.phone}" aria-pressed="false">Celular</button>
      </div>
      <div class="panel-scroll">
        <section class="base">
          <h3>Incluido en el pack <span data-part="base-price"></span></h3>
          <ul>${includedItems}</ul>
        </section>
        <h3 class="extras-title">Extras</h3>
        <ul class="extras" data-part="extras"></ul>
      </div>
      <footer class="panel-foot">
        <p class="total"><span data-part="total-label"></span><strong data-part="total-price"></strong></p>
        <a class="order" data-part="order" target="_blank" rel="noopener">Pedir este sitio por WhatsApp</a>
        <button class="reset" data-part="reset" type="button" hidden>Quitar todos los extras</button>
      </footer>
    </aside>
  </div>
  <button class="fab" data-part="fab" type="button" aria-controls="extras-panel" aria-expanded="false">
    <span>Ver extras</span><strong data-part="fab-price"></strong>
  </button>`
}

function extraRowMarkup(extra, ui) {
  return `<li class="extra">
    <label>
      <span class="extra-name">${ui.name}</span>
      <span class="extra-hint">${ui.hint}</span>
      <span class="extra-price">+ ${formatPricePair(extra.priceBs)}</span>
      <span class="switch"><input type="checkbox" role="switch" value="${extra.id}" /><i></i></span>
    </label>
    <div data-proof="${extra.id}"></div>
  </li>`
}

/**
 * @param {object} options
 * @param {string} options.packId        id del pack en el catálogo
 * @param {string} options.packName      nombre que va en el mensaje de WhatsApp
 * @param {string} options.title         título del panel
 * @param {string[]} options.included    lo que ya trae el pack
 * @param {Record<string, {name: string, hint: string, target?: string}>} options.extraUi
 * @param {Record<string, () => string>} [options.proofs]  HTML que se muestra en el panel al activar el extra
 * @param {(api: object) => void} [options.onRender]       se llama después de cada cambio de estado
 * @param {(extraId: string|null, isOn: boolean, api: object) => boolean|void} [options.onToggle]
 *        se llama al activar o quitar un extra (extraId null = se quitaron todos);
 *        devolver true evita el resaltado automático
 */
export function startExtrasPanel({ packId, packName, title, included, extraUi, proofs = {}, onRender = () => {}, onToggle = () => {} }) {
  const pack = findPack(packId)
  const active = new Set()
  const page = document.getElementById(PAGE_ID)

  page.insertAdjacentHTML("beforebegin", chromeMarkup({ title, included }))
  const part = (name) => document.querySelector(`[data-part="${name}"]`)
  const stage = part("stage")
  const viewport = part("viewport")
  const panel = part("panel")
  const fab = part("fab")
  const toast = part("toast")
  const extrasList = part("extras")
  stage.appendChild(page)
  let toastTimer

  const isActive = (extraId) => active.has(extraId)
  const activeExtras = () => pack.extras.filter((extra) => isActive(extra.id))
  const totalBs = () => activeExtras().reduce((sum, extra) => sum + extra.priceBs, pack.priceBs)

  function showToast(message) {
    toast.textContent = message
    toast.classList.add(TOAST_VISIBLE_CLASS)
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => toast.classList.remove(TOAST_VISIBLE_CLASS), TOAST_DURATION_MS)
  }

  function highlight(selector) {
    const target = selector && page.querySelector(selector)
    if (!target) return
    target.scrollIntoView({ block: "nearest", behavior: "smooth" })
    target.classList.remove(FLASH_CLASS)
    // Leer offsetWidth obliga al navegador a reiniciar la animación al volver a poner la clase.
    void target.offsetWidth
    target.classList.add(FLASH_CLASS)
  }

  function renderProofs() {
    Object.entries(proofs).forEach(([extraId, buildMarkup]) => {
      extrasList.querySelector(`[data-proof="${extraId}"]`).innerHTML = isActive(extraId) ? buildMarkup() : ""
    })
  }

  function orderMessage() {
    const lines = [`Hola ${CONTACT.ownerName}, quiero ${packName} (${formatBs(pack.priceBs)}).`]
    const extras = activeExtras()
    if (extras.length > 0) {
      lines.push("Con estos extras:")
      extras.forEach((extra) => lines.push(`- ${extraUi[extra.id].name}: ${formatBs(extra.priceBs)}`))
    }
    lines.push(`Total: ${formatPricePair(totalBs())}`)
    return lines.join("\n")
  }

  function renderTotals() {
    const count = active.size
    const countLabel = count === 1 ? "Con 1 extra" : `Con ${count} extras`
    part("total-label").textContent = count === 0 ? "Sin extras" : countLabel
    part("total-price").textContent = formatPricePair(totalBs())
    part("fab-price").textContent = formatBs(totalBs())
    part("reset").hidden = count === 0
    part("order").href = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(orderMessage())}`
  }

  const api = { pack, page, stage, isActive, showToast, highlight, renderProofs }

  function render() {
    // data-extra: visible solo con el extra activo. data-without: visible solo sin él.
    page.querySelectorAll("[data-extra]").forEach((element) => {
      element.hidden = !isActive(element.dataset.extra)
    })
    page.querySelectorAll("[data-without]").forEach((element) => {
      element.hidden = isActive(element.dataset.without)
    })
    extrasList.querySelectorAll("input").forEach((input) => {
      input.checked = isActive(input.value)
    })
    onRender(api)
    renderProofs()
    renderTotals()
  }

  function setExtra(extraId, isOn) {
    if (isOn) active.add(extraId)
    else active.delete(extraId)
    render()
    const wasHandled = onToggle(extraId, isOn, api)
    if (isOn && !wasHandled) highlight(extraUi[extraId].target)
  }

  function setDevice(device) {
    viewport.classList.toggle(PHONE_CLASS, device === DEVICES.phone)
    panel.querySelectorAll("[data-device]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.device === device))
    })
  }

  function setPanelOpen(isOpen) {
    panel.hidden = !isOpen
    fab.setAttribute("aria-expanded", String(isOpen))
    if (!isOpen) setDevice(DEVICES.desktop)
  }

  extrasList.innerHTML = pack.extras.map((extra) => extraRowMarkup(extra, extraUi[extra.id])).join("")
  extrasList.addEventListener("change", (event) => setExtra(event.target.value, event.target.checked))
  fab.addEventListener("click", () => setPanelOpen(true))
  part("close").addEventListener("click", () => setPanelOpen(false))
  part("device").addEventListener("click", (event) => {
    if (event.target.dataset.device) setDevice(event.target.dataset.device)
  })
  part("reset").addEventListener("click", () => {
    active.clear()
    render()
    onToggle(null, false, api)
  })
  // El marco de celular solo tiene sentido con el panel al costado.
  window.matchMedia(WIDE_PANEL_QUERY).addEventListener("change", (query) => {
    if (!query.matches) setDevice(DEVICES.desktop)
  })

  // ?extras=id,id&device=phone&panel=0 abre la demo ya configurada (sirve para compartir un enlace).
  const params = new URLSearchParams(window.location.search)
  const startsOpen = window.matchMedia(WIDE_PANEL_QUERY).matches && params.get(PARAMS.panel) !== PANEL_CLOSED_VALUE
  const requested = (params.get(PARAMS.extras) ?? "").split(",")
  pack.extras.filter((extra) => requested.includes(extra.id)).forEach((extra) => active.add(extra.id))
  part("base-price").textContent = `· ${formatBs(pack.priceBs)}`
  document.querySelectorAll("[data-pack-price]").forEach((element) => {
    element.textContent = formatPricePair(pack.priceBs)
  })
  setPanelOpen(startsOpen)
  if (startsOpen && params.get(PARAMS.device) === DEVICES.phone) setDevice(DEVICES.phone)
  render()
  return api
}
