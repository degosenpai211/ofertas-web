export const BREAKPOINTS = {
  tablet: 768,
  desktop: 1024,
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"

export function prefersReducedMotion() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches
}

export function tabletUpQuery() {
  return window.matchMedia(`(min-width: ${BREAKPOINTS.tablet}px)`)
}
