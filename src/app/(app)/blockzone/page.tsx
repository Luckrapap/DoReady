'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, ArrowRight, ArrowLeft, ExternalLink, Activity, Lock } from 'lucide-react'
import { cn } from '@/utils/utils'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { Capacitor, registerPlugin } from '@capacitor/core'

interface BlockerPlugin {
    checkStatus(): Promise<{ enabled: boolean; blockingActive: boolean }>;
    openAccessibilitySettings(): Promise<void>;
    openAppSettings(): Promise<void>;
    setBlockingEnabled(options: { enabled: boolean }): Promise<void>;
    ping(): Promise<{ value: string }>;
}

const Blocker = registerPlugin<BlockerPlugin>('DoReadyBlocker')

export default function BlockZonePage() {
    const [isServiceEnabled, setIsServiceEnabled] = useState<boolean | null>(null)
    const [isBlockingActive, setIsBlockingActive] = useState(true)
    const [currentView, setCurrentView] = useState<'main' | 'social'>('main')

    const checkStatus = useCallback(async () => {
        if (Capacitor.getPlatform() !== 'android') {
            setIsServiceEnabled(false)
            setIsBlockingActive(true)
            return
        }

        try {
            const bypass = (window as any).DoReadyNative
            if (bypass) {
                const enabled = bypass.checkAccessibility()
                setIsServiceEnabled(enabled)
                setIsBlockingActive(true) 
                return
            }

            await new Promise(resolve => setTimeout(resolve, 800))
            const cap = (window as any).Capacitor
            let impl = Blocker || cap?.Plugins?.DoReadyBlocker

            if (!impl || typeof impl.checkStatus !== 'function') {
                setIsServiceEnabled(false)
                return
            }
            
            const { enabled, blockingActive } = await impl.checkStatus()
            setIsServiceEnabled(enabled)
            setIsBlockingActive(blockingActive)
        } catch (e: any) {
            setIsServiceEnabled(false)
        }
    }, [])

    useEffect(() => {
        checkStatus()
        window.addEventListener('focus', checkStatus)
        return () => window.removeEventListener('focus', checkStatus)
    }, [checkStatus])

    const toggleBlocking = async () => {
        const bypass = (window as any).DoReadyNative
        if (bypass) {
            triggerHaptic()
            const nextState = !isBlockingActive
            bypass.setBlockingEnabled(nextState)
            setIsBlockingActive(nextState)
            return
        }
    }

    const openAccessibility = async () => {
        const bypass = (window as any).DoReadyNative
        if (bypass) {
            triggerHaptic()
            bypass.openAccessibility()
            return
        }
    }

    const openAppInfo = async () => {
        const bypass = (window as any).DoReadyNative
        if (bypass) {
            triggerHaptic()
            bypass.openAppSettings()
            return
        }
    }

    const triggerHaptic = () => {
        Haptics.impact({ style: ImpactStyle.Medium }).catch(() => { })
    }

    return (
        <div className="flex flex-col h-[100dvh] overflow-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 px-5 pt-safe-top pb-6 relative">
            <AnimatePresence mode="wait">
                {currentView === 'main' ? (
                    <motion.div 
                        key="main-view"
                        initial={{ opacity: 1, x: 0 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-1 flex flex-col pt-8"
                    >
                        {/* Title and Integrated Subtitle (Flow-based for zero jump) */}
                        <div className="shrink-0 mb-6 flex flex-col items-center w-full">
                            <h1 className="font-bold text-6xl md:text-8xl tracking-tighter text-zinc-900 dark:text-zinc-50 whitespace-nowrap">
                                BlockZone
                            </h1>
                            <div className="mt-2 flex justify-center px-8">
                                <p className="text-2xl md:text-4xl font-bold tracking-tight text-zinc-400 dark:text-zinc-300/80 text-center leading-tight">
                                    Bloquea distracciones <br className="hidden sm:block" /> innecesarias.
                                </p>
                            </div>
                        </div>

                        {/* Content block nudged up by 16px (slightly down from previous 24px) */}
                        <div className="mt-auto flex flex-col gap-6 pb-2 -translate-y-4">
                            {/* Status Section */}
                            <div className="shrink-0 w-full flex flex-col justify-start">
                                <h2 className="text-lg font-medium text-zinc-500 dark:text-zinc-400 mb-1">Estado:</h2>
                                <div className="flex items-center gap-4 mt-3">
                                    <span className={cn(
                                        "text-5xl sm:text-6xl font-black tracking-tight",
                                        isServiceEnabled ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'
                                    )}>
                                        {isServiceEnabled ? 'Activado' : 'Desactivado'}
                                    </span>
                                    <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                                        <motion.div 
                                            initial={false}
                                            animate={{ 
                                                backgroundColor: isServiceEnabled ? '#10b981' : '#ef4444',
                                                boxShadow: isServiceEnabled ? '0 0 16px rgba(16,185,129,0.4)' : '0 0 16px rgba(239,68,68,0.4)'
                                            }}
                                            className="w-6 h-6 rounded-full"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Pasos Section */}
                            <div className="shrink-0 -mt-2">
                                <h2 className="text-lg font-medium text-zinc-500 dark:text-zinc-400 mb-3">Pasos:</h2>
                                
                                <div className="space-y-4">
                                    {/* Step 1 */}
                                    <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col gap-3">
                                        <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-zinc-700 dark:text-zinc-300">
                                            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-zinc-200 dark:bg-zinc-800 text-xs mr-1 text-zinc-900 dark:text-zinc-100">1</div>
                                            <span>Ajustes</span>
                                            <ArrowRight size={14} className="text-zinc-400" />
                                            <span>Permitir ajustes limitados</span>
                                        </div>
                                        <button 
                                            onClick={openAppInfo}
                                            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm font-bold transition-transform active:scale-95 border border-zinc-200 dark:border-zinc-700"
                                        >
                                            <Settings size={16} />
                                            Ver Configuración de la app
                                        </button>
                                    </div>

                                    {/* Step 2 */}
                                    <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col gap-3">
                                        <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-zinc-700 dark:text-zinc-300">
                                            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-zinc-200 dark:bg-zinc-800 text-xs mr-1 text-zinc-900 dark:text-zinc-100">2</div>
                                            <span>Accesibilidad</span>
                                            <ArrowRight size={14} className="text-zinc-400" />
                                            <span>Activar DoReadyBlocker</span>
                                        </div>
                                        <button 
                                            onClick={openAccessibility}
                                            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-bold transition-transform active:scale-95 shadow-lg shadow-zinc-900/10 dark:shadow-white/10"
                                        >
                                            <ExternalLink size={16} />
                                            Activar Accesibilidad
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Blocks Section */}
                            <div className="shrink-0 pt-0 pb-2">
                                <h2 className="text-lg font-medium text-zinc-500 dark:text-zinc-400 mb-3">Blocks:</h2>
                                
                                <div className="space-y-3">
                                    <button 
                                        onClick={() => setCurrentView('social')}
                                        className="w-full flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-transform active:scale-95"
                                    >
                                        <span className="text-lg font-bold text-zinc-900 dark:text-white">Redes sociales</span>
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-zinc-300 dark:border-zinc-700">
                                            <ArrowRight size={16} className="text-zinc-500 dark:text-zinc-400" />
                                        </div>
                                    </button>

                                    <button 
                                        className="w-full flex items-center justify-between p-5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 opacity-50 pointer-events-none"
                                    >
                                        <span className="text-lg font-bold text-zinc-700 dark:text-white">Páginas de adultos</span>
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-zinc-300 dark:border-zinc-700">
                                            <ArrowRight size={16} className="text-white dark:text-zinc-500" />
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>

                    </motion.div>
                ) : (
                    <motion.div 
                        key="social-view"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex-1 flex flex-col pt-8"
                    >
                        {/* Redes Sociales Header */}
                        <div className="flex items-center mb-8 shrink-0 relative">
                            <button 
                                onClick={() => setCurrentView('main')}
                                className="w-12 h-12 flex items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 transition-transform active:scale-90 absolute left-0"
                            >
                                <ArrowLeft size={20} className="text-zinc-700 dark:text-zinc-300" />
                            </button>
                            <h1 className="font-bold text-4xl md:text-5xl tracking-tighter text-center w-full text-zinc-900 dark:text-white">
                                Redes sociales
                            </h1>
                        </div>

                        {/* Social Blocks Toggles */}
                        <div className="flex-1 space-y-4 mt-6">
                            <div className="flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
                                        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-red-600" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 4-8 4z"/>
                                        </svg>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-lg text-zinc-900 dark:text-zinc-100">YouTube Shorts</span>
                                        <span className="text-xs text-zinc-500 mt-1">Bloqueo agresivo</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={toggleBlocking}
                                    className={cn(
                                        "w-14 h-8 rounded-full flex items-center px-1 transition-all duration-300",
                                        isBlockingActive ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-200 dark:bg-zinc-800"
                                    )}
                                >
                                    <motion.div 
                                        layout
                                        animate={{ x: isBlockingActive ? 24 : 0 }}
                                        className="w-6 h-6 rounded-full bg-white dark:bg-zinc-900 shadow-sm"
                                    />
                                </button>
                            </div>
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
