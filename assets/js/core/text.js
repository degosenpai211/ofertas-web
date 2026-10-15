import { I18N } from "../i18n.js"
import { getLang } from "./preferences.js"

const TEMPLATE_TOKEN = /\{(\w+)\}/g

export function dict() {
  return I18N[getLang()]
}

function lookup(path) {
  return path.split(".").reduce((node, key) => node?.[key], dict())
}

export function applyStaticText() {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = lookup(element.dataset.i18n)
    if (typeof value === "string") element.textContent = value
  })
  document.documentElement.lang = getLang()
}

export function fillTemplate(template, values) {
  return template.replace(TEMPLATE_TOKEN, (token, key) => (key in values ? String(values[key]) : token))
}
