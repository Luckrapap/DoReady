'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

// Sub-component that signals that the navigation is "done" from a render perspective
function NavigationStopHandler() {
    useEffect(() => {
        // Dispatch instantáneo cuando este componente se monta en el DOM
        window.dispatchEvent(new Event('navigation-stop'))
    }, [])
    return null
}

export default function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="w-full h-full"
            >
                <NavigationStopHandler />
                {children}
            </motion.div>
        </AnimatePresence>
    )
}
