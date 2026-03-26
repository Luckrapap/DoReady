'use client'

import { useEffect } from 'react'

/**
 * ThemeHandler is a global, render-less component that listens for system theme changes
 * and ensures the document's dark mode classes stay in sync with the user's preference.
 */
export default function ThemeHandler() {
    useEffect(() => {
        const applyThemeStyles = (isDark: boolean) => {
            const doc = document.documentElement
            doc.classList.toggle('dark', isDark)
            doc.classList.toggle('light', !isDark)
            doc.style.setProperty('color-scheme', isDark ? 'dark' : 'light')
        }

        const handleSystemChange = (e: MediaQueryListEvent | MediaQueryList) => {
            const currentTheme = localStorage.getItem('theme') || 'system'
            if (currentTheme === 'system') {
                applyThemeStyles(e.matches)
            }
        }

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        
        // Listen for system preference changes (Chrome-like behavior)
        mediaQuery.addEventListener('change', handleSystemChange)

        // Sync theme changes across different tabs
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'theme' || e.key === 'theme-preset') {
                const newTheme = localStorage.getItem('theme') || 'system'
                const isDark = newTheme === 'dark' || (newTheme === 'system' && mediaQuery.matches)
                applyThemeStyles(isDark)
                
                // For presets, we might need a page reload or a more complex sync, 
                // but theme mode is the priority here.
                if (e.key === 'theme-preset') {
                    window.location.reload()
                }
            }
        }
        window.addEventListener('storage', handleStorageChange)

        return () => {
            mediaQuery.removeEventListener('change', handleSystemChange)
            window.removeEventListener('storage', handleStorageChange)
        }
    }, [])

    return null
}
