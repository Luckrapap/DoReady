'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Logo from './Logo'

export default function StartupLoader() {
    const [isVisible, setIsVisible] = useState(true)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        // Auto-dismiss after 1.8 seconds (duration of scaling + slight pause)
        const timer = setTimeout(() => {
            setIsVisible(false)
        }, 1800)

        return () => clearTimeout(timer)
    }, [])

    if (!mounted) return null

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-black overflow-hidden pointer-events-none"
                >
                    <div className="relative flex flex-col items-center">
                        {/* Custom Animated Logo Container */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ 
                                duration: 1.2, 
                                ease: [0.16, 1, 0.3, 1], // Custom bounce/smooth ease
                                delay: 0.1
                            }}
                        >
                            {/* We use the Logo component but override its margins for centering */}
                            <Logo size={42} className="ml-0 mr-0 translate-y-0" />
                        </motion.div>
                        
                        {/* Optional subtle tagline or version if needed in future */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 0.4, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.8 }}
                            className="absolute -bottom-16"
                        >
                            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-600">
                                DoReady v3.5
                            </span>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
