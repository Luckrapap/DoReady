'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Gamepad2, ArrowRight } from 'lucide-react'
import { cn } from '@/utils/utils'
import RecallGameMode from './RecallGameMode'

interface RecallInterfaceProps {
    onBack?: () => void
}

export default function RecallInterface({ onBack }: RecallInterfaceProps) {
    const [activeMode, setActiveMode] = useState<'classic' | 'chill' | 'expert' | 'extreme' | null>(null)

    const renderHeaderContent = (subtitle: string) => (
        <div className="flex items-center gap-4">
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[var(--accent)] to-green-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all border border-white/20"
                    style={{ backgroundColor: 'var(--accent)', color: 'var(--surface)' }}
                >
                    <Gamepad2 size={24} strokeWidth={2.5} />
                </div>
            </div>
            <div className="flex flex-col items-start justify-center">
                <h2 className="text-2xl font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-600 dark:from-zinc-50 dark:via-zinc-200 dark:to-zinc-400">
                    Recall
                </h2>
                <div className="flex items-center gap-2 mt-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse"></div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 leading-none">
                        {subtitle}
                    </p>
                </div>
            </div>
        </div>
    )

    if (activeMode) {
        return <RecallGameMode mode={activeMode} onBack={() => setActiveMode(null)} />
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key="mode-selector"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-2xl mx-auto h-full flex flex-col pt-4 md:pt-2"
            >
            <div className="flex items-center justify-between mb-8 px-4 relative shrink-0">
                <div className="flex items-center gap-4">
                    <motion.button
                        onClick={onBack}
                        whileHover={{ scale: 1.1, x: -2 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300"
                        style={{
                            backgroundColor: 'color-mix(in srgb, var(--surface) 80%, transparent)',
                            borderColor: 'var(--border)',
                            color: 'var(--accent)',
                            backdropFilter: 'blur(8px)'
                        }}
                    >
                        <ChevronLeft size={24} strokeWidth={2.5} />
                    </motion.button>
                    {renderHeaderContent("Selecciona un modo")}
                </div>
            </div>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0 },
                    visible: {
                        opacity: 1,
                        transition: {
                            staggerChildren: 0.12,
                            delayChildren: 0.2
                        }
                    }
                }}
                className="flex-1 flex flex-col justify-center px-4 gap-3 pb-8"
            >
                <ModeCard
                    title="Chill"
                    icon="🌿"
                    description="Para cuando quieres practicar de manera relajada."
                    onClick={() => setActiveMode('chill')}
                    colorTheme="green"
                />
                <ModeCard
                    title="Clásico"
                    icon="🎲"
                    description="El modo de juego original, equilibrado y divertido."
                    onClick={() => setActiveMode('classic')}
                    colorTheme="orange"
                />
                <ModeCard
                    title="Experto"
                    icon="🧠"
                    description="Un desafío para los más experimentados."
                    onClick={() => setActiveMode('expert')}
                    colorTheme="purple"
                />
                <ModeCard
                    title="Extremo"
                    icon="🔥"
                    description="El desafío definitivo. Sin margen de error."
                    onClick={() => setActiveMode('extreme')}
                    colorTheme="red"
                />
            </motion.div>
        </motion.div>
        </AnimatePresence>
    )
}

function ModeCard({ title, icon, description, onClick, colorTheme }: {
    title: string,
    icon: React.ReactNode | string,
    description: string,
    onClick: () => void,
    colorTheme: 'green' | 'purple' | 'orange' | 'blue' | 'red'
}) {
    const themeColors = {
        green: { 
            bg: 'bg-emerald-50 dark:bg-emerald-500/10 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20', 
            border: 'border-emerald-200 dark:border-emerald-500/30 group-hover:border-emerald-400 dark:group-hover:border-emerald-500/60', 
            glow: 'shadow-sm group-hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.4)]', 
            textMap: 'from-emerald-300 to-emerald-800', 
            hoverArrow: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white',
            blob: 'bg-emerald-500/20'
        },
        orange: { 
            bg: 'bg-orange-50 dark:bg-orange-500/10 group-hover:bg-orange-100 dark:group-hover:bg-orange-500/20', 
            border: 'border-orange-200 dark:border-orange-500/30 group-hover:border-orange-400 dark:group-hover:border-orange-500/60', 
            glow: 'shadow-sm group-hover:shadow-[0_0_40px_-10px_rgba(249,115,22,0.4)]', 
            textMap: 'from-amber-400 to-red-600', 
            hoverArrow: 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 group-hover:bg-orange-500 group-hover:text-white',
            blob: 'bg-orange-500/20'
        },
        purple: { 
            bg: 'bg-purple-50 dark:bg-purple-500/10 group-hover:bg-purple-100 dark:group-hover:bg-purple-500/20', 
            border: 'border-purple-200 dark:border-purple-500/30 group-hover:border-purple-400 dark:group-hover:border-purple-500/60', 
            glow: 'shadow-sm group-hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.4)]', 
            textMap: 'from-purple-400 via-purple-500 to-purple-700', 
            hoverArrow: 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 group-hover:bg-purple-500 group-hover:text-white',
            blob: 'bg-purple-500/20'
        },
        blue: { 
            bg: 'bg-blue-50 dark:bg-blue-500/10 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20', 
            border: 'border-blue-200 dark:border-blue-500/30 group-hover:border-blue-400 dark:group-hover:border-blue-500/60', 
            glow: 'shadow-sm group-hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.4)]', 
            textMap: 'from-sky-400 via-blue-500 to-blue-700', 
            hoverArrow: 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500 group-hover:text-white',
            blob: 'bg-blue-500/20'
        },
        red: { 
            bg: 'bg-rose-50 dark:bg-rose-500/10 group-hover:bg-rose-100 dark:group-hover:bg-rose-500/20', 
            border: 'border-rose-200 dark:border-rose-500/30 group-hover:border-rose-400 dark:group-hover:border-rose-500/60', 
            glow: 'shadow-sm group-hover:shadow-[0_0_40px_-10px_rgba(225,29,72,0.4)]', 
            textMap: 'from-rose-500 via-red-500 to-red-600', 
            hoverArrow: 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 group-hover:bg-rose-500 group-hover:text-white',
            blob: 'bg-rose-500/20'
        }
    };

    const theme = themeColors[colorTheme];

    return (
        <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={cn(
                "relative group w-full text-left p-6 transition-all duration-500",
                "rounded-[2.5rem] border-2 overflow-hidden",
                theme.bg,
                theme.border,
                theme.glow
            )}
        >
            {/* Ambient Background Blob natively present */}
            <div className={cn(
                "absolute -left-8 -top-8 w-32 h-32 rounded-full blur-[40px] opacity-50 dark:opacity-40 transition-all duration-700 group-hover:scale-150 group-hover:opacity-70",
                theme.blob
            )} />

            <div className="relative z-10 flex items-center gap-5">
                {/* Free Floating Icon without square */}
                <div className="w-16 h-16 shrink-0 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12 group-hover:-translate-y-1.5">
                    <span className="text-[48px] drop-shadow-xl saturate-150">
                        {icon}
                    </span>
                </div>

                {/* Text Content */}
                <div className="flex-1 space-y-1.5">
                    <h3 className={cn(
                        "text-xl md:text-[24px] font-black tracking-tight",
                        "bg-clip-text text-transparent bg-gradient-to-r",
                        theme.textMap
                    )}
                    >
                        {title}
                    </h3>
                    <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 max-w-[95%] leading-snug tracking-tight">
                        {description}
                    </p>
                </div>

                {/* Arrow Action Container */}
                <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 shrink-0",
                    theme.hoverArrow
                )}>
                    <ArrowRight size={22} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform duration-300" />
                </div>
            </div>
        </motion.button>
    )
}
