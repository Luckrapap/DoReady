'use client'

import { useState, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import ThreeDotsLoading from './ThreeDotsLoading'

export default function NavigationLoader() {
    const [isLoading, setIsLoading] = useState(false)
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        // Al detectar un cambio en pathname o searchParams, detenemos la carga.
        setIsLoading(false)
    }, [pathname, searchParams])

    useEffect(() => {
        let timeoutId: NodeJS.Timeout | null = null

        const handleStart = () => {
            setIsLoading(true)
            // Safety timeout: stop loading after 4 seconds to prevent "infinite" state
            if (timeoutId) clearTimeout(timeoutId)
            timeoutId = setTimeout(() => {
                setIsLoading(false)
            }, 4000)
        }

        const handleStop = () => {
            setIsLoading(false)
            if (timeoutId) clearTimeout(timeoutId)
        }

        window.addEventListener('navigation-start', handleStart)
        window.addEventListener('navigation-stop', handleStop)
        window.addEventListener('close-mobile-drawer', handleStop)

        return () => {
            window.removeEventListener('navigation-start', handleStart)
            window.removeEventListener('navigation-stop', handleStop)
            window.removeEventListener('close-mobile-drawer', handleStop)
            if (timeoutId) clearTimeout(timeoutId)
        }
    }, [])

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setIsLoading(false)} // Manual override
                    className="fixed inset-0 z-[999] flex items-center justify-center bg-white/70 dark:bg-black/50 backdrop-blur-md pointer-events-auto cursor-pointer"
                >
                    <div className="flex flex-col items-center gap-8">
                        <ThreeDotsLoading />
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-zinc-900/90 dark:text-white/90 font-bold text-3xl tracking-widest uppercase">Cargando...</span>
                            <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.3em]">BUILD v3.1 • Sync-Fix-Enabled</span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
