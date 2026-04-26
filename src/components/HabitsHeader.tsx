'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import CreateHabitModal from './CreateHabitModal'

interface HabitsHeaderProps {
    isToday: boolean
    completedCount: number
    totalCount: number
}

export default function HabitsHeader({ isToday, completedCount, totalCount }: HabitsHeaderProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <>
            <header className="flex flex-col gap-1 px-4 flex-shrink-0 animate-in fade-in slide-in-from-top-4 duration-1000 transition-all duration-300">
                <div className="flex items-end justify-between">
                    <h1 className="font-bold text-6xl md:text-8xl tracking-tighter text-zinc-900 dark:text-zinc-50 relative bottom-1.5 whitespace-nowrap">
                        {isToday ? "Habits" : "Historial"}
                    </h1>
                    <div className="bg-zinc-200 dark:bg-zinc-800 rounded-full px-6 py-2.5 mt-2 mb-1 flex items-center justify-center">
                        <span className="text-4xl md:text-5xl font-light text-zinc-600 dark:text-zinc-300">
                            {completedCount}/{totalCount}
                        </span>
                    </div>
                </div>
            </header>
            
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="flex items-center gap-1.5 px-4 mt-6 mb-8"
            >
                <div className="flex items-center">
                    <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Hábitos</span>
                </div>

                <motion.button
                    onClick={() => setIsModalOpen(true)}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    className="bg-zinc-100 dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-full w-[54px] h-[54px] flex items-center justify-center hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-950 transition-all duration-300 cursor-pointer flex-shrink-0"
                    title="Añadir Hábito"
                >
                    <Plus size={24} className="text-zinc-900 dark:text-zinc-50 group-hover:text-inherit" strokeWidth={3} />
                </motion.button>
            </motion.div>

            <CreateHabitModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                onHabitCreated={() => {}} 
            />
        </>
    )
}

