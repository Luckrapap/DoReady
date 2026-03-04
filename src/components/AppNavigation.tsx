'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, CheckSquare, MountainSnow, User, BrainCircuit, Gamepad2, Lightbulb } from 'lucide-react'
import { cn } from '@/utils/utils'

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
    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-72 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 px-6 py-8 h-screen sticky top-0">
                <div className="flex items-center gap-4 mb-12 px-2">
                    <div className="h-10 w-10 bg-black dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-black shadow-md">
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
                                    "flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-semibold transition-all",
                                    isActive
                                        ? "bg-zinc-200/60 dark:bg-zinc-800/60 text-black dark:text-white shadow-sm"
                                        : "text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                                )}
                            >
                                <link.icon size={22} className={cn(isActive && "stroke-[2.5px]")} />
                                {link.name}
                            </Link>
                        )
                    })}

                    {/* Profile at the bottom */}
                    <div className="mt-auto pt-10">
                        <Link
                            href={profileLink.href}
                            className={cn(
                                "flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-semibold transition-all",
                                pathname === profileLink.href
                                    ? "bg-zinc-200/60 dark:bg-zinc-800/60 text-black dark:text-white shadow-sm"
                                    : "text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                            )}
                        >
                            <profileLink.icon size={22} className={cn(pathname === profileLink.href && "stroke-[2.5px]")} />
                            {profileLink.name}
                        </Link>
                    </div>
                </nav>
            </aside>

            {/* Mobile Bottom Bar */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md pb-safe z-50">
                <div className="flex justify-around items-center h-20 px-4">
                    {[...mainLinks, profileLink].map((link) => {
                        const isActive = pathname === link.href
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    "flex flex-col items-center justify-center w-full h-full gap-1.5 transition-colors",
                                    isActive ? "text-black dark:text-white" : "text-zinc-500 hover:text-black dark:hover:text-white"
                                )}
                            >
                                <link.icon size={24} className={cn(isActive && "stroke-[2.5px]")} />
                                <span className="text-[11px] font-bold uppercase tracking-wider">{link.name}</span>
                            </Link>
                        )
                    })}
                </div>
            </nav>
        </>
    )
}
