'use client'

import { useLayoutEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { isDarkModeRequested, syncNativeTheme, addNativeThemeListener, setNativeSystemBars, getThemeBackground } from '@/utils/theme'

/**
 * ThemeHandler v9.0 [The Nucleus - Simplified]
 * Handles only Light/Dark/System modes. Chromatic accents have been removed.
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

        // 2. Remove any legacy preset classes (Safety cleanup)
        doc.classList.remove('theme-blue', 'theme-slate', 'theme-purple', 'theme-green', 'theme-red', 'theme-orange', 'theme-yellow', 'theme-pink', 'theme-custom')

        // 3. Update Browser Meta (Instant)
        const bgColor = getThemeBackground(isDark, 'slate')
        const metaThemeColor = document.querySelector('meta[name="theme-color"]')
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', bgColor)
        }

        // 4. Native Bars (APK only)
        setNativeSystemBars(isDark)
    }, [])

    useLayoutEffect(() => {
        const checkAndApply = async () => {
            await syncNativeTheme()
            applyThemeStyles(isDarkModeRequested())
        }

        // 1. Initial Sync
        checkAndApply()

        // 2. Native Bridge Listener (Real-time updates)
        const setupNative = async () => {
            const handle = await addNativeThemeListener((isDark) => {
                if (localStorage.getItem('theme') === 'system') {
                    applyThemeStyles(isDark)
                    // Disparar evento para que React se actualice en tiempo real
                    window.dispatchEvent(Object.assign(new Event('storage'), {
                        key: 'theme',
                        newValue: 'system',
                        skipReload: true
                    }))
                }
            })
            return handle as { remove: () => void }
        }
        const nativeSyncPromise = setupNative()

        // 3. Reliability Re-syncs (Visibility/Focus)
        const handleSync = () => { if (document.visibilityState === 'visible') checkAndApply() }
        document.addEventListener('visibilitychange', handleSync)
        window.addEventListener('focus', handleSync)

        // 4. Settings change listener
        const handleSettings = (e: any) => {
            if (e.key === 'theme') {
                applyThemeStyles(isDarkModeRequested())
            }
        }
        window.addEventListener('storage', handleSettings)

        return () => {
            document.removeEventListener('visibilitychange', handleSync)
            window.removeEventListener('focus', handleSync)
            window.removeEventListener('storage', handleSettings)
            nativeSyncPromise.then(h => h?.remove())
        }
    }, [applyThemeStyles])

    // 5. Force React to re-apply classes on every route change
    useLayoutEffect(() => {
       applyThemeStyles(isDarkModeRequested())
    }, [pathname, applyThemeStyles])

    return null
}
