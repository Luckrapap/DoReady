import { Capacitor, registerPlugin, type PluginListenerHandle } from '@capacitor/core'

/**
 * System Theme Plugin Definition (Bridge to MainActivity.java)
 */
interface SystemThemePlugin {
  getTheme(): Promise<{ value: string }>;
  setStatusBarTheme(options: { isDark: boolean }): Promise<void>;
  addListener(eventName: 'systemThemeChange', listenerFunc: (data: { value: string }) => void): Promise<PluginListenerHandle> & PluginListenerHandle;
}

const SystemTheme = registerPlugin<SystemThemePlugin>('SystemTheme');

export const addNativeThemeListener = (callback: (isDark: boolean) => void) => {
  if (Capacitor.getPlatform() === 'android') {
    const handle = SystemTheme.addListener('systemThemeChange', (data) => {
      if (data.value === 'dark' || data.value === 'light') {
        nativeThemeCache = data.value as 'dark' | 'light'
        callback(data.value === 'dark')
      }
    });
    return handle;
  }
  return null;
}

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

  // Standard API Check (Wrapped safely to prevent WebView crashes)
  try {
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return true
  } catch (e) {}

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
      const { value } = await SystemTheme.getTheme()
      
      if (value === 'dark' || value === 'light') {
        nativeThemeCache = value as 'dark' | 'light'
        return value === 'dark'
      }
    } catch (e) {
      console.warn('Capacitor Native Theme Sync skip/error:', e)
    }
  }
  return isDarkModeRequested()
}

export const setNativeSystemBars = async (isDark: boolean) => {
  if (Capacitor.getPlatform() === 'android') {
    try {
      await SystemTheme.setStatusBarTheme({ isDark })
    } catch (e) {
      console.error('Failed to set native system bars:', e)
    }
  }
}
