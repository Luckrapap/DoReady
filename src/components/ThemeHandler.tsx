'use client'

import { useLayoutEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { isDarkModeRequested, syncNativeTheme, addNativeThemeListener, setNativeSystemBars, getThemeBackground } from '@/utils/theme'

/**
 * ThemeHandler v8.0 [The Nucleus - Definitive Fix]
 */
export default function ThemeHandler() {
    const pathname = usePathname()

    const applyThemeStyles = useCallback((isDark: boolean) => {
        if (typeof window === 'undefined') return
        const doc = document.documentElement

        // 1. Core Classes & System Contrast
        doc.classList.toggle('dark', isDark)
        doc.classList.toggle('light', !isDark)
        doc.style.setProperty('color-scheme', isDark ? 'dark' : 'light')

        // 2. Preset & Static Hex Sync (Zero-Latency)
        const preset = (localStorage.getItem('theme-preset') || 'slate') as string
        const hue = localStorage.getItem('theme-custom-hue') || '220'
        
        doc.classList.remove('theme-blue', 'theme-slate', 'theme-purple', 'theme-green', 'theme-red', 'theme-orange', 'theme-yellow', 'theme-pink', 'theme-custom')
        if (preset !== 'slate') {
            doc.classList.add(`theme-${preset}`)
        }
        if (preset === 'custom') {
            doc.style.setProperty('--custom-hue', hue)
        }

        // 3. Update Browser Meta (Instant)
        const bgColor = getThemeBackground(isDark, preset)
        const metaThemeColor = document.querySelector('meta[name="theme-color"]')
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', bgColor)
        }

        // 4. Native Bars (APK only)
        setNativeSystemBars(isDark)
    }, [])

    useLayoutEffect(() => {
        let pollCount = 0
        const maxPolls = 30 // 3 seconds total (100ms * 30)
        
        const checkAndApply = async () => {
            // Priority: Wait for bridge sync (polling handled in theme.ts)
            const wasSynced = await syncNativeTheme()
            applyThemeStyles(isDarkModeRequested())
            return wasSynced
        }

        // 1. Initial Sync Attempt
        checkAndApply()

        // 2. Overdrive Polling Loop (Initial 3 seconds)
        // This ensures that even if the bridge is slow, it captures the sync ASAP
        const pollInterval = setInterval(async () => {
            pollCount++
            await checkAndApply()
            if (pollCount >= maxPolls) {
                clearInterval(pollInterval)
            }
        }, 100)

        // 3. Continuous Synchronization Bridge (Real-time updates)
        const setupNative = async () => {
            const handle = await addNativeThemeListener((isDark) => {
                if (localStorage.getItem('theme') === 'system') {
                    applyThemeStyles(isDark)
                }
            })
            return handle
        }
        const nativeSyncPromise = setupNative()

        // 4. Reliability Re-syncs (Visibility/Focus)
        const handleSync = () => {
            if (document.visibilityState === 'visible') checkAndApply()
        }
        document.addEventListener('visibilitychange', handleSync)
        window.addEventListener('focus', handleSync)

        // 5. Settings change listener (Sync across tabs/components)
        const handleSettings = (e: any) => {
            if (e.key === 'theme' || e.key === 'theme-preset' || e.key === 'theme-custom-hue') {
                applyThemeStyles(isDarkModeRequested())
                if (e.key === 'theme-preset' && !e.skipReload) window.location.reload()
            }
        }
        window.addEventListener('storage', handleSettings)

        return () => {
            clearInterval(pollInterval)
            document.removeEventListener('visibilitychange', handleSync)
            window.removeEventListener('focus', handleSync)
            window.removeEventListener('storage', handleSettings)
            nativeSyncPromise.then(h => h?.remove())
        }
    }, [applyThemeStyles])

    // 5. Force React to re-apply classes on every route change (Nucleus Isolation)
    useLayoutEffect(() => {
       applyThemeStyles(isDarkModeRequested())
    }, [pathname, applyThemeStyles])

    return null
}
