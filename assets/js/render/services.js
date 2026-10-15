import { formatPricePair } from "../core/format.js"
import { dict, fillTemplate } from "../core/text.js"
import { JOBS, JOB_PRICE_KINDS } from "../data/catalog.js"
import { renderInto } from "./components.js"

const JOBS_CONTAINER_ID = "jobs-grid"
const PRICE_TEMPLATE_KEYS = {
  [JOB_PRICE_KINDS.fixed]: "jobPriceFixed",
  [JOB_PRICE_KINDS.from]: "jobPriceFrom",
  [JOB_PRICE_KINDS.monthly]: "jobPriceMonthly",
}

function jobPriceLabel(job) {
  return fillTemplate(dict()[PRICE_TEMPLATE_KEYS[job.priceKind]], { price: formatPricePair(job.priceBs) })
}

function jobCardMarkup(job) {
  const [title, description] = dict().jobs[job.id]
  return `<article class="card spotlight reveal">
    <div class="card-body">
      <h3 class="card-title">${title}</h3>
      <p class="job-price">${jobPriceLabel(job)}</p>
      <p class="card-text">${description}</p>
    </div>
  </article>`
}

export function renderServices() {
  renderInto(JOBS_CONTAINER_ID, () => JOBS.map(jobCardMarkup).join(""))
}
