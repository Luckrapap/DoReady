'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Logo from './Logo'

export default function StartupLoader() {
    const [isVisible, setIsVisible] = useState(true)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        
        // Handover: Find and hide the static CSS overlay once React is ready
        const staticOverlay = document.getElementById('startup-static-overlay')
        if (staticOverlay) {
            // Immediate pull down for absolute coherence
            staticOverlay.style.background = 'transparent'
            setTimeout(() => staticOverlay.remove(), 100)
        }

        // Auto-dismiss after 3 seconds (Cinematic duration)
        const timer = setTimeout(() => {
            setIsVisible(false)
        }, 3000)

        return () => clearTimeout(timer)
    }, [])

    if (!mounted) return null

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "linear" }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black overflow-hidden pointer-events-none"
                >
                    <div className="relative flex flex-col items-center">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1.1, opacity: 1 }}
                            transition={{ 
                                duration: 3, 
                                ease: "linear"
                            }}
                        >
                            {/* Logo Cinematic v3.0 (Balanced Size 72) */}
                            <Logo size={72} className="ml-0 mr-0 translate-y-0" />
                        </motion.div>
                        
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.4 }}
                            transition={{ delay: 1.5, duration: 1.0 }}
                            className="absolute -bottom-24"
                        >
                            <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-zinc-600">
                                DoReady v3.5.2
                            </span>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
