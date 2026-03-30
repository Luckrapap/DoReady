'use client'

import { motion } from 'framer-motion'
import { Check, Trash2 } from 'lucide-react'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { cn } from '@/utils/utils'

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

    const handleToggle = () => {
        // Haptic feedback
        if (!isCompleted) {
            Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {})
        } else {
            Haptics.impact({ style: ImpactStyle.Light }).catch(() => {})
        }
        onToggle()
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "group relative flex items-center gap-5 p-5 rounded-3xl transition-all duration-300 tap-highlight-transparent",
                isCompleted ? "bg-opacity-50" : "bg-opacity-100"
            )}
            style={{ 
                backgroundColor: 'var(--surface)', 
                border: '1px solid',
                borderColor: isCompleted ? 'var(--accent)' : 'var(--border)'
            }}
        >
            {/* Checkbox - 44px for primary mobile action */}
            <div 
                onClick={handleToggle}
                className={cn(
                    "flex-shrink-0 w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative overflow-hidden cursor-pointer active:scale-90",
                    isCompleted ? "border-transparent" : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500"
                )}
                style={isCompleted ? { backgroundColor: 'var(--accent)' } : {}}
            >
                <motion.div
                    initial={false}
                    animate={{ scale: isCompleted ? 1.1 : 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                    <Check size={22} strokeWidth={3} className="text-white" />
                </motion.div>
            </div>

            {/* Title */}
            <div className="flex-1 flex flex-col justify-center min-w-0">
                <span className={cn(
                    "text-xl font-medium transition-all duration-300 truncate",
                    isCompleted ? "text-zinc-500 dark:text-zinc-400 line-through decoration-zinc-400/50" : "text-zinc-900 dark:text-zinc-100"
                )}>
                    {task.title}
                </span>
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation()
                    onDelete()
                }}
                className="p-3 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all active:scale-90"
                aria-label="Delete task"
            >
                <Trash2 size={20} />
            </button>

            {/* Subtle background glow when completed */}
            {isCompleted && (
                <div 
                    className="absolute inset-0 rounded-3xl opacity-5 pointer-events-none"
                    style={{ backgroundColor: 'var(--accent)' }}
                />
            )}
        </motion.div>
    )
}
