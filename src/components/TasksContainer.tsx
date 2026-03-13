'use client'

import { useState, useEffect } from 'react'
import confetti from 'canvas-confetti'
import { updateTaskStatus, deleteTask } from '@/app/actions/tasks'
import CreateTaskInput from './CreateTaskInput'
import DailyProgress from './DailyProgress'
import { AnimatePresence, motion } from 'framer-motion'
import TaskItem from './TaskItem'

interface Task {
    id: string
    title: string
    is_completed: boolean
}

interface TasksContainerProps {
    initialTasks: Task[]
    dateStr: string
}

export default function TasksContainer({ initialTasks, dateStr }: TasksContainerProps) {
    const [tasks, setTasks] = useState(initialTasks)

    // Sync with server changes (e.g., when a new task is added or page loads)
    useEffect(() => {
        setTasks(initialTasks)
    }, [initialTasks])

    const completedCount = tasks.filter(t => t.is_completed).length
    const totalCount = tasks.length

    const handleToggle = async (id: string, currentStatus: boolean) => {
        const newStatus = !currentStatus

        // Optimistic Update
        const updatedTasks = tasks.map(t =>
            t.id === id ? { ...t, is_completed: newStatus } : t
        )
        setTasks(updatedTasks)

        // Check for confetti: If we just completed a task, and now ALL are complete
        const newCompletedCount = updatedTasks.filter(t => t.is_completed).length
        if (newStatus && newCompletedCount === totalCount && totalCount > 0) {
            const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: [accentColor, '#ffffff', '#a1a1aa'] 
            })
        }

        // Server Update
        const success = await updateTaskStatus(id, newStatus)
        if (!success) {
            // Revert if failed
            setTasks(tasks)
        }
    }

    const handleDelete = async (id: string) => {
        // Optimistic Update
        const updatedTasks = tasks.filter(t => t.id !== id)
        setTasks(updatedTasks)

        // Server Update
        const success = await deleteTask(id)
        if (!success) {
            // Revert if failed
            setTasks(tasks)
        }
    }

    return (
        <section className="flex flex-col gap-6">
            <DailyProgress completed={completedCount} total={totalCount} />

            <div>
                <h2 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] mb-4 ml-1">Tareas</h2>
                <CreateTaskInput dateStr={dateStr} />
            </div>

            <div className="flex flex-col gap-4">
                {tasks.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-16 transition-colors duration-500 border border-dashed rounded-[32px] gap-4"
                        style={{
                            backgroundColor: 'color-mix(in srgb, var(--surface) 20%, transparent)',
                            borderColor: 'var(--border)'
                        }}
                    >
                        <div
                            className="w-16 h-16 flex items-center justify-center rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm"
                        >
                            <span className="text-3xl">🌱</span>
                        </div>
                        <div className="text-center">
                            <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-lg">Un nuevo comienzo</p>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-[240px]">¿Qué es lo más importante que quieres lograr hoy?</p>
                        </div>
                    </motion.div>
                ) : (
                    <AnimatePresence mode="popLayout" initial={false}>
                        {tasks.map((task) => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                onToggle={() => handleToggle(task.id, task.is_completed)}
                                onDelete={() => handleDelete(task.id)}
                            />
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </section>
    )
}
