'use client'

import { useEffect, useCallback } from 'react'

/**
 * ThemeHandler v1.6 [Ultimate Smart Engine]
 * A global component that ensures the theme stays in sync using a triple-redundancy strategy:
 * 1. Native API (matchMedia)
 * 2. CSS-to-JS Bridge (APK Shield)
 * 3. Time-based Fallback (Smart Night Mode 7PM-7AM) - The final solution for restricted WebViews.
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
        
        const checkAndApply = () => {
            const currentTheme = localStorage.getItem('theme') || 'system'
            const prefersDark = mediaQuery.matches
            
            // 1. APK SHIELD: CSS variable fallback
            const cssDark = typeof window !== 'undefined' ? 
                getComputedStyle(document.documentElement).getPropertyValue('--system-is-dark').trim() === '1' : 
                false
            
            // 2. SMART NIGHT: Time-based detection (7 PM to 7 AM)
            const hour = new Date().getHours()
            const isNight = hour >= 19 || hour < 7
            
            // FINAL SMART LOGIC: Use Native or CSS. If both fail (APK restricted), use Time.
            const isDark = currentTheme === 'dark' || (currentTheme === 'system' && (prefersDark || cssDark || isNight))
            applyThemeStyles(isDark)
        }

        // Run sync on mount and focus
        checkAndApply()

        const handleSystemChange = (e: MediaQueryListEvent | MediaQueryList | any) => {
            if (localStorage.getItem('theme') === 'system') {
                checkAndApply() // Full re-check on system change
            }
        }

        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleSystemChange)
        } else if ((mediaQuery as any).addListener) {
            (mediaQuery as any).addListener(handleSystemChange)
        }

        window.addEventListener('focus', checkAndApply)

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
