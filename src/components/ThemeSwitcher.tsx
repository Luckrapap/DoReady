'use client'

import { Monitor, Moon, Sun, Palette, Check, Sparkles, Pipette, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { isDarkModeRequested, addNativeThemeListener } from '@/utils/theme'
import { useEffect, useState } from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

type Theme = 'light' | 'dark' | 'system'
type Preset = 'slate' | 'blue' | 'purple' | 'green' | 'red' | 'orange' | 'yellow' | 'pink' | 'custom'

export default function ThemeSwitcher() {
    const [theme, setTheme] = useState<Theme>('system')
    const [preset, setPreset] = useState<Preset>('slate')
    const [mounted, setMounted] = useState(false)
    const [customHue, setCustomHue] = useState(220)
    const [showPicker, setShowPicker] = useState(false)

    // Used to force re-render on system theme changes for the status text
    const [, setTick] = useState(0)

    useEffect(() => {
        setMounted(true)
        const savedTheme = localStorage.getItem('theme') as Theme || 'system'
        const savedPreset = localStorage.getItem('theme-preset') as Preset || 'slate'
        const savedHue = Number(localStorage.getItem('theme-custom-hue')) || 220

        setTheme(savedTheme)
        setPreset(savedPreset)
        setCustomHue(savedHue)

        // Apply initial theme and preset
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const applyInitialTheme = () => {
            const isDark = isDarkModeRequested()

            const doc = document.documentElement
            doc.classList.toggle('dark', isDark)
            doc.classList.toggle('light', !isDark)
            doc.style.setProperty('color-scheme', isDark ? 'dark' : 'light')

            // Apply custom hue if needed
            if (savedPreset === 'custom') {
                doc.style.setProperty('--custom-hue', savedHue.toString())
            }

            // Apply preset class
            doc.classList.remove('theme-blue', 'theme-slate', 'theme-purple', 'theme-green', 'theme-red', 'theme-orange', 'theme-yellow', 'theme-pink', 'theme-custom')
            if (savedPreset !== 'slate') {
                doc.classList.add(`theme-${savedPreset}`)
            }

            // Force re-render for status text
            setTick(t => t + 1)
        }

        applyInitialTheme()

        // 1. Listen for system theme changes (Web API)
        const handleSystemThemeChange = () => {
            if (localStorage.getItem('theme') === 'system') {
                applyInitialTheme()
            }
        }
        mediaQuery.addEventListener('change', handleSystemThemeChange)

        // 2. Native Bridge Listener (Real-time updates in APK)
        const nativeHandlePromise = addNativeThemeListener(() => {
            if (localStorage.getItem('theme') === 'system') {
                applyInitialTheme()
            }
        })

        // Sincronizar cambios desde otras pestañas
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'theme') {
                setTheme(e.newValue as Theme || 'system')
                applyInitialTheme()
            }
            if (e.key === 'theme-preset') {
                setPreset(e.newValue as Preset || 'slate')
                applyInitialTheme()
            }
            if (e.key === 'theme-custom-hue') {
                setCustomHue(Number(e.newValue) || 220)
                applyInitialTheme()
            }
        }
        window.addEventListener('storage', handleStorageChange)

        return () => {
            mediaQuery.removeEventListener('change', handleSystemThemeChange)
            nativeHandlePromise?.then(h => h.remove())
            window.removeEventListener('storage', handleStorageChange)
        }
    }, [])

    const applyTheme = async (newTheme: Theme, newPreset: Preset, newHue?: number) => {
        const finalHue = newHue ?? customHue
        setTheme(newTheme)
        setPreset(newPreset)
        if (newHue !== undefined) setCustomHue(newHue)

        localStorage.setItem('theme', newTheme)
        localStorage.setItem('theme-preset', newPreset)
        localStorage.setItem('theme-custom-hue', finalHue.toString())

        if (newTheme === 'system') {
            const { syncNativeTheme } = await import('@/utils/theme')
            await syncNativeTheme()
        }

        const isDark = isDarkModeRequested()

        const doc = document.documentElement
        doc.classList.toggle('dark', isDark)
        doc.classList.toggle('light', !isDark)
        doc.style.setProperty('color-scheme', isDark ? 'dark' : 'light')

        // Apply custom hue if needed
        if (newPreset === 'custom') {
            doc.style.setProperty('--custom-hue', finalHue.toString())
        }

        // Apply preset class
        doc.classList.remove('theme-blue', 'theme-slate', 'theme-purple', 'theme-green', 'theme-red', 'theme-orange', 'theme-yellow', 'theme-pink', 'theme-custom')
        if (newPreset !== 'slate') {
            doc.classList.add(`theme-${newPreset}`)
        }
    }

    if (!mounted) return null

    return (
        <div className="rounded-3xl p-4 sm:p-6 shadow-sm space-y-6 sm:space-y-8 border transition-colors" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            {/* Theme Toggle */}
            <div className="flex flex-col gap-6">
                <div>
                    <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50">Modo de Visualización</h3>
                    <p className="text-xs sm:text-sm text-zinc-500">Elige la apariencia que mejor se adapte a tu entorno.</p>
                </div>

                <div className="relative flex p-1.5 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl md:rounded-full overflow-hidden border border-zinc-200/50 dark:border-zinc-700/50">
                    <motion.div
                        className="absolute inset-y-1.5 left-1.5 bg-white dark:bg-zinc-700 shadow-sm rounded-xl md:rounded-full z-0 border border-zinc-200 dark:border-zinc-600"
                        initial={false}
                        animate={{
                            x: theme === 'light' ? 0 : theme === 'dark' ? '100%' : '200%',
                            width: 'calc((100% - 0.75rem) / 3)'
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />

                    <ThemeButton
                        active={theme === 'light'}
                        onClick={() => applyTheme('light', preset)}
                        icon={<Sun size={18} />}
                        label="Claro"
                    />
                    <ThemeButton
                        active={theme === 'dark'}
                        onClick={() => applyTheme('dark', preset)}
                        icon={<Moon size={18} />}
                        label="Oscuro"
                    />
                    <ThemeButton
                        active={theme === 'system'}
                        onClick={() => {
                            console.log('DoReady Hydration v1.7 - Definitive Fix');
                            applyTheme('system', preset)
                        }}
                        icon={<Monitor size={18} />}
                        label="Dispositivo"
                    />
                </div>
            </div>

            {/* Color Presets */}
            <div className="flex flex-col gap-6 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div>
                    <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50">Color de Acentuación</h3>
                    <p className="text-xs sm:text-sm text-zinc-500">Personaliza los tonos principales de la aplicación.</p>
                </div>

                <div className="flex flex-wrap gap-4">
                    <PresetCircle
                        active={preset === 'slate'}
                        onClick={() => applyTheme(theme, 'slate')}
                        name="slate"
                    />
                    <PresetCircle
                        active={preset === 'blue'}
                        onClick={() => applyTheme(theme, 'blue')}
                        name="blue"
                    />
                    <PresetCircle
                        active={preset === 'purple'}
                        onClick={() => applyTheme(theme, 'purple')}
                        name="purple"
                    />
                    <PresetCircle
                        active={preset === 'pink'}
                        onClick={() => applyTheme(theme, 'pink')}
                        name="pink"
                    />
                    <PresetCircle
                        active={preset === 'red'}
                        onClick={() => applyTheme(theme, 'red')}
                        name="red"
                    />
                    <PresetCircle
                        active={preset === 'orange'}
                        onClick={() => applyTheme(theme, 'orange')}
                        name="orange"
                    />
                    <PresetCircle
                        active={preset === 'yellow'}
                        onClick={() => applyTheme(theme, 'yellow')}
                        name="yellow"
                    />
                    <PresetCircle
                        active={preset === 'green'}
                        onClick={() => applyTheme(theme, 'green')}
                        name="green"
                    />

                    {/* Custom Color Button */}
                    <button
                        onClick={() => setShowPicker(!showPicker)}
                        className={cn(
                            "relative p-1 rounded-3xl transition-all duration-300 hover:scale-110 active:scale-95",
                            preset === 'custom' ? "ring-2 ring-white/50 dark:ring-black/50" : ""
                        )}
                        style={preset === 'custom' ? { boxShadow: `0 0 20px hsl(${customHue}, 85%, 60%)` } : {}}
                    >
                        <div
                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-[1.2rem] sm:rounded-[1.5rem] overflow-hidden shadow-inner flex items-center justify-center border border-white/20 relative"
                            style={{ background: `linear-gradient(135deg, hsl(${customHue}, 85%, 65%), hsl(${customHue}, 85%, 45%))` }}
                        >
                            <Pipette className="text-white drop-shadow-md" size={18} />
                            {preset === 'custom' && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 bg-white text-black rounded-full p-1.5 shadow-lg border border-black/10"
                                >
                                    <Check size={12} strokeWidth={4} />
                                </motion.div>
                            )}
                        </div>
                    </button>
                </div>

                <AnimatePresence>
                    {showPicker && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-t border-zinc-100 dark:border-zinc-800"
                        >
                            <div className="pt-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">Selector de color</span>
                                    <button onClick={() => setShowPicker(false)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                                        <X size={16} className="text-zinc-400" />
                                    </button>
                                </div>
                                <div
                                    className="relative h-4 rounded-full border border-zinc-200/50 dark:border-zinc-700/50 shadow-inner"
                                    style={{ background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)' }}
                                >
                                    <input
                                        type="range"
                                        min="0"
                                        max="360"
                                        value={customHue}
                                        onChange={(e) => applyTheme(theme, 'custom', parseInt(e.target.value))}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <motion.div
                                        className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-4 border-zinc-900 pointer-events-none"
                                        animate={{ left: `${(customHue / 360) * 100}%` }}
                                        style={{ translateX: '-50%' }}
                                    />
                                </div>
                                <div className="flex justify-center">
                                    <button
                                        onClick={() => applyTheme(theme, 'custom')}
                                        className="px-4 py-2 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-xl text-xs font-bold shadow-sm hover:scale-105 active:scale-95 transition-all"
                                    >
                                        Aplicar Tono Dinámico
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            {/* Version indicator for troubleshooting */}
            <div className="flex flex-col items-center pt-2 opacity-20 hover:opacity-100 transition-opacity gap-1">
                <span className="text-[10px] font-mono text-zinc-500">v3.0-native-bridge</span>
                <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">
                    Native Sensor: {mounted ? (isDarkModeRequested() ? 'Dark Mode' : 'Light Mode') : '...'}
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

function PresetCircle({ active, onClick, name }: { active: boolean, onClick: () => void, name: Preset }) {
    const presets: Record<string, string> = {
        slate: '#64748b',
        blue: '#3b82f6',
        purple: '#a855f7',
        pink: '#ec4899',
        red: '#ef4444',
        orange: '#f97316',
        yellow: '#eab308',
        green: '#10b981'
    }

    const color = presets[name]

    return (
        <button
            onClick={onClick}
            className={cn(
                "relative p-1 rounded-3xl transition-all duration-300 hover:scale-110 active:scale-95",
                active ? "ring-2 ring-white/50 dark:ring-black/50" : ""
            )}
            style={active ? { boxShadow: `0 0 20px ${color}66` } : {}}
        >
            <div
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-[1.2rem] sm:rounded-[1.5rem] overflow-hidden shadow-inner border border-white/20 flex items-center justify-center transition-transform duration-500"
                style={{ background: `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color}, black 20%))` }}
            >
                {active && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white/20 backdrop-blur-sm rounded-full p-2 border border-white/30"
                    >
                        <Check size={20} className="text-white drop-shadow-md" strokeWidth={3} />
                    </motion.div>
                )}
            </div>
        </button>
    )
}
