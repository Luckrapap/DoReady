/**
 * Theme Detection Utility v1.9 (Definitive No-Time)
 * Uses a hybrid approach to detect system theme WITHOUT using the clock:
 * 1. prefers-color-scheme (Standard API)
 * 2. CanvasText System Color (CSS Level 4 Sensor) - Reliable for restricted WebViews.
 */
export const isDarkModeRequested = () => {
  if (typeof window === 'undefined') return false

  const theme = localStorage.getItem('theme') || 'system'
  if (theme === 'dark') return true
  if (theme === 'light') return false

  // Standard API Check
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return true

  // APK SHIELD: System Color Sensing fallback
  // In many restricted WebViews, System Colors (CanvasText) adapt even if media queries don't.
  try {
    const temp = document.createElement('div')
    temp.style.color = 'CanvasText'
    document.body.appendChild(temp)
    const color = getComputedStyle(temp).color
    document.body.removeChild(temp)
    
    // If CanvasText is white or very light, the system is in Dark mode
    // (rgb(255, 255, 255), white, etc.)
    return color.includes('255') || color === 'white'
  } catch (e) {
    return false
  }
}
