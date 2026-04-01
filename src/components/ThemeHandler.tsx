'use client'

import { useEffect, useCallback } from 'react'
import { isDarkModeRequested, syncNativeTheme, addNativeThemeListener, setNativeSystemBars } from '@/utils/theme'

/**
 * ThemeHandler v4.0 [Definitive Sync]
 * Uses Native Bridge Events + standard media queries + 
 * Resiliency Heartbeat for guaranteed synchronization.
 */
export default function ThemeHandler() {
    const applyThemeStyles = useCallback((isDark: boolean) => {
        const doc = document.documentElement

        // Prevent redundant mutations
        const currentIsDark = doc.classList.contains('dark')
        const currentIsLight = doc.classList.contains('light')
        const currentColorScheme = doc.style.getPropertyValue('color-scheme')

        if (currentIsDark === isDark && currentIsLight === !isDark && currentColorScheme === (isDark ? 'dark' : 'light')) {
            return
        }

        doc.style.setProperty('color-scheme', isDark ? 'dark' : 'light')

        // Update native bars (Android) - Only on actual change
        setNativeSystemBars(isDark)
    }, [])

    useEffect(() => {

        const checkAndApply = async () => {
            // Priority: Attempt Native Sync first (100% reliable in APK)
            await syncNativeTheme()
            applyThemeStyles(isDarkModeRequested())
        }

        // 1. Initial sync
        checkAndApply()

        // 2. Native Bridge Listener (Real-time updates in APK)
        const setupNative = async () => {
            const handle = await addNativeThemeListener((isDark) => {
                if (localStorage.getItem('theme') === 'system') {
                    applyThemeStyles(isDark)
                }
            })
            return handle
        }
        const nativeSyncPromise = setupNative()

        // 3. Listen for system changes (standard Web API)
        const handleSystemChange = () => {
            if (localStorage.getItem('theme') === 'system') {
                checkAndApply()
            }
        }

        try {
            if (window.matchMedia) {
                const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
                if (mediaQuery.addEventListener) {
                    mediaQuery.addEventListener('change', handleSystemChange)
                } else if ((mediaQuery as any).addListener) {
                    (mediaQuery as any).addListener(handleSystemChange)
                }
            }
        } catch (e) { }

        // 4. Resiliency Heartbeat (Polling every 3s as safety net)
        const heartbeat = setInterval(() => {
            if (localStorage.getItem('theme') === 'system') {
                applyThemeStyles(isDarkModeRequested())
            }
        }, 3000)

        // Resiliency sync on focus
        window.addEventListener('focus', checkAndApply)

        // Storage sync (tabs/settings)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'theme' || e.key === 'theme-preset') {
                checkAndApply()
                if (e.key === 'theme-preset') window.location.reload()
            }
        }
        window.addEventListener('storage', handleStorageChange)

        return () => {
            nativeSyncPromise.then(h => {
                if (h && typeof h.remove === 'function') h.remove()
            })
            clearInterval(heartbeat)
            window.removeEventListener('focus', checkAndApply)
            window.removeEventListener('storage', handleStorageChange)
        }
    }, [applyThemeStyles])

    return null
}
