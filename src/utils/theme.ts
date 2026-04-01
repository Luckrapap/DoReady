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

let isBridgeReady = false

/**
 * Polls for Capacitor bridge readiness on remote URLs (Vercel)
 */
const ensureBridge = async (timeout = 3000): Promise<boolean> => {
  if (isBridgeReady) return true
  if (typeof window === 'undefined') return false
  
  const start = Date.now()
  while (Date.now() - start < timeout) {
    if ((window as any).Capacitor?.isNativePlatform?.()) {
      isBridgeReady = true
      return true
    }
    await new Promise(r => setTimeout(r, 100))
  }
  return false
}

export const isDarkModeRequested = () => {
  if (typeof window === 'undefined') return false

  const theme = localStorage.getItem('theme') || 'system'
  if (theme === 'dark') return true
  if (theme === 'light') return false

  // If we have a cached native theme from Capacitor, use it
  if (nativeThemeCache === 'dark') return true
  if (nativeThemeCache === 'light') return false

  // Fallback to standard matchMedia
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
}

/**
 * Triggers a native theme check (Async)
 * Stores the result in nativeThemeCache for synchronous consumption
 */
export const syncNativeTheme = async () => {
  if (Capacitor.getPlatform() === 'android') {
    const ready = await ensureBridge()
    if (!ready) return isDarkModeRequested()

    try {
      // Use a race to prevent the app from hanging if the plugin is missing/broken
      const result = await Promise.race([
        SystemTheme.getTheme(),
        new Promise((_, reject) => setTimeout(() => reject('Timeout'), 1000))
      ]) as { value: string }

      if (result.value === 'dark' || result.value === 'light') {
        nativeThemeCache = result.value as 'dark' | 'light'
        return result.value === 'dark'
      }
    } catch (e) {
      console.warn('Native Bridge Sync error (timed out or missing):', e)
    }
  }
  return isDarkModeRequested()
}

export const setNativeSystemBars = async (isDark: boolean) => {
  if (Capacitor.getPlatform() === 'android') {
    try {
      // Direct call to our custom, verified native bridge
      await SystemTheme.setStatusBarTheme({ isDark });
    } catch (e) {
      console.warn('Native Bridge setStatusBarTheme error:', e);
    }
  }
}
