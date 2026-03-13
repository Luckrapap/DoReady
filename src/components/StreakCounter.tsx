'use client'

import { Flame } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/utils'

export default function StreakCounter({ streak }: { streak: number }) {
    if (streak === 0) return null

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-500 rounded-full border border-orange-200 dark:border-orange-900/50 shadow-sm"
        >
            <Flame size={16} className={cn(streak > 2 && "fill-orange-500")} />
            <span className="text-sm font-bold tracking-tight">{streak} Día{streak !== 1 ? 's' : ''}</span>
        </motion.div>
    )
}
