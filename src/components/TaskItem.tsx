'use client'

import { motion } from 'framer-motion'
import { Check, Trash2 } from 'lucide-react'

interface Task {
    id: string
    title: string
    is_completed: boolean
}

interface TaskItemProps {
    task: Task
    onToggle: () => void
    onDelete: () => void
}

export default function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
    const isCompleted = task.is_completed

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ scale: 1.01 }}
            className="group flex items-center gap-4 p-4 rounded-2xl border shadow-sm transition-all duration-300"
            style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)'
            }}
        >
            <div className="flex items-center gap-4 flex-1">
                <button
                    onClick={onToggle}
                    className={`flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full border transition-colors ${isCompleted
                        ? 'text-white dark:text-black'
                        : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-500 dark:hover:border-zinc-400'
                        }`}
                    style={isCompleted ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)' } : {}}
                >
                    {isCompleted && <Check size={14} strokeWidth={3} />}
                </button>

                <span
                    className={`text-base flex-1 transition-all ${isCompleted
                        ? 'text-zinc-400 dark:text-zinc-600 line-through'
                        : 'text-zinc-800 dark:text-zinc-200'
                        }`}
                    style={isCompleted ? { textDecorationColor: 'var(--border)' } : {}}
                >
                    {task.title}
                </span>
            </div>

            <button
                onClick={onDelete}
                className="opacity-0 group-hover:opacity-100 p-2 text-zinc-400 hover:text-red-500 transition-colors"
                aria-label="Delete task"
            >
                <Trash2 size={18} />
            </button>
        </motion.div>
    )
}
