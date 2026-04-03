'use client'

import { useState, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import ThreeDotsLoading from './ThreeDotsLoading'

export default function NavigationLoader() {
    const [isLoading, setIsLoading] = useState(false)
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Efecto inteligente: espera 600ms después de que Next.js cambie la ruta
    useEffect(() => {
        if (!isLoading) return;
        
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 600)
        
        return () => clearTimeout(timer)
    }, [pathname, searchParams, isLoading])

    useEffect(() => {
        let safetyTimeout: NodeJS.Timeout | null = null

        const handleStart = () => {
            setIsLoading(true)
            // Timeout de seguridad: detiene la carga tras 4s si algo falla
            if (safetyTimeout) clearTimeout(safetyTimeout)
            safetyTimeout = setTimeout(() => {
                setIsLoading(false)
            }, 4000)
        }

        const handleStop = () => {
            // Detención inmediata para eventos de cancelación directos
            setIsLoading(false)
            if (safetyTimeout) clearTimeout(safetyTimeout)
        }

        window.addEventListener('navigation-start', handleStart)
        window.addEventListener('navigation-stop', handleStop)
        window.addEventListener('close-mobile-drawer', handleStop)

        return () => {
            window.removeEventListener('navigation-start', handleStart)
            window.removeEventListener('navigation-stop', handleStop)
            window.removeEventListener('close-mobile-drawer', handleStop)
            if (safetyTimeout) clearTimeout(safetyTimeout)
        }
    }, [])

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-[999] flex items-center justify-center bg-white/70 dark:bg-black/50 backdrop-blur-md pointer-events-auto"
                >
                    <div className="flex flex-col items-center gap-8">
                        <ThreeDotsLoading />
                        <div className="flex flex-col items-center">
                            <span className="text-zinc-900/90 dark:text-white/90 font-bold text-3xl tracking-widest uppercase text-center">Cargando...</span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
