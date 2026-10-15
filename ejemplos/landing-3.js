import { startExtrasPanel } from "./extras-panel.js"

const VIDEO_SRC = "img/lucia-hero.mp4"
const VIDEO_CLASS = "has-video"
const LANGS = { es: "es", en: "en" }
const BOOKING_DAY_COUNT = 5
const BOOKING_SLOTS = ["09:00", "10:30", "15:00", "16:30"]
const SATURDAY = 6
const SUNDAY = 0
const DAY_MS = 24 * 60 * 60 * 1000

// El precio de cada extra sale del catálogo; aquí solo va cómo se explica y qué parte de la página toca.
const EXTRA_UI = {
  extraSection: { name: "Sección extra", hint: "Una cuarta sección, por ejemplo cómo trabajas o tu historia.", target: "#metodo" },
  formToEmail: { name: "Formulario que llega al email", hint: "El cliente deja sus datos y te llegan al correo.", target: "#contact-form" },
  secondLanguagePair: { name: "Segundo idioma (ES ↔ EN)", hint: "Todo el sitio traducido, con un selector de idioma.", target: ".lang" },
  photoGallery: { name: "Galería de fotos", hint: "Hasta 12 fotos de tu trabajo, tu local o tus productos.", target: "#galeria" },
  seoExtra: { name: "SEO extra", hint: "Título y descripción pensados para que te encuentren en Google." },
  testimonials: { name: "Testimonios", hint: "Hasta 4 opiniones de clientes para dar confianza.", target: "#testimonios" },
  bookingCalendar: { name: "Calendario de citas", hint: "El cliente elige día y hora sin escribirte.", target: "#booking" },
  heroVideo: { name: "Video de fondo", hint: "El inicio pasa a pantalla completa con un video en movimiento.", target: ".hero" },
}

const TEXT = {
  es: {
    whatsappToast: "En tu sitio, este botón abre WhatsApp con el mensaje ya escrito.",
    linkToast: "En tu sitio, este enlace abre tu perfil.",
    formSent: "Mensaje enviado. Mira en el panel cómo te llega al correo.",
    booked: (day, slot) => `Reserva tomada: ${day}, ${slot}. En tu sitio se guarda en tu calendario.`,
    locale: "es-BO",
  },
  en: {
    whatsappToast: "On your site, this button opens WhatsApp with the message already written.",
    linkToast: "On your site, this link opens your profile.",
    formSent: "Message sent. See in the panel how it arrives in your inbox.",
    booked: (day, slot) => `Booked: ${day}, ${slot}. On your site it goes into your calendar.`,
    locale: "en-US",
  },
}

let lang = LANGS.es
let lastMessage = null
const booking = { day: null, slot: null }

function text() {
  return TEXT[lang]
}

function setLanguage(nextLang, { page }) {
  lang = nextLang
  page.querySelectorAll("[data-en]").forEach((element) => {
    // El español original se guarda la primera vez para poder volver.
    element.dataset.es ??= element.textContent
    element.textContent = lang === LANGS.en ? element.dataset.en : element.dataset.es
  })
  page.querySelectorAll("[data-lang]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.lang === lang))
  })
  renderBookingDays()
}

function renderVideo({ page, isActive }) {
  const hero = page.querySelector(".hero")
  const video = document.getElementById("hero-video")
  const isOn = isActive("heroVideo")
  hero.classList.toggle(VIDEO_CLASS, isOn)
  if (!isOn) {
    video.pause()
    return
  }
  if (!video.src) video.src = VIDEO_SRC
  // Algunos navegadores bloquean la reproducción automática; en ese caso queda la imagen de portada.
  video.play().catch(() => {})
}

function nextWeekdays(count) {
  const days = []
  let cursor = Date.now() + DAY_MS
  while (days.length < count) {
    const date = new Date(cursor)
    if (date.getDay() !== SATURDAY && date.getDay() !== SUNDAY) days.push(date)
    cursor += DAY_MS
  }
  return days
}

function dayLabel(date) {
  return date.toLocaleDateString(text().locale, { weekday: "long", day: "numeric", month: "long" })
}

function renderBookingDays() {
  const dayButtons = nextWeekdays(BOOKING_DAY_COUNT)
    .map((date) => {
      const key = date.toDateString()
      const weekday = date.toLocaleDateString(text().locale, { weekday: "short" })
      return `<button type="button" data-day="${key}" aria-pressed="${booking.day === key}"><small>${weekday}</small>${date.getDate()}</button>`
    })
    .join("")
  const slotButtons = BOOKING_SLOTS.map(
    (slot) => `<button type="button" data-slot="${slot}" aria-pressed="${booking.slot === slot}">${slot}</button>`
  ).join("")
  document.getElementById("booking-days").innerHTML = dayButtons
  document.getElementById("booking-slots").innerHTML = slotButtons
  document.getElementById("booking-confirm").disabled = !booking.day || !booking.slot
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`)
}

function formProofMarkup() {
  const body = lastMessage
    ? `Nombre: ${escapeHtml(lastMessage.name)}\nWhatsApp: ${escapeHtml(lastMessage.phone)}\n\n${escapeHtml(lastMessage.message || "(sin mensaje)")}`
    : "Completa el formulario de la página y envíalo: aquí verás el correo que te llega."
  return `<div class="proof">
    <p class="proof-title">Así te llega al correo:</p>
    <div class="mail">
      <div class="mail-head"><strong>Nuevo contacto desde tu web</strong>para: lucia@luciamendes.bo</div>
      <pre class="mail-body">${body}</pre>
    </div>
  </div>`
}

function seoProofMarkup() {
  return `<div class="proof">
    <p class="proof-title">Sin SEO extra, así sales en Google:</p>
    <div class="serp is-weak">
      <div class="serp-url">luciamendes.bo</div>
      <div class="serp-title">Lucía Mendes</div>
      <div class="serp-text">Inicio Servicios Contacto Consulta inicial Plan 4 semanas…</div>
    </div>
    <p class="proof-title">Con SEO extra:</p>
    <div class="serp">
      <div class="serp-url">luciamendes.bo</div>
      <div class="serp-title">Nutricionista en Santa Cruz · Lucía Mendes</div>
      <div class="serp-text">Planes de alimentación que se pueden seguir con trabajo de oficina. Consulta en Equipetrol o por videollamada desde 250 Bs.</div>
    </div>
  </div>`
}

function handleToggle(extraId, isOn, api) {
  // Al quitar el segundo idioma (o todos los extras) el sitio vuelve a español.
  if (!api.isActive("secondLanguagePair") && lang !== LANGS.es) setLanguage(LANGS.es, api)
  if (extraId === null) {
    lastMessage = null
    booking.day = null
    booking.slot = null
    renderBookingDays()
    api.renderProofs()
  }
  if (extraId === "heroVideo" && isOn) api.stage.scrollTo({ top: 0 })
  return false
}

const panel = startExtrasPanel({
  packId: "pack3",
  packName: "la landing de 3 secciones",
  title: "Arma tu landing",
  included: [
    "3 secciones: inicio, servicios y contacto",
    "Botón de WhatsApp",
    "Diseño para celular y computadora",
    "SEO básico, publicación y 2 rondas de cambios",
  ],
  extraUi: EXTRA_UI,
  proofs: { formToEmail: formProofMarkup, seoExtra: seoProofMarkup },
  onRender: renderVideo,
  onToggle: handleToggle,
})

function bindNavigation() {
  panel.page.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-goto]")
    if (!trigger) return
    event.preventDefault()
    document.getElementById(trigger.dataset.goto)?.scrollIntoView({ behavior: "smooth", block: "start" })
  })
  panel.page.querySelectorAll("[data-lang]").forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.lang, panel))
  })
  panel.page.querySelectorAll("[data-fake]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault()
      panel.showToast(text().linkToast)
    })
  })
  document.getElementById("whatsapp").addEventListener("click", () => panel.showToast(text().whatsappToast))
}

function bindForm() {
  const form = document.getElementById("contact-form")
  form.addEventListener("submit", (event) => {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(form))
    const isValid = data.name.trim() !== "" && data.phone.trim() !== ""
    document.getElementById("form-error").hidden = isValid
    if (!isValid) return
    lastMessage = { name: data.name.trim(), phone: data.phone.trim(), message: data.message.trim() }
    form.reset()
    panel.renderProofs()
    panel.showToast(text().formSent)
  })
}

function bindBooking() {
  document.getElementById("booking").addEventListener("click", (event) => {
    const button = event.target.closest("button")
    if (!button) return
    if (button.dataset.day) booking.day = button.dataset.day
    if (button.dataset.slot) booking.slot = button.dataset.slot
    if (button.id === "booking-confirm") {
      panel.showToast(text().booked(dayLabel(new Date(booking.day)), booking.slot))
      booking.day = null
      booking.slot = null
    }
    renderBookingDays()
  })
}

bindNavigation()
bindForm()
bindBooking()
renderBookingDays()
