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
            <header className="mb-20 flex flex-col items-center justify-center text-center gap-10">
                <div className="flex flex-col items-center">
                    <h1 className="font-playfair font-medium text-6xl md:text-8xl tracking-tight text-zinc-900 dark:text-zinc-50 py-2">
                        {isToday ? "Hábitos" : "Historial de Hábitos"}
                    </h1>
                </div>
                
                <div className="flex items-center gap-6">
                    <motion.div 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="h-14 px-8 rounded-full flex items-center justify-center text-xl font-bold text-white cursor-default" 
                        style={{ backgroundColor: 'var(--accent)' }}
                    >
                        <span className="opacity-70 mr-4 text-lg uppercase tracking-widest font-bold">Logros</span>
                        {completedCount} / {totalCount}
                    </motion.div>

                    <motion.button
                        onClick={() => setIsModalOpen(true)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        className="h-14 w-14 rounded-full bg-[var(--accent)] text-white flex items-center justify-center group"
                        title="Añadir Hábito"
                    >
                        <Plus size={32} strokeWidth={3} />
                    </motion.button>
                </div>
            </header>

            <CreateHabitModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                onHabitCreated={() => {}} 
            />
        </>
    )
}
