'use client'

import { useEffect, useCallback } from 'react'
import { isDarkModeRequested, syncNativeTheme } from '@/utils/theme'

/**
 * ThemeHandler v3.0 [Native Bridge Ready]
 * Updates the theme cache via Capacitor (if available) before 
 * applying the standard hydration logic.
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

        doc.classList.toggle('dark', isDark)
        doc.classList.toggle('light', !isDark)
        doc.style.setProperty('color-scheme', isDark ? 'dark' : 'light')
    }, [])

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        
        const checkAndApply = async () => {
            // Priority: Attempt Native Sync first (100% reliable in APK)
            await syncNativeTheme()
            applyThemeStyles(isDarkModeRequested())
        }

        // Initial sync
        checkAndApply()

        // Listen for system changes (standard API)
        const handleSystemChange = () => {
            if (localStorage.getItem('theme') === 'system') {
                checkAndApply()
            }
        }

        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleSystemChange)
        } else if ((mediaQuery as any).addListener) {
            (mediaQuery as any).addListener(handleSystemChange)
        }

        // Resiliency sync
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
            if (mediaQuery.removeEventListener) {
                mediaQuery.removeEventListener('change', handleSystemChange)
            } else if ((mediaQuery as any).removeListener) {
                (mediaQuery as any).removeListener(handleSystemChange)
            }
            window.removeEventListener('focus', checkAndApply)
            window.removeEventListener('storage', handleStorageChange)
        }
    }, [applyThemeStyles])

    return null
}
