'use client'

import { LayoutGrid, List, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export type NavLayout = 'grid' | 'linear'

export default function LayoutSwitcher() {
    const [layout, setLayout] = useState<NavLayout>('grid')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        try {
            setLayout((localStorage.getItem('nav-layout') as NavLayout) || 'grid')
        } catch (e) { }

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'nav-layout') {
                try {
                    setLayout((localStorage.getItem('nav-layout') as NavLayout) || 'grid')
                } catch (err) { }
            }
        }
        window.addEventListener('storage', handleStorageChange)
        return () => window.removeEventListener('storage', handleStorageChange)
    }, [])

    const applyLayout = (newLayout: NavLayout) => {
        setLayout(newLayout)
        try {
            localStorage.setItem('nav-layout', newLayout)
            window.dispatchEvent(Object.assign(new Event('storage'), {
                key: 'nav-layout',
                newValue: newLayout
            }))
        } catch (e) { }
    }

    if (!mounted) return null

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider px-1">
                Diseño de Menú
            </h3>
            <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl md:rounded-full border border-zinc-200/50 dark:border-zinc-700/50 p-1.5 relative overflow-hidden max-w-sm">
                <div className="absolute top-1.5 bottom-1.5 left-1.5 right-1.5 pointer-events-none">
                    <motion.div
                        className="h-full bg-white dark:bg-zinc-700 shadow-md rounded-xl md:rounded-full border border-zinc-200 dark:border-zinc-600"
                        style={{ width: "50%" }}
                        animate={{ x: layout === 'grid' ? '0%' : '100%' }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                </div>

                <div className="relative z-10 grid grid-cols-2">
                    <button
                        onClick={() => applyLayout('grid')}
                        className={cn(
                            "flex items-center justify-center gap-2 py-3 px-4 transition-colors",
                            layout === 'grid' ? "text-zinc-950 dark:text-white font-bold" : "text-zinc-500 font-medium hover:text-zinc-700 dark:hover:text-zinc-300"
                        )}
                    >
                        {layout === 'grid' ? <Check size={18} /> : <LayoutGrid size={18} />}
                        <span className="text-xs md:text-sm">Tarjetas</span>
                    </button>
                    <button
                        onClick={() => applyLayout('linear')}
                        className={cn(
                            "flex items-center justify-center gap-2 py-3 px-4 transition-colors",
                            layout === 'linear' ? "text-zinc-950 dark:text-white font-bold" : "text-zinc-500 font-medium hover:text-zinc-700 dark:hover:text-zinc-300"
                        )}
                    >
                        {layout === 'linear' ? <Check size={18} /> : <List size={18} />}
                        <span className="text-xs md:text-sm">Lineal</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
