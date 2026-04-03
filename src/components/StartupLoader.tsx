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

        // Auto-dismiss after 1.3 seconds (ChatGPT snappy style)
        const timer = setTimeout(() => {
            setIsVisible(false)
        }, 1300)

        return () => clearTimeout(timer)
    }, [])

    if (!mounted) return null

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black overflow-hidden pointer-events-none"
                >
                    <div className="relative flex flex-col items-center">
                        <motion.div
                            initial={{ scale: 1, opacity: 1 }}
                            animate={{ scale: 1.15 }}
                            transition={{ 
                                duration: 1.3, 
                                ease: "easeOut"
                            }}
                        >
                            {/* Logo Perfect v3.5.3 (Matches static shell) */}
                            <Logo size={72} className="ml-0 mr-0 translate-y-0" />
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
