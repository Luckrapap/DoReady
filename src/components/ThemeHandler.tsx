'use client'

import { useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { isDarkModeRequested, syncNativeTheme, addNativeThemeListener, setNativeSystemBars, getThemeBackground } from '@/utils/theme'

/**
 * ThemeHandler v7.0 [Engineering Final Fix]
 */
export default function ThemeHandler() {
    const pathname = usePathname()

    const applyThemeStyles = useCallback((isDark: boolean) => {
        if (typeof window === 'undefined') return
        const doc = document.documentElement

        // 1. Core Classes & System Mode
        doc.classList.toggle('dark', isDark)
        doc.classList.toggle('light', !isDark)
        doc.style.setProperty('color-scheme', isDark ? 'dark' : 'light')

        // 2. Preset & Hex Sync (Zero-Latency Config)
        const preset = (localStorage.getItem('theme-preset') || 'slate') as string
        const hue = localStorage.getItem('theme-custom-hue') || '220'
        
        doc.classList.remove('theme-blue', 'theme-slate', 'theme-purple', 'theme-green', 'theme-red', 'theme-orange', 'theme-yellow', 'theme-pink', 'theme-custom')
        if (preset !== 'slate') {
            doc.classList.add(`theme-${preset}`)
        }
        if (preset === 'custom') {
            doc.style.setProperty('--custom-hue', hue)
        }

        // 3. Update Browser Meta (Instant from Config)
        const bgColor = getThemeBackground(isDark, preset)
        const metaThemeColor = document.querySelector('meta[name="theme-color"]')
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', bgColor)
        }

        // 4. Native Bars (APK only)
        setNativeSystemBars(isDark)
    }, [])

    useEffect(() => {
        const checkAndApply = async () => {
            // Priority: Wait for bridge and sync
            await syncNativeTheme()
            applyThemeStyles(isDarkModeRequested())
        }

        // 1. Initial Sync & Visibility
        checkAndApply()

        // 2. Native Bridge Listener
        const setupNative = async () => {
            const handle = await addNativeThemeListener((isDark) => {
                if (localStorage.getItem('theme') === 'system') {
                    applyThemeStyles(isDark)
                }
            })
            return handle
        }
        const nativeSyncPromise = setupNative()

        // 3. Reliability Triggers
        const handleVisibility = () => {
             if (document.visibilityState === 'visible') checkAndApply()
        }
        document.addEventListener('visibilitychange', handleVisibility)
        window.addEventListener('focus', checkAndApply)

        // 4. Same-tab Synchronization
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

    // 5. Force Sync on Navigation (Fixes hydration issues between routes)
    useEffect(() => {
        applyThemeStyles(isDarkModeRequested())
    }, [pathname, applyThemeStyles])

    return null
}
