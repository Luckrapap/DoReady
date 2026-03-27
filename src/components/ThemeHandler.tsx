'use client'

import { useEffect, useCallback } from 'react'

/**
 * ThemeHandler is a global, render-less component that listens for system theme changes
 * and ensures the document's dark mode classes stay in sync with the user's preference.
 * Specifically tuned for Mobile WebViews with extra mount-time checks and compatibility fallbacks.
 * v1.4: Added CSS-based detection fallback for buggy WebViews.
 */
export default function ThemeHandler() {
    const applyThemeStyles = useCallback((isDark: boolean) => {
        const doc = document.documentElement
        doc.classList.toggle('dark', isDark)
        doc.classList.toggle('light', !isDark)
        doc.style.setProperty('color-scheme', isDark ? 'dark' : 'light')
    }, [])

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        
        const checkAndApply = () => {
            const currentTheme = localStorage.getItem('theme') || 'system'
            const prefersDark = mediaQuery.matches
            // CSS variable fallback for WebViews that don't pass media queries to JS
            const cssDark = typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue('--system-is-dark').trim() === '1' : false
            
            const isDark = currentTheme === 'dark' || (currentTheme === 'system' && (prefersDark || cssDark))
            applyThemeStyles(isDark)
        }

        // 1. Re-check on mount to ensure synchronization in native containers/WebViews
        checkAndApply()

        // 2. Dynamic listener with legacy fallback for better APK/WebView support
        const handleSystemChange = (e: MediaQueryListEvent | MediaQueryList | any) => {
            const currentTheme = localStorage.getItem('theme') || 'system'
            if (currentTheme === 'system') {
                applyThemeStyles(e.matches)
            }
        }

        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleSystemChange)
        } else if ((mediaQuery as any).addListener) {
            (mediaQuery as any).addListener(handleSystemChange)
        }

        // 3. Keep theme synced across sessions and tabs
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
            window.removeEventListener('storage', handleStorageChange)
        }
    }, [applyThemeStyles])

    return null
}
