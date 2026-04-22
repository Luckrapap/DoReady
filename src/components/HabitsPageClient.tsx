'use client'

import { useState } from 'react'
import { toggleHabitLog, deleteHabit, createHabit, saveHabitsOrder, getHabits } from '@/app/actions/habits'
import HabitsContainer from '@/components/HabitsContainer'
import { motion } from 'framer-motion'
import { cn } from '@/utils/utils'

interface HabitsPageClientProps {
    initialHabits: any[]
    dateStr: string
    isToday: boolean
}

export default function HabitsPageClient({ 
    initialHabits: serverHabits, 
    dateStr, 
    isToday 
}: HabitsPageClientProps) {
    const [habits, setHabits] = useState<any[]>(serverHabits)
    const [isReorderMode, setIsReorderMode] = useState(false)

    const fetchHabits = async () => {
        try {
            const updatedHabits = await getHabits(dateStr)
            setHabits(updatedHabits)
        } catch (error) {
            console.error("Error cargando hábitos:", error)
        }
    }

    const handleToggle = async (id: string, isCompleted: boolean) => {
        // Optimistic update in client
        setHabits(prev => prev.map(h => h.id === id ? { ...h, is_completed: isCompleted } : h))
        const success = await toggleHabitLog(id, dateStr, isCompleted)
        if (!success) {
            // Revert if failed
            setHabits(prev => prev.map(h => h.id === id ? { ...h, is_completed: !isCompleted } : h))
        }
    }

    const handleDelete = async (id: string) => {
        setHabits(prev => prev.filter(h => h.id !== id))
        const success = await deleteHabit(id)
        if (!success) fetchHabits() // Refresh if failed
    }

    const handleCreate = async (title: string) => {
        const newHabit = await createHabit(title)
        if (newHabit) {
            setHabits(prev => [...prev, { ...newHabit, is_completed: false }])
        }
    }

    const handleSaveOrder = async (orderedHabits: any[]) => {
        setHabits(orderedHabits)
        await saveHabitsOrder(orderedHabits)
    }

    return (
        <main
            className={cn(
                "h-[100dvh] flex justify-center pt-safe-top pb-12 px-1 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black overflow-hidden font-outfit transition-colors duration-300",
                isReorderMode && "bg-black/5 dark:bg-black/40"
            )}
            style={!isReorderMode ? { backgroundColor: 'var(--background)' } : {}}
        >
            <div className="w-full max-w-xl h-full flex flex-col pt-8">
                <section className="flex flex-col h-full min-h-0">
                    <motion.div
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        className="h-full w-full bg-[var(--background)]"
                    >
                        <HabitsContainer 
                            initialHabits={habits} 
                            dateStr={dateStr} 
                            isToday={isToday}
                            isReorderMode={isReorderMode}
                            setIsReorderMode={setIsReorderMode}
                            onToggle={handleToggle}
                            onDelete={handleDelete}
                            onCreate={handleCreate}
                            onSaveOrder={handleSaveOrder}
                        />
                    </motion.div>
                </section>
            </div>
        </main>
    )
}
