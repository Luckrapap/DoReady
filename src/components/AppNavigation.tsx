'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, CheckSquare, MountainSnow, User, BrainCircuit, Gamepad2, Lightbulb, Settings, Orbit, ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/utils/utils'
import { motion, AnimatePresence } from 'framer-motion'
import Logo from './Logo'

export default function AppNavigation() {
    const pathname = usePathname()
    const [startIndex, setStartIndex] = useState(0)
    const MAX_VISIBLE = 6

    const mainLinks = [
        { name: 'Hoy', href: '/today', icon: CheckSquare },
        { name: 'Calendario', href: '/calendar', icon: CalendarDays },
        { name: 'CheckDay', href: '/check-day', icon: MountainSnow },
        { name: 'Análisis', href: '/insights', icon: BrainCircuit },
        { name: 'Tablero de Ideas', href: '/brain-dump', icon: Lightbulb },
        { name: 'ProcasTive', href: '/procastive', icon: Gamepad2 },
        { name: 'Órbita de Hábitos', href: '/habits', icon: Orbit },
    ]

    const profileLink = { name: 'Perfil', href: '/profile', icon: User }
    const settingsLink = { name: 'Configuración', href: '/settings', icon: Settings }

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className="hidden md:flex flex-col w-72 border-r px-6 py-8 h-screen sticky top-0"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
                <div className="flex items-center gap-1 mb-10 px-2">
                    <Logo size={36} style={{ color: 'var(--accent)' }} />
                    <span className="font-bold text-4xl tracking-tight" style={{ color: 'var(--accent)' }}>DoReady</span>
                </div>

                <nav className="flex flex-col gap-2 flex-1 relative overflow-visible">
                    <button 
                        onClick={() => setStartIndex(prev => Math.max(0, prev - 1))}
                        className={cn(
                            "flex justify-center items-center py-2 transition-all z-10",
                            startIndex > 0 
                                ? "opacity-100 text-[var(--accent)] hover:scale-125 pointer-events-auto" 
                                : "opacity-0 pointer-events-none"
                        )}
                    >
                        <ChevronUp size={32} style={{ filter: 'drop-shadow(0 0 8px var(--accent))' }} />
                    </button>

                    <div className="relative overflow-hidden" style={{ height: 352 }}>
                        <motion.div 
                            className="flex flex-col gap-2"
                            initial={false}
                            animate={{ y: startIndex * -60 }}
                            transition={{ type: "tween", ease: "linear", duration: 0.3 }}
                        >
                            {mainLinks.map((link) => {
                                const isActive = pathname === link.href
                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className={cn(
                                            "flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-semibold transition-all relative group shrink-0",
                                            isActive
                                                ? "text-zinc-900 dark:text-zinc-50"
                                                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                                        )}
                                        style={isActive ? { backgroundColor: 'color-mix(in srgb, var(--accent) 15%, transparent)' } : {}}
                                    >
                                        <link.icon size={22} className={cn(isActive && "stroke-[2.5px]")} />
                                        {link.name}
                                        {isActive && (
                                            <motion.div
                                                layoutId="nav-active-desktop"
                                                className="absolute left-0 w-1.5 h-8 rounded-r-full shadow-[0_0_10px_var(--accent)]"
                                                style={{ backgroundColor: 'var(--accent)' }}
                                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                    </Link>
                                )
                            })}
                        </motion.div>
                    </div>

                    <button 
                        onClick={() => setStartIndex(prev => Math.min(mainLinks.length - MAX_VISIBLE, prev + 1))}
                        className={cn(
                            "flex justify-center items-center py-2 transition-all z-10",
                            startIndex + MAX_VISIBLE < mainLinks.length 
                                ? "opacity-100 text-[var(--accent)] hover:scale-125 pointer-events-auto" 
                                : "opacity-0 pointer-events-none"
                        )}
                    >
                        <ChevronDown size={32} style={{ filter: 'drop-shadow(0 0 8px var(--accent))' }} />
                    </button>

                    {/* Settings & Profile at the bottom */}
                    <div className="mt-auto pt-6 flex flex-col gap-2">
                        {[settingsLink, profileLink].map((link) => {
                            const isActive = pathname === link.href
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={cn(
                                        "flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-semibold transition-all relative group",
                                        isActive
                                            ? "text-zinc-900 dark:text-zinc-50 font-bold"
                                            : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                                    )}
                                    style={isActive ? { backgroundColor: 'color-mix(in srgb, var(--accent) 15%, transparent)' } : {}}
                                >
                                    <link.icon size={22} className={cn(isActive && "stroke-[2.5px]")} />
                                    {link.name}
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-active-desktop-bottom"
                                            className="absolute left-0 w-1.5 h-8 rounded-r-full shadow-[0_0_10px_var(--accent)]"
                                            style={{ backgroundColor: 'var(--accent)' }}
                                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </Link>
                            )
                        })}
                    </div>
                </nav>
            </aside>

            {/* Mobile Bottom Floating Dock */}
            <div className="md:hidden w-full shrink-0 z-50 px-3 pb-4 pt-1 transition-colors duration-500 bg-transparent">
                <nav
                    className="flex justify-start items-center h-[68px] px-2 gap-1.5 overflow-x-auto no-scrollbar touch-pan-x rounded-[24px] border backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]"
                    style={{ 
                        backgroundColor: 'color-mix(in srgb, var(--surface) 80%, transparent)', 
                        borderColor: 'color-mix(in srgb, var(--border) 60%, transparent)'
                    }}
                >
                    {[...mainLinks, settingsLink, profileLink].map((link) => {
                        const isActive = pathname === link.href
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    "flex items-center justify-center min-w-[60px] h-full transition-all relative shrink-0 group",
                                    isActive ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                                )}
                            >
                                <div className={cn(
                                    "flex items-center justify-center w-[50px] h-[50px] rounded-full transition-all duration-300 group-hover:scale-105 group-active:scale-95",
                                    isActive && "bg-[color-mix(in_srgb,var(--accent)_12%,transparent)]"
                                )}>
                                    <link.icon 
                                        size={26} 
                                        className={cn(
                                            "transition-all duration-300", 
                                            isActive && "stroke-[2.5px] scale-110",
                                            !isActive && "group-hover:-translate-y-0.5"
                                        )} 
                                    />
                                </div>
                            </Link>
                        )
                    })}
                </nav>
            </div>
        </>
    )
}
