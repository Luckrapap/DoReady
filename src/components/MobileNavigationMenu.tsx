'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, CheckSquare, MountainSnow, User, BrainCircuit, Gamepad2, Lightbulb, Settings, Orbit } from 'lucide-react'
import { cn } from '@/utils/utils'
import { motion } from 'framer-motion'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import Logo from './Logo'

export default function MobileNavigationMenu() {
    const pathname = usePathname()

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

    const triggerHaptic = () => {
        Haptics.impact({ style: ImpactStyle.Light }).catch(() => { })
    }

    return (
        <div className="flex flex-col pt-safe-top pb-safe-bottom h-[100dvh] w-full px-2">
            <div className="flex items-center justify-between gap-1 mt-12 mb-12 px-6">
                <div className="flex items-center gap-4">
                    <Logo size={36} />
                    <span className="font-bold text-4xl tracking-tighter text-zinc-900 dark:text-white focus:outline-none">DoReady</span>
                </div>
            </div>

            <nav className="flex flex-col gap-2 flex-1 overflow-y-auto no-scrollbar px-3 pb-8">
                {mainLinks.map((link) => {
                    const isActive = pathname === link.href
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            onClick={() => {
                                triggerHaptic();
                                window.dispatchEvent(new Event('close-mobile-drawer'));
                                window.dispatchEvent(new Event('navigation-start'));
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
                    )
                })}

                {/* Mobile Settings & Profile anchored at bottom */}
                <div className="mt-auto flex flex-col gap-3 pt-6 border-t border-zinc-200 dark:border-white/5">
                    {[settingsLink, profileLink].map((link) => {
                        const isActive = pathname === link.href
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => {
                                    triggerHaptic();
                                    window.dispatchEvent(new Event('close-mobile-drawer'));
                                    window.dispatchEvent(new Event('navigation-start'));
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
                        )
                    })}
                </div>
            </nav>
        </div>
    )
}
