'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, CheckSquare, MountainSnow, User, BrainCircuit, Gamepad2, Lightbulb, Settings, Orbit, Lock, Folder } from 'lucide-react'
import { cn } from '@/utils/utils'
import { motion } from 'framer-motion'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import Logo from './Logo'

export default function MobileNavigationMenu() {
    const pathname = usePathname()
    const [layout, setLayout] = useState<'grid' | 'linear'>('grid')

    useEffect(() => {
        const savedLayout = localStorage.getItem('nav-layout') as 'grid' | 'linear'
        if (savedLayout) setLayout(savedLayout)

        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'nav-layout') {
                setLayout((e.newValue as 'grid' | 'linear') || 'grid')
            }
        }
        window.addEventListener('storage', handleStorage)
        return () => window.removeEventListener('storage', handleStorage)
    }, [])

    const mainLinks = [
        { name: 'Hoy', href: '/today', icon: CheckSquare, color: 'from-blue-500 to-cyan-400', glow: 'shadow-blue-500/20' },
        { name: 'Calendario', href: '/calendar', icon: CalendarDays, color: 'from-purple-500 to-indigo-400', glow: 'shadow-purple-500/20' },
        { name: 'CheckDay', href: '/check-day', icon: MountainSnow, color: 'from-amber-500 to-orange-400', glow: 'shadow-amber-500/20' },
        { name: 'Análisis', href: '/insights', icon: BrainCircuit, color: 'from-indigo-600 to-violet-500', glow: 'shadow-indigo-500/20' },
        { name: 'NoteBox', href: '/brain-dump', icon: Folder, color: 'from-yellow-400 to-amber-300', glow: 'shadow-yellow-500/20' },
        { name: 'ProcasTive', href: '/procastive', icon: Gamepad2, color: 'from-rose-500 to-pink-400', glow: 'shadow-rose-500/20' },
        { name: 'HabitOrbit', href: '/habits', icon: Orbit, color: 'from-cyan-500 to-blue-400', glow: 'shadow-cyan-500/20' },
        { name: 'BlockZone', href: '/blockzone', icon: Lock, color: 'from-red-600 to-rose-600', glow: 'shadow-red-500/20' },
    ]

    const secondaryLinks = [
        { name: 'Configuración', href: '/settings', icon: Settings },
        { name: 'Perfil', href: '/profile', icon: User },
    ]

    const triggerHaptic = () => {
        Haptics.impact({ style: ImpactStyle.Light }).catch(() => { })
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } }
    }

    return (
        <div className="flex flex-col pt-safe-top pb-safe-bottom h-[100dvh] w-full px-4 overflow-hidden">
            <div className="flex items-center justify-between gap-1 mt-6 mb-10 px-4">
                <div className="flex items-center gap-4">
                    <Logo size={40} className="-ml-6 -mr-10 -translate-y-2" />
                    <span className="font-bold text-4xl tracking-tighter text-zinc-900 dark:text-white">DoReady</span>
                </div>
            </div>

            <motion.nav 
                key={layout}
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className={cn(
                    "flex-1 overflow-y-auto no-scrollbar pb-10",
                    layout === 'grid' ? "grid grid-cols-2 gap-4" : "flex flex-col gap-2 px-2"
                )}
            >
                {mainLinks.map((link, index) => {
                    const isActive = pathname === link.href
                    
                    const commonContent = (
                        <Link
                            href={link.href}
                            onClick={() => {
                                triggerHaptic();
                                window.dispatchEvent(new Event('close-mobile-drawer'));
                                if (pathname !== link.href) {
                                    window.dispatchEvent(new Event('navigation-start'));
                                }
                            }}
                            className={cn(
                                "relative flex flex-col items-center justify-center p-6 rounded-[2.5rem] border-[3.5px] transition-all duration-300 h-[160px] group overflow-hidden",
                                isActive
                                    ? "border-[var(--accent)] bg-[var(--surface-hover)] shadow-xl"
                                    : "border-zinc-200/80 dark:border-zinc-800/80 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm"
                            )}
                        >
                            {/* Background Glow */}
                            <div className={cn(
                                "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br",
                                link.color
                            )} />
                            
                            <div className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-110 shadow-lg",
                                "bg-gradient-to-br",
                                link.color,
                                link.glow
                            )}>
                                <link.icon size={28} className="text-white stroke-[2.5px]" />
                            </div>
                            
                            <span className={cn(
                                "text-[15px] font-bold tracking-tight text-center transition-colors duration-300",
                                isActive ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-600 dark:text-zinc-400"
                            )}>
                                {link.name}
                            </span>

                            {isActive && (
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute bottom-4 w-1.5 h-1.5 rounded-full bg-[var(--accent)]"
                                />
                            )}
                        </Link>
                    )

                    if (layout === 'linear') {
                        return (
                            <motion.div 
                                key={link.name}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.03 }}
                            >
                                <Link
                                    href={link.href}
                                    onClick={() => {
                                        triggerHaptic();
                                        window.dispatchEvent(new Event('close-mobile-drawer'));
                                        if (pathname !== link.href) {
                                            window.dispatchEvent(new Event('navigation-start'));
                                        }
                                    }}
                                    className={cn(
                                        "flex items-center gap-5 px-5 py-4.5 rounded-2xl text-[20px] font-semibold transition-all relative",
                                        isActive
                                            ? "text-[var(--primary)] bg-[var(--surface-hover)]"
                                            : "text-[var(--secondary)] hover:text-[var(--primary)] hover:bg-[var(--surface-hover)]/50"
                                    )}
                                >
                                    <link.icon size={28} className={cn(isActive && "stroke-[2.5px]", !isActive && "opacity-80")} />
                                    {link.name}
                                </Link>
                            </motion.div>
                        )
                    }

                    return (
                        <motion.div 
                            key={link.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ 
                                type: 'spring', 
                                stiffness: 300, 
                                damping: 25,
                                delay: index * 0.05 
                            }}
                        >
                            {commonContent}
                        </motion.div>
                    )
                })}

                {/* Bottom secondary links */}
                <div className={cn(
                    "mt-4",
                    layout === 'grid' ? "col-span-2 grid grid-cols-2 gap-4" : "flex flex-col gap-2 px-2"
                )}>
                    {secondaryLinks.map((link, index) => {
                        const isActive = pathname === link.href
                        
                        if (layout === 'linear') {
                            return (
                                <motion.div 
                                    key={link.name}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: (mainLinks.length + index) * 0.03 }}
                                >
                                    <Link
                                        href={link.href}
                                        onClick={() => {
                                            triggerHaptic();
                                            window.dispatchEvent(new Event('close-mobile-drawer'));
                                            if (pathname !== link.href) {
                                                window.dispatchEvent(new Event('navigation-start'));
                                            }
                                        }}
                                        className={cn(
                                            "flex items-center gap-5 px-5 py-4.5 rounded-2xl text-[20px] font-semibold transition-all relative",
                                            isActive
                                            ? "text-[var(--primary)] font-bold bg-[var(--surface-hover)]"
                                            : "text-[var(--secondary)] hover:text-[var(--primary)] hover:bg-[var(--surface-hover)]/50"
                                        )}
                                    >
                                        <link.icon size={28} className={cn(isActive && "stroke-[2.5px]", !isActive && "opacity-80")} />
                                        {link.name}
                                    </Link>
                                </motion.div>
                            )
                        }

                        return (
                            <motion.div 
                                key={link.name}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: (mainLinks.length + index) * 0.05 }}
                            >
                                <Link
                                    href={link.href}
                                    onClick={() => {
                                        triggerHaptic();
                                        window.dispatchEvent(new Event('close-mobile-drawer'));
                                        if (pathname !== link.href) {
                                            window.dispatchEvent(new Event('navigation-start'));
                                        }
                                    }}
                                    className={cn(
                                        "flex items-center gap-3 px-6 py-4 rounded-3xl border-2 transition-all h-[64px]",
                                        isActive
                                            ? "border-[var(--accent)] bg-[var(--surface-hover)] shadow-md"
                                            : "border-zinc-200/80 dark:border-zinc-800/80 bg-white/20 dark:bg-zinc-900/20"
                                    )}
                                >
                                    <link.icon size={20} className={cn(isActive ? "text-[var(--accent)]" : "text-zinc-400")} />
                                    <span className={cn(
                                        "text-sm font-bold",
                                        isActive ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-500"
                                    )}>
                                        {link.name}
                                    </span>
                                </Link>
                            </motion.div>
                        )
                    })}
                </div>
            </motion.nav>
        </div>
    )
}
