import { startExtrasPanel } from "./extras-panel.js"

const ANIMATED_CLASS = "is-animated"
const MAX_EVENTS_SHOWN = 4
const MAP_URL = "https://www.google.com/maps?q=Equipetrol%2C+Santa+Cruz+de+la+Sierra&z=15&output=embed"
const OPENING = { firstDay: 2, openHour: 8, closeHour: 20 }
const SUNDAY = 0

// El precio de cada extra sale del catálogo; aquí solo va cómo se explica y qué parte de la página toca.
const EXTRA_UI = {
  extraSectionFromSecond: { name: "Sección extra", hint: "Una segunda pantalla: la carta, tus servicios o tu historia.", target: ".menu" },
  copywriting: { name: "Texto profesional", hint: "Titular y mensaje escritos para vender, no solo para informar.", target: ".hero-body" },
  analyticsPixel: { name: "Pixel de Meta o Google Analytics", hint: "Sabes cuánta gente entra y cuántos tocan el botón." },
  entranceAnimation: { name: "Animación de entrada", hint: "El contenido aparece con suavidad al cargar.", target: ".hero-body" },
  faviconOpenGraph: { name: "Ícono y vista previa en WhatsApp", hint: "Tu enlace se comparte con foto y título, no como texto suelto." },
  googleMap: { name: "Mapa de Google", hint: "El mapa embebido con tu ubicación exacta.", target: ".map" },
  callButton: { name: "Botón de llamada", hint: "Un toque y el cliente te llama desde el celular.", target: "#call" },
  openingHours: { name: "Horario en pantalla", hint: "Muestra si estás abierto ahora y hasta qué hora.", target: ".hours" },
}

const events = []

function clockLabel() {
  return new Date().toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
}

function isOpenNow(now) {
  const day = now.getDay()
  const isOpenDay = day === SUNDAY || day >= OPENING.firstDay
  return isOpenDay && now.getHours() >= OPENING.openHour && now.getHours() < OPENING.closeHour
}

function renderHours() {
  const open = isOpenNow(new Date())
  document.getElementById("hours-dot").classList.toggle("is-closed", !open)
  // En pantallas angostas solo se ve el estado; el detalle aparece desde tablet.
  document.getElementById("hours-text").textContent = open ? `Abierto · hasta las ${OPENING.closeHour}:00` : "Cerrado ahora"
  document.getElementById("hours-detail").textContent = open
    ? ""
    : ` · mar a dom, ${OPENING.openHour}:00 a ${OPENING.closeHour}:00`
}

function renderCopy({ page, isActive }) {
  const variant = isActive("copywriting") ? "pro" : "basic"
  page.querySelectorAll("[data-copy]").forEach((element) => {
    element.textContent = element.dataset[variant]
  })
}

function renderMap({ isActive }) {
  const frame = document.getElementById("map-frame")
  if (isActive("googleMap") && !frame.src) frame.src = MAP_URL
}

function replayEntrance({ page, stage, isActive }) {
  page.classList.remove(ANIMATED_CLASS)
  if (!isActive("entranceAnimation")) return
  stage.scrollTo({ top: 0, behavior: "instant" })
  // Leer offsetWidth obliga al navegador a reiniciar la animación al volver a poner la clase.
  void page.offsetWidth
  page.classList.add(ANIMATED_CLASS)
}

function openGraphProofMarkup() {
  return `<div class="proof">
    <p class="proof-title">Así llega tu enlace por WhatsApp:</p>
    <div class="wa-bubble">
      <div class="wa-preview">
        <img src="img/cafe-barrio-sm.webp" alt="" />
        <div><strong>Café Barrio · Equipetrol</strong><span>Café de especialidad y pan del día. Reserva tu mesa.</span></div>
      </div>
      <p class="wa-link">cafebarrio.bo</p>
    </div>
  </div>`
}

function pixelProofMarkup() {
  const rows = events
    .slice(0, MAX_EVENTS_SHOWN)
    .map((event) => `<li><span>${event.name}</span><time>${event.time}</time></li>`)
    .join("")
  return `<div class="proof">
    <p class="proof-title">Eventos medidos. Toca el botón de la landing:</p>
    <ul class="events">${rows}</ul>
  </div>`
}

function startPixelLog() {
  events.length = 0
  events.unshift({ name: "PageView", time: clockLabel() })
}

function handleToggle(extraId, isOn, api) {
  if (extraId === null) {
    events.length = 0
    replayEntrance(api)
    return true
  }
  if (extraId === "analyticsPixel") {
    if (isOn) startPixelLog()
    api.renderProofs()
  }
  if (extraId === "entranceAnimation") {
    replayEntrance(api)
    return true
  }
  return false
}

const panel = startExtrasPanel({
  packId: "pack1",
  packName: "la landing de 1 sección",
  title: "Arma tu landing",
  included: [
    "Una pantalla con mensaje, foto y botón",
    "Diseño para celular y computadora",
    "Datos de contacto y redes",
    "Publicación y 1 ronda de cambios",
  ],
  extraUi: EXTRA_UI,
  proofs: { faviconOpenGraph: openGraphProofMarkup, analyticsPixel: pixelProofMarkup },
  onRender: (api) => {
    renderCopy(api)
    renderHours()
    renderMap(api)
  },
  onToggle: handleToggle,
})

function trackEvent(name) {
  if (!panel.isActive("analyticsPixel")) return
  events.unshift({ name, time: clockLabel() })
  panel.renderProofs()
}

document.getElementById("cta").addEventListener("click", () => {
  trackEvent("Contact · Reservar mesa")
  panel.showToast("En tu sitio, este botón abre WhatsApp con el mensaje ya escrito.")
})
document.getElementById("call").addEventListener("click", () => {
  trackEvent("Contact · Llamar")
  panel.showToast("En tu sitio, este botón marca tu número desde el celular.")
})
panel.page.querySelectorAll("[data-fake]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault()
    panel.showToast("En tu sitio, este enlace abre tu perfil.")
  })
})

// Si la demo se abrió con el pixel ya activo desde la URL, el registro arranca con la visita.
if (panel.isActive("analyticsPixel")) {
  startPixelLog()
  panel.renderProofs()
}
