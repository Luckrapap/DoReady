import { Capacitor } from '@capacitor/core'

/**
 * Theme Detection Utility v3.0 (Capacitor Native Bridge)
 * Hybrid approach:
 * 1. prefers-color-scheme (Standard API)
 * 2. Capacitor Native Plugin (SystemTheme) - Definitive for Android/APK
 * 3. CanvasText System Color (CSS Level 4 Sensor) - Fallback
 */

// Native Cache to avoid async flickering on every call
let nativeThemeCache: 'dark' | 'light' | null = null

export const isDarkModeRequested = () => {
  if (typeof window === 'undefined') return false

  const theme = localStorage.getItem('theme') || 'system'
  if (theme === 'dark') return true
  if (theme === 'light') return false

  // If we have a cached native theme from Capacitor, use it
  if (nativeThemeCache === 'dark') return true
  if (nativeThemeCache === 'light') return false

  // Standard API Check
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return true

  // Sensor fallback (Web only)
  try {
    const temp = document.createElement('div')
    temp.style.color = 'CanvasText'
    document.body.appendChild(temp)
    const color = getComputedStyle(temp).color
    document.body.removeChild(temp)
    return color.includes('255') || color === 'white'
  } catch (e) {
    return false
  }
}

/**
 * Triggers a native theme check (Async)
 * Stores the result in nativeThemeCache for synchronous consumption
 */
export const syncNativeTheme = async () => {
    if (Capacitor.getPlatform() === 'android') {
        try {
            // Use the custom plugin we created in MainActivity.java
            const { value } = await (Capacitor as any).Plugins.SystemTheme.getTheme()
            if (value === 'dark' || value === 'light') {
                nativeThemeCache = value as 'dark' | 'light'
                return value === 'dark'
            }
        } catch (e) {
            console.error('Capacitor Native Theme Error:', e)
        }
    }
    return isDarkModeRequested()
}
