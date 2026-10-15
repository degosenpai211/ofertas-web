import { startExtrasPanel } from "../extras-panel.js"

// Bibliotecas cargadas por CDN en index.html: GSAP + ScrollTrigger (entrada, contadores y
// parallax), Lenis (scroll suave) y Swiper (carrusel). Si alguna no carga, la página
// funciona igual sin ese efecto.
const { gsap, ScrollTrigger, Lenis, Swiper } = window

const LANGS = { es: "es", en: "en" }
const THEMES = { light: "light", dark: "dark" }
const NAV_OFFSET_PX = -64
const NAV_STUCK_AFTER_PX = 8
const REVEAL_STAGGER_MS = 80
const COUNT_DURATION_S = 1.6
const MAP_URL = "https://www.google.com/maps?q=Equipetrol%2C+Santa+Cruz+de+la+Sierra&z=15&output=embed"
const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches

// El precio de cada extra sale del catálogo; aquí solo va cómo se explica y qué parte de la página toca.
const EXTRA_UI = {
  extraPage: { name: "Página extra", hint: "Una página más, por ejemplo planes y precios.", target: "#planes" },
  staticBlog: { name: "Blog", hint: "Hasta 5 notas para que te encuentren en Google y te lean.", target: "#blog" },
  secondLanguage: { name: "Segundo idioma", hint: "Todo el sitio traducido, con selector de idioma.", target: ".lang" },
  textPanel: { name: "Panel para cambiar textos", hint: "Editas los textos tú mismo, sin llamar al programador.", target: ".editbar" },
  domainHosting: { name: "Dominio y hosting", hint: "Me encargo del trámite del dominio propio y la publicación." },
  floatingWhatsapp: { name: "WhatsApp flotante", hint: "Un botón siempre visible para escribirte.", target: ".wa-float button" },
  mapDirections: { name: "Mapa y cómo llegar", hint: "El mapa de tu oficina con el botón de ruta.", target: ".map" },
  themeToggle: { name: "Modo claro y oscuro", hint: "El visitante elige cómo ver el sitio.", target: ".theme-btn" },
  workCarousel: { name: "Carrusel de trabajos", hint: "Tus casos o trabajos en un carrusel que se desliza.", target: "#casos" },
}

const TEXT = {
  es: {
    whatsappToast: "En tu sitio, este botón abre WhatsApp con el mensaje ya escrito.",
    directionsToast: "En tu sitio, este botón abre la ruta en Google Maps.",
    formSent: "Mensaje enviado. En tu sitio llega a tu correo.",
    saved: "Textos guardados. En tu sitio quedan publicados al instante.",
    readMore: "Leer nota",
  },
  en: {
    whatsappToast: "On your site, this button opens WhatsApp with the message already written.",
    directionsToast: "On your site, this button opens the route in Google Maps.",
    formSent: "Message sent. On your site it arrives in your inbox.",
    saved: "Text saved. On your site it goes live right away.",
    readMore: "Read note",
  },
}

const POSTS = [
  {
    image: "img/blog-1.webp",
    date: { es: "3 de octubre", en: "October 3" },
    title: { es: "Qué facturas sirven para descargar IVA", en: "Which invoices count for your VAT credit" },
    excerpt: { es: "No todas valen. Tres reglas para no perder crédito fiscal.", en: "Not all of them do. Three rules to keep your tax credit." },
    body: {
      es: ["La factura tiene que estar a nombre de tu negocio y con tu NIT correcto. Un dígito mal y el crédito se pierde.", "El gasto debe estar vinculado a la actividad: el combustible del reparto sí, el supermercado de la casa no.", "Guárdalas ordenadas por mes. Cuando llega una fiscalización, lo que no se encuentra no existe."],
      en: ["The invoice must be issued to your business with the correct tax ID. One wrong digit and the credit is lost.", "The expense must relate to your activity: delivery fuel counts, the household groceries do not.", "Keep them sorted by month. In an audit, what cannot be found does not exist."],
    },
  },
  {
    image: "img/blog-2.webp",
    date: { es: "18 de septiembre", en: "September 18" },
    title: { es: "Cómo leer tu estado de resultados en 5 minutos", en: "How to read your income statement in 5 minutes" },
    excerpt: { es: "Tres números bastan para saber si el mes fue bueno.", en: "Three numbers are enough to know if the month was good." },
    body: {
      es: ["Empieza por las ventas del mes y compáralas con el mes anterior, no con tu intuición.", "Mira el margen bruto: lo que queda después del costo de lo vendido. Si baja, el problema está en precios o en compras.", "Termina en la utilidad neta. Si es positiva pero no hay plata en caja, revisa cuánto te deben tus clientes."],
      en: ["Start with the month's sales and compare them with last month, not with your gut feeling.", "Look at gross margin: what is left after the cost of what you sold. If it drops, the issue is pricing or purchasing.", "End with net profit. If it is positive but there is no cash, check how much your customers owe you."],
    },
  },
  {
    image: "img/blog-3.webp",
    date: { es: "2 de septiembre", en: "September 2" },
    title: { es: "Antes de firmar: unipersonal o SRL", en: "Before you sign: sole proprietor or LLC" },
    excerpt: { es: "La diferencia no es el trámite, es quién responde por las deudas.", en: "The difference is not the paperwork, it is who answers for the debts." },
    body: {
      es: ["En una empresa unipersonal respondes con tu patrimonio personal. Es más simple y más barata de mantener.", "En una SRL la responsabilidad se limita al capital aportado, pero necesitas al menos dos socios y más formalidad.", "Si vas a tener socios o empleados desde el inicio, la SRL suele ordenar mejor las cosas."],
      en: ["As a sole proprietor you answer with your personal assets. It is simpler and cheaper to maintain.", "In an LLC liability is limited to the capital contributed, but you need at least two partners and more formality.", "If you will have partners or employees from day one, an LLC usually keeps things tidier."],
    },
  },
]

let lang = LANGS.es
let lenis = null
let swiper = null
let revealObserver = null

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
  renderPosts(page)
}

function postCardMarkup(post, index) {
  return `<button class="post reveal is-in" type="button" data-post="${index}">
    <img src="${post.image}" alt="" width="640" height="420" loading="lazy" decoding="async" />
    <span class="post-body">
      <time>${post.date[lang]}</time>
      <strong class="post-title">${post.title[lang]}</strong>
      <span class="post-excerpt">${post.excerpt[lang]}</span>
    </span>
  </button>`
}

function renderPosts(page) {
  page.querySelector("#posts").innerHTML = POSTS.map(postCardMarkup).join("")
}

function openPost(index) {
  const post = POSTS[index]
  const paragraphs = post.body[lang].map((paragraph) => `<p>${paragraph}</p>`).join("")
  document.getElementById("reader-body").innerHTML = `<img src="${post.image}" alt="" />
    <div><time>${post.date[lang]}</time><h2>${post.title[lang]}</h2>${paragraphs}</div>`
  document.getElementById("reader").showModal()
}

function setTheme(page, theme) {
  page.dataset.theme = theme
}

function renderEditing({ page, isActive }) {
  const isEditing = isActive("textPanel")
  page.classList.toggle("is-editing", isEditing)
  page.querySelectorAll("[data-editable]").forEach((element) => {
    element.contentEditable = isEditing ? "plaintext-only" : "false"
  })
}

function renderMap({ isActive }) {
  const frame = document.getElementById("map-frame")
  if (isActive("mapDirections") && !frame.src) frame.src = MAP_URL
}

function renderCarousel({ isActive }) {
  if (!isActive("workCarousel") || !Swiper) return
  if (swiper) {
    swiper.update()
    return
  }
  swiper = new Swiper("#cases", {
    slidesPerView: 1.08,
    spaceBetween: 14,
    loop: true,
    grabCursor: true,
    autoplay: REDUCED_MOTION ? false : { delay: 3400, pauseOnMouseEnter: true },
    pagination: { el: "#cases .swiper-pagination", clickable: true },
    // Los cortes dependen del ancho del carrusel, no de la ventana, para que la vista "Celular" funcione.
    breakpointsBase: "container",
    breakpoints: {
      640: { slidesPerView: 2.1, spaceBetween: 18 },
      980: { slidesPerView: 3, spaceBetween: 18 },
    },
  })
}

function watchReveals(page, stage) {
  if (REDUCED_MOTION) return
  page.classList.add("has-motion")
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries
        .filter((entry) => entry.isIntersecting)
        .forEach((entry, order) => {
          entry.target.style.setProperty("--delay", `${order * REVEAL_STAGGER_MS}ms`)
          entry.target.classList.add("is-in")
          revealObserver.unobserve(entry.target)
        })
    },
    { root: stage, rootMargin: "0px 0px -8% 0px" }
  )
  page.querySelectorAll(".reveal:not(.is-in)").forEach((element) => revealObserver.observe(element))
}

function animateCounter(element) {
  const target = Number(element.dataset.count)
  const counter = { value: 0 }
  gsap.to(counter, {
    value: target,
    duration: COUNT_DURATION_S,
    ease: "power2.out",
    onUpdate: () => {
      element.textContent = String(Math.round(counter.value))
    },
  })
}

function startMotion(page, stage) {
  if (REDUCED_MOTION || !gsap) return
  gsap.from(page.querySelectorAll("[data-intro]"), { y: 30, opacity: 0, duration: 0.9, stagger: 0.09, ease: "power3.out", clearProps: "all" })

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.filter((entry) => entry.isIntersecting).forEach((entry) => {
        animateCounter(entry.target)
        counterObserver.unobserve(entry.target)
      })
    },
    { root: stage, threshold: 0.6 }
  )
  page.querySelectorAll("[data-count]").forEach((element) => counterObserver.observe(element))

  if (!ScrollTrigger) return
  gsap.registerPlugin(ScrollTrigger)
  const heroScroll = { trigger: page.querySelector(".hero"), scroller: stage, start: "top top", end: "bottom top", scrub: true }
  gsap.to(page.querySelector(".hero-img"), { yPercent: 7, ease: "none", scrollTrigger: heroScroll })
  gsap.to(page.querySelector(".hero-glow"), { yPercent: 30, ease: "none", scrollTrigger: heroScroll })
}

function startSmoothScroll(page, stage) {
  if (REDUCED_MOTION || !Lenis || !gsap) return
  // Lenis anima el scroll por su cuenta; el scroll suave nativo del contenedor se pisaría con él.
  stage.style.scrollBehavior = "auto"
  lenis = new Lenis({ wrapper: stage, content: page, duration: 1.05 })
  if (ScrollTrigger) lenis.on("scroll", ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
}

function scrollToSection(sectionId) {
  const target = document.getElementById(sectionId)
  if (!target) return
  if (lenis) lenis.scrollTo(target, { offset: NAV_OFFSET_PX })
  else target.scrollIntoView({ behavior: "smooth", block: "start" })
}

function domainProofMarkup() {
  const lock =
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>'
  return `<div class="proof">
    <p class="proof-title">Sin dominio propio:</p>
    <div class="urlbar is-weak">${lock}<span>estudio-vargas.netlify.app</span></div>
    <p class="proof-title">Con dominio y hosting gestionados:</p>
    <div class="urlbar">${lock}<strong>estudiovargas.bo</strong></div>
  </div>`
}

function handleRender(api) {
  renderEditing(api)
  renderMap(api)
  renderCarousel(api)
  // Al aparecer o quitarse secciones cambia el alto de la página.
  revealObserver && api.page.querySelectorAll(".reveal:not(.is-in)").forEach((element) => revealObserver.observe(element))
  lenis?.resize()
  ScrollTrigger?.refresh()
}

function handleToggle(extraId, isOn, api) {
  // Al quitar un extra (o todos) el sitio vuelve a su estado base.
  if (!api.isActive("secondLanguage") && lang !== LANGS.es) setLanguage(LANGS.es, api)
  if (!api.isActive("themeToggle")) setTheme(api.page, THEMES.light)
  if (extraId === "themeToggle" && isOn) setTheme(api.page, THEMES.dark)
  return false
}

const panel = startExtrasPanel({
  packId: "packWeb",
  packName: "la web de negocio",
  title: "Arma tu web",
  included: [
    "Hasta 5 secciones: inicio, servicios, nosotros, cifras y contacto",
    "Menú, pie de página y botón de WhatsApp",
    "Formulario de contacto y SEO on-page",
    "Diseño para celular y computadora",
    "Publicación y 3 rondas de cambios",
  ],
  extraUi: EXTRA_UI,
  proofs: { domainHosting: domainProofMarkup },
  onRender: handleRender,
  onToggle: handleToggle,
})

const { page, stage } = panel

function bindPage() {
  page.addEventListener("click", (event) => {
    const goto = event.target.closest("[data-goto]")
    if (goto) {
      event.preventDefault()
      scrollToSection(goto.dataset.goto)
      return
    }
    const post = event.target.closest("[data-post]")
    if (post) openPost(Number(post.dataset.post))
  })
  page.querySelectorAll("[data-lang]").forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.lang, panel))
  })
  document.getElementById("theme-btn").addEventListener("click", () => {
    setTheme(page, page.dataset.theme === THEMES.dark ? THEMES.light : THEMES.dark)
  })
  document.getElementById("whatsapp").addEventListener("click", () => panel.showToast(text().whatsappToast))
  document.getElementById("wa-float").addEventListener("click", () => panel.showToast(text().whatsappToast))
  document.getElementById("directions").addEventListener("click", () => panel.showToast(text().directionsToast))
  document.getElementById("reader-close").addEventListener("click", () => document.getElementById("reader").close())
  stage.addEventListener("scroll", () => {
    page.querySelector(".nav").classList.toggle("is-stuck", stage.scrollTop > NAV_STUCK_AFTER_PX)
  }, { passive: true })
}

function bindTextPanel() {
  // Lo que se escribe queda como el texto del idioma que se está viendo.
  page.addEventListener("input", (event) => {
    const element = event.target.closest("[data-editable]")
    if (element) element.dataset[lang] = element.textContent
  })
  document.getElementById("edit-save").addEventListener("click", () => panel.showToast(text().saved))
}

function bindForm() {
  const form = document.getElementById("contact-form")
  form.addEventListener("submit", (event) => {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(form))
    const isValid = data.name.trim() !== "" && data.contact.trim() !== ""
    document.getElementById("form-error").hidden = isValid
    if (!isValid) return
    form.reset()
    panel.showToast(text().formSent)
  })
}

renderPosts(page)
bindPage()
bindTextPanel()
bindForm()
watchReveals(page, stage)
startMotion(page, stage)
startSmoothScroll(page, stage)
// La URL puede traer extras ya activos: se aplica su estado inicial.
handleToggle(null, false, panel)
if (panel.isActive("themeToggle")) setTheme(page, THEMES.dark)
handleRender(panel)
