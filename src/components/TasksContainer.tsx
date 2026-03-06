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
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#000000', '#ffffff', '#a1a1aa', '#3f3f46'] // Neutral / Dark mode friendly
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
        <section>
            <DailyProgress completed={completedCount} total={totalCount} />

            <div className="mb-6">
                <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-3">Tasks</h2>
                <CreateTaskInput dateStr={dateStr} />
            </div>

            <div className="w-full mt-6 flex flex-col">
                {tasks.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-16 transition-colors duration-500 border border-dashed rounded-2xl gap-3"
                        style={{
                            backgroundColor: 'color-mix(in srgb, var(--surface) 20%, transparent)',
                            borderColor: 'var(--border)'
                        }}
                    >
                        <div className="w-16 h-16 shadow-sm rounded-full flex items-center justify-center mb-2"
                            style={{ backgroundColor: 'var(--surface)' }}
                        >
                            <span className="text-2xl">🌱</span>
                        </div>
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">A fresh start</p>
                        <p className="text-sm text-center max-w-[200px] text-zinc-500">What is the one thing you want to accomplish today?</p>
                    </motion.div>
                ) : (
                    <AnimatePresence mode="popLayout">
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
