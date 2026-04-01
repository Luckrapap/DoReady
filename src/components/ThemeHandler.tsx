'use client'

import { useEffect, useCallback } from 'react'
import { isDarkModeRequested, syncNativeTheme, addNativeThemeListener, setNativeSystemBars } from '@/utils/theme'

/**
 * ThemeHandler v5.0 [Unified Source of Truth]
 * - Centralizes Class Toggling (dark/light/theme-*)
 * - Manages Browser Meta (theme-color) for address bars
 * - Handlers Native Bridge & Synchronization
 */
export default function ThemeHandler() {
    const applyThemeStyles = useCallback((isDark: boolean) => {
        if (typeof window === 'undefined') return
        const doc = document.documentElement

        // 1. Toggling Classes (Core Theme)
        doc.classList.toggle('dark', isDark)
        doc.classList.toggle('light', !isDark)
        doc.style.setProperty('color-scheme', isDark ? 'dark' : 'light')

        // 2. Toggling Presets (Accents)
        const preset = (localStorage.getItem('theme-preset') || 'slate') as string
        const hue = localStorage.getItem('theme-custom-hue') || '220'
        
        doc.classList.remove('theme-blue', 'theme-slate', 'theme-purple', 'theme-green', 'theme-red', 'theme-orange', 'theme-yellow', 'theme-pink', 'theme-custom')
        if (preset !== 'slate') {
            doc.classList.add(`theme-${preset}`)
        }
        if (preset === 'custom') {
            doc.style.setProperty('--custom-hue', hue)
        }

        // 3. Update Browser Meta (Fixes 'Black Bar' in phone browsers)
        const bgColor = isDark 
            ? (preset === 'slate' ? '#020617' : getComputedStyle(doc).getPropertyValue('--background').trim())
            : (preset === 'slate' ? '#fafafa' : getComputedStyle(doc).getPropertyValue('--background').trim())
        
        const metaThemeColor = document.querySelector('meta[name="theme-color"]')
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', bgColor || (isDark ? '#020617' : '#fafafa'))
        }

        // 4. Update Native Bars (APK only)
        setNativeSystemBars(isDark)
    }, [])

    useEffect(() => {
        const checkAndApply = async () => {
            await syncNativeTheme()
            applyThemeStyles(isDarkModeRequested())
        }

        // 1. Precise Sync on Mount (Bridge-Aware)
        checkAndApply()

        // 2. Native Bridge Listener (Real-time APK updates)
        const setupNative = async () => {
            const handle = await addNativeThemeListener((isDark) => {
                if (localStorage.getItem('theme') === 'system') {
                    applyThemeStyles(isDark)
                }
            })
            return handle
        }
        const nativeSyncPromise = setupNative()

        // 3. Reliability Triggers: Visibility & Focus
        // Resync whenever the user returns to the app
        const handleVisibility = () => {
            if (document.visibilityState === 'visible') {
                checkAndApply()
            }
        }
        document.addEventListener('visibilitychange', handleVisibility)
        window.addEventListener('focus', checkAndApply)

        // 4. Same-tab Synchronization (Settings update)
        const handleThemeChange = (e: any) => {
            if (e.key === 'theme' || e.key === 'theme-preset' || e.key === 'theme-custom-hue') {
                applyThemeStyles(isDarkModeRequested())
                if (e.key === 'theme-preset' && !e.skipReload) window.location.reload()
            }
        }
        window.addEventListener('storage', handleThemeChange)

        return () => {
            document.removeEventListener('visibilitychange', handleVisibility)
            window.removeEventListener('focus', checkAndApply)
            window.removeEventListener('storage', handleThemeChange)
            nativeSyncPromise.then(h => h?.remove())
        }
    }, [applyThemeStyles])

    return null
}
