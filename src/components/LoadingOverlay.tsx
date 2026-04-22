'use client'

import { motion } from 'framer-motion'
import ThreeDotsLoading from './ThreeDotsLoading'
import { cn } from '@/utils/utils'

interface LoadingOverlayProps {
    message?: string
    fullScreen?: boolean
    className?: string
    seamless?: boolean
}

export function LoadingOverlay({ 
    message = "Cargando...", 
    fullScreen = true,
    className,
    seamless = false
}: LoadingOverlayProps) {
    return (
        <motion.div
            initial={{ opacity: seamless ? 1 : 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "linear" }}
            className={cn(
                "z-[999] flex flex-col items-center justify-center gap-8",
                fullScreen 
                    ? "fixed inset-0 bg-white/70 dark:bg-black/50 backdrop-blur-md pointer-events-auto"
                    : "w-full py-20 px-4",
                className
            )}
        >
            <div className="relative flex flex-col items-center gap-8">
                {/* Visual Anchor: Three Dots */}
                <ThreeDotsLoading />
                
                {/* Typography: Larger, Bold Loading message */}
                <div className="flex flex-col items-center">
                    <span className="text-zinc-900/90 dark:text-white/90 font-bold text-5xl md:text-7xl tracking-tighter text-center select-none">
                        {message}
                    </span>
                </div>
            </div>
        </motion.div>
    )
}
