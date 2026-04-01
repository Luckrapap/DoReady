'use client'

import { motion } from 'framer-motion'

export default function ThreeDotsLoading() {
    const dotTransition = {
        duration: 0.6,
        repeat: Infinity,
        ease: "easeInOut"
    }

    return (
        <div className="flex items-center justify-center gap-3">
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    animate={{ y: [0, -15, 0] }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    transition={{
                        delay: i * 0.15,
                        duration: 0.6,
                        repeat: Infinity,
                        ease: "easeInOut"
                    } as any}
                    className="w-6 h-6 rounded-full bg-[var(--accent)] shadow-[0_0_15px_var(--accent)]"
                />
            ))}
        </div>
    )
}
