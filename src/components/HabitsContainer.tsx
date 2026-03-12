'use client'

import { useState, useOptimistic, useTransition } from 'react'

import HabitItem from './HabitItem'
import HabitOptionsModal from './HabitOptionsModal'
import { motion, AnimatePresence } from 'framer-motion'
import { reorderHabit } from '@/app/actions/habits'

type Habit = {
    id: string;
    title: string;
    is_completed: boolean;
    created_at: string;
}

type HabitsContainerProps = {
    initialHabits: Habit[];
    dateStr: string;
}

export default function HabitsContainer({ initialHabits, dateStr }: HabitsContainerProps) {
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null)

    const [isPending, startTransition] = useTransition()

    // Setup optimistic UI state using the props from the server payload
    const [optimisticHabits, addOptimisticHabit] = useOptimistic(
        initialHabits,
        (state: Habit[], newHabitStatus: { id: string, is_completed: boolean } | { type: 'delete', id: string } | { type: 'refresh', habits: Habit[] } | { type: 'reorder', id: string, created_at: string }) => {
            if ('type' in newHabitStatus) {
                if (newHabitStatus.type === 'delete') {
                    return state.filter(h => h.id !== newHabitStatus.id);
                } else if (newHabitStatus.type === 'refresh') {
                    return newHabitStatus.habits;
                } else if (newHabitStatus.type === 'reorder') {
                    return state.map(h => h.id === newHabitStatus.id ? { ...h, created_at: newHabitStatus.created_at } : h);
                }
            }
            // Toggle scenario
            return state.map(habit => 
                habit.id === newHabitStatus.id
                    ? { ...habit, is_completed: newHabitStatus.is_completed } 
                    : habit
            );
        }
    )

    const handleHabitCreated = () => {
        // Just trigger a re-fetch/refresh by updating the location or you can pass down a prop
        // We'll trust the Next.js revalidatePath to refresh the page data
        // which then flows back into initialHabits
    }

    const handleStatusChange = (habitId: string, isCompleted: boolean) => {
        addOptimisticHabit({ id: habitId, is_completed: isCompleted })
    }

    const handleDelete = (habitId: string) => {
        addOptimisticHabit({ type: 'delete', id: habitId })
    }
    
    const sortedHabits = [...optimisticHabits].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const handleMoveUp = async (habitId: string) => {
        const index = sortedHabits.findIndex(h => h.id === habitId)
        if (index <= 0) return
        
        let newTime: number;
        if (index === 1) {
            newTime = new Date(sortedHabits[0].created_at).getTime() - 60000;
        } else {
            newTime = (new Date(sortedHabits[index - 1].created_at).getTime() + new Date(sortedHabits[index - 2].created_at).getTime()) / 2;
        }
        
        const newCreatedAt = new Date(newTime).toISOString()
        
        startTransition(() => {
            addOptimisticHabit({ type: 'reorder', id: habitId, created_at: newCreatedAt })
            setEditingHabit(prev => prev ? { ...prev, created_at: newCreatedAt } : null)
        })
        await reorderHabit(habitId, newCreatedAt)
    }

    const handleMoveDown = async (habitId: string) => {
        const index = sortedHabits.findIndex(h => h.id === habitId)
        if (index === -1 || index === sortedHabits.length - 1) return
        
        let newTime: number;
        if (index === sortedHabits.length - 2) {
            newTime = new Date(sortedHabits[sortedHabits.length - 1].created_at).getTime() + 60000;
        } else {
            newTime = (new Date(sortedHabits[index + 1].created_at).getTime() + new Date(sortedHabits[index + 2].created_at).getTime()) / 2;
        }
        
        const newCreatedAt = new Date(newTime).toISOString()
        
        startTransition(() => {
            addOptimisticHabit({ type: 'reorder', id: habitId, created_at: newCreatedAt })
            setEditingHabit(prev => prev ? { ...prev, created_at: newCreatedAt } : null)
        })
        await reorderHabit(habitId, newCreatedAt)
    }

    const completedCount = optimisticHabits.filter(h => h.is_completed).length;
    const totalCount = optimisticHabits.length;

    return (
        <div className="flex flex-col gap-6">
            
            <div className="flex flex-col gap-4">
                <AnimatePresence mode="popLayout">
                    {sortedHabits.length > 0 ? (
                        sortedHabits.map((habit) => (
                            <HabitItem
                                key={habit.id}
                                habit={habit}
                                dateStr={dateStr}
                                onStatusChange={handleStatusChange}
                                onDelete={handleDelete}
                                onEdit={() => setEditingHabit(habit)}
                            />
                        ))
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12 px-4 rounded-2xl border border-dashed"
                            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
                        >
                            <p className="text-zinc-500 dark:text-zinc-400 font-medium">No habits formed yet.</p>
                            <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-1">Start by adding a simple daily goal above.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <HabitOptionsModal
                isOpen={!!editingHabit}
                onClose={() => setEditingHabit(null)}
                habitId={editingHabit?.id || ''}
                initialTitle={editingHabit?.title || ''}
                onHabitUpdated={() => {}}
                onHabitDeleted={handleDelete}
                onMoveUp={editingHabit ? () => handleMoveUp(editingHabit.id) : undefined}
                onMoveDown={editingHabit ? () => handleMoveDown(editingHabit.id) : undefined}
            />
        </div>
    )
}
