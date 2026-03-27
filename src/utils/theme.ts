/**
 * Utility for theme detection in DoReady.
 * Centralizes the triple-check logic: Standard API, CSS Fallback, and Smart Night Mode.
 */
export const isDarkModeRequested = () => {
  if (typeof window === 'undefined') return false

  const currentTheme = localStorage.getItem('theme') || 'system'
  if (currentTheme === 'dark') return true
  if (currentTheme === 'light') return false

  // If theme is 'system'
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const cssDark = getComputedStyle(document.documentElement).getPropertyValue('--system-is-dark').trim() === '1'
  const hour = new Date().getHours()
  const isNight = hour >= 19 || hour < 7

  return prefersDark || cssDark || isNight
}
