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
            staticOverlay.style.opacity = '0'
            setTimeout(() => staticOverlay.remove(), 500)
        }

        // Auto-dismiss after scaling duration + pause
        const timer = setTimeout(() => {
            setIsVisible(false)
        }, 2200)

        return () => clearTimeout(timer)
    }, [])

    if (!mounted) return null

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-black overflow-hidden pointer-events-none"
                >
                    <div className="relative flex flex-col items-center">
                        <motion.div
                            initial={{ scale: 0.2, opacity: 0 }}
                            animate={{ 
                                scale: [0.2, 1.25, 1],
                                opacity: 1 
                            }}
                            transition={{ 
                                duration: 1.5, 
                                ease: [0.16, 1, 0.3, 1], // Custom bounce/smooth ease
                                delay: 0.1,
                                times: [0, 0.7, 1] // Keyframe timing
                            }}
                        >
                            {/* Logo Gigante v2.0 (84 is double the previous size) */}
                            <Logo size={84} className="ml-0 mr-0 translate-y-0" />
                        </motion.div>
                        
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 0.6, y: 0 }}
                            transition={{ delay: 1.0, duration: 1.0 }}
                            className="absolute -bottom-24"
                        >
                            <span className="text-xs font-black uppercase tracking-[0.6em] text-zinc-400 dark:text-zinc-600">
                                DoReady v3.5.1
                            </span>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
