'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, CheckSquare, MountainSnow, User, BrainCircuit, Gamepad2, Lightbulb, Settings } from 'lucide-react'
import { cn } from '@/utils/utils'
import { motion } from 'framer-motion'

export default function AppNavigation() {
    const pathname = usePathname()

    const mainLinks = [
        { name: 'Today', href: '/today', icon: CheckSquare },
        { name: 'Calendar', href: '/calendar', icon: CalendarDays },
        { name: 'CheckDay', href: '/check-day', icon: MountainSnow },
        { name: 'Insights', href: '/insights', icon: BrainCircuit },
        { name: 'Brain Dump', href: '/brain-dump', icon: Lightbulb },
        { name: 'ProcasTive', href: '/procastive', icon: Gamepad2 },
    ]

    const profileLink = { name: 'Profile', href: '/profile', icon: User }
    const settingsLink = { name: 'Configuration', href: '/settings', icon: Settings }

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className="hidden md:flex flex-col w-72 border-r px-6 py-8 h-screen sticky top-0 transition-colors duration-500"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
                <div className="flex items-center gap-4 mb-12 px-2">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-md" style={{ backgroundColor: 'var(--accent)' }}>
                        <MountainSnow size={24} />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-zinc-900 dark:text-zinc-50">DoReady</span>
                </div>

                <nav className="flex flex-col gap-2 flex-1">
                    {mainLinks.map((link) => {
                        const isActive = pathname === link.href
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-semibold transition-all relative group",
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
                                        className="absolute left-0 w-1 h-6 rounded-r-full"
                                        style={{ backgroundColor: 'var(--accent)' }}
                                    />
                                )}
                            </Link>
                        )
                    })}

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
                                            className="absolute left-0 w-1 h-6 rounded-r-full"
                                            style={{ backgroundColor: 'var(--accent)' }}
                                        />
                                    )}
                                </Link>
                            )
                        })}
                    </div>
                </nav>
            </aside>

            {/* Mobile Bottom Bar */}
            <nav
                className="md:hidden fixed bottom-0 left-0 right-0 border-t backdrop-blur-md pb-safe z-50 transition-colors duration-500"
                style={{ backgroundColor: 'color-mix(in srgb, var(--surface) 80%, transparent)', borderColor: 'var(--border)' }}
            >
                <div className="flex justify-start md:justify-center items-center h-20 px-4 gap-2 overflow-x-auto no-scrollbar touch-pan-x">
                    {[...mainLinks, settingsLink, profileLink].map((link) => {
                        const isActive = pathname === link.href
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    "flex flex-col items-center justify-center min-w-[72px] h-full gap-1.5 transition-all relative shrink-0",
                                    isActive ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                                )}
                            >
                                <div className="p-2 rounded-xl transition-all duration-300"
                                    style={isActive ? { backgroundColor: 'color-mix(in srgb, var(--accent) 15%, transparent)' } : {}}
                                >
                                    <link.icon size={22} className={cn(isActive && "stroke-[2.5px]")} />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider">{link.name}</span>
                            </Link>
                        )
                    })}
                </div>
            </nav>
        </>
    )
}
