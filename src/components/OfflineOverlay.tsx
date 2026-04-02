'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOffIcon } from './icons/WifiOffIcon'

/**
 * OfflineOverlay v1.0
 * Detects online/offline status and shows a premium, themed fallback.
 */
export default function OfflineOverlay() {
    const [isOffline, setIsOffline] = useState(false)

    useEffect(() => {
        // Initial check
        if (typeof window !== 'undefined') {
            setIsOffline(!window.navigator.onLine)
        }

        const handleOnline = () => setIsOffline(false)
        const handleOffline = () => setIsOffline(true)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    return (
        <AnimatePresence>
            {isOffline && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-6 bg-background/80 backdrop-blur-md transition-colors duration-300"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        className="flex flex-col items-center text-center max-w-[280px]"
                    >
                        <div className="mb-8 p-6 rounded-3xl bg-surface/50 border border-border shadow-xl">
                            <WifiOffIcon className="w-16 h-16 text-foreground" />
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-3">
                            Ups, algo salió mal
                        </h1>

                        <p className="text-secondary font-medium leading-relaxed mb-8">
                            No se pudo establecer conexión con el servidor. Por favor, verifica tu internet.
                        </p>

                        <button
                            onClick={() => window.location.reload()}
                            className="bg-primary text-background px-8 py-3 rounded-full font-semibold shadow-lg active:scale-95 transition-transform"
                        >
                            Reintentar
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
