'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface DailyProgressProps {
    completed: number
    total: number
}

export default function DailyProgress({ completed, total }: DailyProgressProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100)

    if (!mounted) return null // Prevent hydration mismatch on animated SVG

    return (
        <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shadow-sm mb-6">
            <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle
                        cx="18" cy="18" r="16"
                        fill="none"
                        className="stroke-zinc-100 dark:stroke-zinc-800"
                        strokeWidth="3.5"
                    />
                    <motion.circle
                        cx="18" cy="18" r="16"
                        fill="none"
                        className="stroke-black dark:stroke-white"
                        strokeWidth="3.5"
                        strokeDasharray="100"
                        initial={{ strokeDashoffset: 100 }}
                        animate={{ strokeDashoffset: 100 - percentage }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        strokeLinecap="round"
                    />
                </svg>
                <span className="absolute text-[10px] font-bold text-zinc-700 dark:text-zinc-300">
                    {percentage}%
                </span>
            </div>

            <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Daily Progress</h3>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {total === 0 ? "No tasks for today" : `${completed} of ${total} tasks completed`}
                </p>
            </div>
        </div>
    )
}
