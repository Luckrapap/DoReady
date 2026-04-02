'use client'

import { Monitor, Moon, Sun, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { isDarkModeRequested, syncNativeTheme } from '@/utils/theme'
import { useEffect, useState } from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

type Theme = 'light' | 'dark' | 'system'

export default function ThemeSwitcher() {
    const [theme, setTheme] = useState<Theme>('system')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        try {
            setTheme((localStorage.getItem('theme') as Theme) || 'system')
        } catch (e) { }

        // Sincronizar cambios desde otras pestañas
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'theme') {
                try {
                    setTheme((localStorage.getItem('theme') as Theme) || 'system')
                } catch (err) { }
            }
        }
        window.addEventListener('storage', handleStorageChange)
        return () => window.removeEventListener('storage', handleStorageChange)
    }, [])

    const applyTheme = async (newTheme: Theme) => {
        setTheme(newTheme)
        try {
            localStorage.setItem('theme', newTheme)
            // Stándarización a slate al eliminar el sistema de acentos
            localStorage.setItem('theme-preset', 'slate')

            // FORCE NATIVE SYNC IMMEDIATELY
            if (newTheme === 'system') {
                await syncNativeTheme()
            }

            // Manualmente disparar evento para respuesta inmediata de la UI
            window.dispatchEvent(Object.assign(new Event('storage'), {
                key: 'theme',
                newValue: newTheme
            }))
        } catch (e) { }
    }

    if (!mounted) return (
        <div className="space-y-6 animate-pulse">
            <div className="h-40 bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
        </div>
    )

    // Índice robusto para el slider
    const getActiveIndex = () => {
        if (theme === 'light') return 0;
        if (theme === 'dark') return 1;
        return 2; // system
    }
    const idx = getActiveIndex()

    return (
        <div className="space-y-8">
            <div className="space-y-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider px-1">
                    Apariencia del Sistema
                </h3>
                <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl md:rounded-full border border-zinc-200/50 dark:border-zinc-700/50 p-1.5 relative overflow-hidden">
                    {/* El slider infalible */}
                    <div className="absolute top-1.5 bottom-1.5 left-1.5 right-1.5 pointer-events-none">
                        <motion.div
                            className="h-full bg-white dark:bg-zinc-700 shadow-md rounded-xl md:rounded-full border border-zinc-200 dark:border-zinc-600"
                            style={{ width: "33.333333%" }}
                            animate={{ x: `${idx * 100}%` }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                    </div>

                    <div className="relative z-10 grid grid-cols-3">
                        <ThemeButton
                            active={theme === 'light'}
                            onClick={() => applyTheme('light')}
                            icon={<Sun size={18} />}
                            label="Claro"
                        />
                        <ThemeButton
                            active={theme === 'dark'}
                            onClick={() => applyTheme('dark')}
                            icon={<Moon size={18} />}
                            label="Oscuro"
                        />
                        <ThemeButton
                            active={theme === 'system'}
                            onClick={() => applyTheme('system')}
                            icon={<Monitor size={18} />}
                            label="Dispositivo"
                        />
                    </div>
                </div>
            </div>

            {/* Diagnostic indicator for troubleshooting */}
            <div className="flex flex-col items-center pt-2 opacity-20 hover:opacity-100 transition-opacity gap-1">
                <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">
                    Slate Unified Build • v2.1-LogoSquare
                </span>
                <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">
                    Sensor: {mounted ? (isDarkModeRequested() ? 'Dark' : 'Light') : '...'}
                </span>
            </div>
        </div>
    )
}

function ThemeButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex-1 relative z-10 flex items-center justify-center gap-1 sm:gap-2 py-2.5 sm:py-3 px-1 sm:px-4 transition-colors",
                active ? "text-zinc-950 dark:text-white font-bold" : "text-zinc-500 font-medium hover:text-zinc-700 dark:hover:text-zinc-300"
            )}
        >
            <AnimatePresence mode="wait">
                {active ? (
                    <motion.div key="check" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}>
                        <Check size={18} className="text-zinc-900 dark:text-zinc-50" />
                    </motion.div>
                ) : (
                    <motion.div key="icon" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}>
                        {icon}
                    </motion.div>
                )}
            </AnimatePresence>
            <span className="text-[10px] sm:text-xs md:text-sm whitespace-nowrap">{label}</span>
        </button>
    )
}
