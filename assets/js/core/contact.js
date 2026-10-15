import { CONTACT } from "../config.js"
import { dict } from "./text.js"

const WHATSAPP_BASE_URL = "https://wa.me"

export function mailHref(body = "") {
  const subject = encodeURIComponent(dict().mailSubject)
  const bodyParam = body ? `&body=${encodeURIComponent(body)}` : ""
  return `mailto:${CONTACT.email}?subject=${subject}${bodyParam}`
}

export function waHref(body = "") {
  if (!CONTACT.whatsapp) return mailHref(body)
  const textParam = body ? `?text=${encodeURIComponent(body)}` : ""
  return `${WHATSAPP_BASE_URL}/${CONTACT.whatsapp}${textParam}`
}
