'use client'

import { useState, useOptimistic, startTransition } from 'react'
import CreateHabitInput from './CreateHabitInput'
import HabitItem from './HabitItem'
import { motion, AnimatePresence } from 'framer-motion'

type Habit = {
    id: string;
    title: string;
    is_completed: boolean;
}

type HabitsContainerProps = {
    initialHabits: Habit[];
    dateStr: string;
}

export default function HabitsContainer({ initialHabits, dateStr }: HabitsContainerProps) {
    // Setup optimistic UI state using the props from the server payload
    const [optimisticHabits, addOptimisticHabit] = useOptimistic(
        initialHabits,
        (state: Habit[], newHabitStatus: { id: string, is_completed: boolean } | { type: 'delete', id: string } | { type: 'refresh', habits: Habit[] }) => {
            if ('type' in newHabitStatus) {
                if (newHabitStatus.type === 'delete') {
                    return state.filter(h => h.id !== newHabitStatus.id);
                } else if (newHabitStatus.type === 'refresh') {
                    return newHabitStatus.habits;
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
    
    // Sort habits: incomplete first, then completed. 
    // And alphabetical or by creation within those groups.
    const sortedHabits = [...optimisticHabits].sort((a, b) => {
        if (a.is_completed === b.is_completed) {
            return a.title.localeCompare(b.title);
        }
        return a.is_completed ? 1 : -1;
    });

    const completedCount = optimisticHabits.filter(h => h.is_completed).length;
    const totalCount = optimisticHabits.length;
    const progressPercentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    return (
        <div className="flex flex-col gap-6">
            <CreateHabitInput onHabitCreated={handleHabitCreated} />

            {totalCount > 0 && (
                <div className="flex items-center gap-4 mb-2">
                    <div className="flex-1 bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-500 ease-out"
                            style={{ width: `${progressPercentage}%`, backgroundColor: 'var(--accent)' }}
                            layoutId="progress-bar"
                        />
                    </div>
                    <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 w-12 text-right">
                        {progressPercentage}%
                    </span>
                </div>
            )}

            <div className="flex flex-col gap-3">
                <AnimatePresence mode="popLayout">
                    {sortedHabits.length > 0 ? (
                        sortedHabits.map((habit) => (
                            <HabitItem
                                key={habit.id}
                                habit={habit}
                                dateStr={dateStr}
                                onStatusChange={handleStatusChange}
                                onDelete={handleDelete}
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
        </div>
    )
}
