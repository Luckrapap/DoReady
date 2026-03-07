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
        <div
            className="group flex items-center gap-4 p-4 rounded-2xl border shadow-sm transition-all duration-300 hover:shadow-md"
            style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)'
            }}
        >
            <div className="flex items-center gap-4 flex-1">
                <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={onToggle}
                    className={`flex-shrink-0 flex items-center justify-center w-8 h-8 md:w-6 md:h-6 rounded-full border transition-all duration-300 ${isCompleted
                        ? 'text-white dark:text-black border-transparent scale-110'
                        : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-500 dark:hover:border-zinc-400'
                        }`}
                    style={isCompleted ? { backgroundColor: 'var(--accent)' } : {}}
                >
                    {isCompleted && <Check size={16} strokeWidth={4} />}
                </motion.button>

                <div className="relative flex-1 group/text">
                    <span
                        className={`text-base transition-all duration-500 ${isCompleted
                            ? 'text-zinc-400 dark:text-zinc-600'
                            : 'text-zinc-800 dark:text-zinc-200'
                            }`}
                    >
                        {task.title}
                    </span>
                    <motion.div
                        initial={false}
                        animate={{ 
                            width: isCompleted ? '100%' : '0%',
                            opacity: isCompleted ? 1 : 0
                        }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-zinc-400 dark:bg-zinc-600 rounded-full"
                        style={{ pointerEvents: 'none' }}
                    />
                </div>
            </div>

            <button
                onClick={onDelete}
                className="opacity-100 md:opacity-0 group-hover:opacity-100 p-3 -mr-2 text-zinc-400 hover:text-red-500 transition-colors"
                aria-label="Delete task"
            >
                <Trash2 size={20} />
            </button>
        </div>
    )
}
