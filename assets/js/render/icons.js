const SVG_ATTRIBUTES =
  'width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"'

function icon(paths) {
  return `<svg ${SVG_ATTRIBUTES}>${paths}</svg>`
}

export function sunIcon() {
  return icon('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>')
}

export function moonIcon() {
  return icon('<path d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5z"/>')
}

export function menuIcon() {
  return icon('<path d="M4 7h16M4 12h16M4 17h16"/>')
}

export function closeIcon() {
  return icon('<path d="M6 6l12 12M18 6 6 18"/>')
}

export function checkIcon() {
  return icon('<path d="m5 12 5 5L20 7"/>')
}

export function minusIcon() {
  return icon('<path d="M5 12h14"/>')
}

export function arrowIcon() {
  return icon('<path d="M5 12h14M13 6l6 6-6 6"/>')
}
