import { waHref } from "../core/contact.js"
import { ROUTES } from "../core/routes.js"
import { dict } from "../core/text.js"
import { renderInto } from "./components.js"

const FINAL_CTA_CONTAINER_ID = "cta-final-box"

function finalCtaMarkup() {
  const t = dict()
  return `<div class="cta-box reveal">
    <h2 class="section-title">${t.ctaTitle}</h2>
    <p class="cta-lead">${t.ctaLead}</p>
    <div class="button-row">
      <a class="btn btn-inverse" href="${ROUTES.quote}">${t.ctaQuote}</a>
      <a class="btn btn-outline-inverse" href="${waHref()}">${t.writeWa}</a>
    </div>
  </div>`
}

export function renderFinalCta() {
  renderInto(FINAL_CTA_CONTAINER_ID, finalCtaMarkup)
}
