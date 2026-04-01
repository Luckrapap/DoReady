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
            // Attempt Native Sync to get the actual system state
            await syncNativeTheme()
            applyThemeStyles(isDarkModeRequested())
        }

        // 1. Initial execution (with small delay to ensure bridge is ready)
        setTimeout(checkAndApply, 100)

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

        // 3. Listen for system changes (Standard Web API fallback)
        const handleSystemChange = () => {
            if (localStorage.getItem('theme') === 'system') {
                checkAndApply()
            }
        }

        try {
            if (window.matchMedia) {
                const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
                mediaQuery.addEventListener('change', handleSystemChange)
            }
        } catch (e) { }

        // 4. Watch for storage changes (Real-time updates from ThemeSwitcher)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'theme' || e.key === 'theme-preset' || e.key === 'theme-custom-hue') {
                applyThemeStyles(isDarkModeRequested())
                if (e.key === 'theme-preset') window.location.reload()
            }
        }
        window.addEventListener('storage', handleStorageChange)

        return () => {
            nativeSyncPromise.then(h => h?.remove())
            window.removeEventListener('storage', handleStorageChange)
        }
    }, [applyThemeStyles])

    return null
}
