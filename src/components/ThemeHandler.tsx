'use client'

import { useEffect, useCallback } from 'react'

/**
 * ThemeHandler v1.5 [Final Shield]
 * A global, render-less component that ensures the document's dark mode classes 
 * stay in sync with the user's preference and the system setting.
 * Optimized for APK/Native containers with a hybrid detection strategy:
 * 1. JS MatchMedia API (Standard)
 * 2. CSS-to-JS Bridge Fallback (Robust APK Support)
 * 3. Focus Heartbeat (Resilient Sync on App Resume)
 */
export default function ThemeHandler() {
    const applyThemeStyles = useCallback((isDark: boolean) => {
        const doc = document.documentElement
        
        // Prevent redundant DOM mutations
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
        
        const checkAndApply = () => {
            const currentTheme = localStorage.getItem('theme') || 'system'
            const prefersDark = mediaQuery.matches
            
            // HYBRID DETECTION: Look for the CSS variable from globals.css as fallback
            const cssDark = typeof window !== 'undefined' ? 
                getComputedStyle(document.documentElement).getPropertyValue('--system-is-dark').trim() === '1' : 
                false
            
            // Final decision: if system, use either API or CSS detection
            const isDark = currentTheme === 'dark' || (currentTheme === 'system' && (prefersDark || cssDark))
            applyThemeStyles(isDark)
        }

        // Initial check on mount
        checkAndApply()

        // Listener for system settings changes
        const handleSystemChange = (e: MediaQueryListEvent | MediaQueryList | any) => {
            const currentTheme = localStorage.getItem('theme') || 'system'
            if (currentTheme === 'system') {
                applyThemeStyles(e.matches)
            }
        }

        // Multi-browser event standard
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleSystemChange)
        } else if ((mediaQuery as any).addListener) {
            (mediaQuery as any).addListener(handleSystemChange)
        }

        // HEARTBEAT: Re-check when the app gains focus (returns from background)
        window.addEventListener('focus', checkAndApply)

        // Tab synchronization
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
