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
        const handleStart = () => setIsLoading(true)
        const handleStop = () => setIsLoading(false)

        window.addEventListener('navigation-start', handleStart)
        window.addEventListener('navigation-stop', handleStop)
        window.addEventListener('close-mobile-drawer', handleStop) // Fallback if clicking same page

        return () => {
            window.removeEventListener('navigation-start', handleStart)
            window.removeEventListener('navigation-stop', handleStop)
            window.removeEventListener('close-mobile-drawer', handleStop)
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
                    className="fixed inset-0 z-[999] flex items-center justify-center bg-white/70 dark:bg-black/50 backdrop-blur-md pointer-events-auto"
                >
                    <div className="flex flex-col items-center gap-8">
                        <ThreeDotsLoading />
                        <span className="text-zinc-900/90 dark:text-white/90 font-bold text-3xl tracking-widest uppercase">Cargando...</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
