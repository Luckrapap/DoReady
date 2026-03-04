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
            className="group flex items-center justify-between p-4 mb-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm hover:shadow-md transition-all"
        >
            <div className="flex items-center gap-4 flex-1">
                <button
                    onClick={onToggle}
                    className={`flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full border transition-colors ${isCompleted
                        ? 'bg-black border-black text-white dark:bg-white dark:border-white dark:text-black'
                        : 'border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white'
                        }`}
                >
                    {isCompleted && <Check size={14} strokeWidth={3} />}
                </button>

                <span
                    className={`text-base flex-1 transition-all ${isCompleted
                        ? 'text-zinc-400 dark:text-zinc-600 line-through decoration-zinc-300 dark:decoration-zinc-700'
                        : 'text-zinc-800 dark:text-zinc-200'
                        }`}
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
